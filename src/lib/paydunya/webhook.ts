// Traitement métier du webhook PayDunya boutique.
// - Idempotence via shop_webhook_events (unique invoice_token+status)
// - Vérification serveur du statut (verifyInvoice) et du montant
// - Après paiement : downloads + facture PDF + email + WhatsApp
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyInvoice, type PaydunyaInvoiceStatus } from "./verify";
import { generateShopInvoicePdf } from "@/lib/invoices/generate-shop-invoice";
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from "@/lib/emails/send";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp/send";
import { triggerCustomerMagicLinkAfterPurchase } from "@/lib/store/customer-account";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ShopOrderRow {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    unitPrice: number;
    filePath?: string;
  }>;
  total: number;
  total_ht: number;
  payment_status: string;
  status: string;
  invoice_token: string | null;
  access_token: string;
  invoice_number: string | null;
  customer_user_id?: string | null;
}

const PAYMENT_STATUS_MAP: Record<PaydunyaInvoiceStatus, string> = {
  pending: "processing", // IPN reçu mais pas encore payé
  completed: "paid",
  cancelled: "cancelled",
  failed: "failed",
  expired: "expired",
};

export interface WebhookResult {
  ok: boolean;
  deduped?: boolean;
  status?: string;
  error?: string;
}

/** Point d'entrée : traite un IPN pour un invoice_token donné. */
export async function processShopWebhook(
  invoiceToken: string
): Promise<WebhookResult> {
  const supabase = getSupabaseAdmin();

  // 1. Vérité serveur : confirmer auprès de PayDunya
  const verified = await verifyInvoice(invoiceToken);

  // 2. Retrouver la commande liée (via invoice_token, PAS via le body IPN)
  const { data: order, error: orderErr } = await supabase
    .from("shop_orders")
    .select("*")
    .eq("invoice_token", invoiceToken)
    .maybeSingle<ShopOrderRow>();

  if (orderErr || !order) {
    return { ok: false, error: "order_not_found" };
  }

  // 3. Idempotence : événement (token, status) déjà traité ?
  const { error: eventErr } = await supabase
    .from("shop_webhook_events")
    .insert({
      invoice_token: invoiceToken,
      status: verified.status,
      payload: verified.raw,
    });

  if (eventErr) {
    // Violation d'unicité => déjà traité, on sort proprement
    if (eventErr.code === "23505") {
      return { ok: true, deduped: true, status: verified.status };
    }
    // Autre erreur d'insert : on continue (le traitement reste idempotent
    // grâce aux gardes ci-dessous) mais on log.
    console.error("[shop-webhook] event insert error:", eventErr.message);
  }

  // 4. Sécurité : le montant confirmé doit correspondre à la commande
  if (verified.status === "completed" && verified.totalAmount !== order.total) {
    console.error(
      `[shop-webhook] MONTANT INCOHÉRENT order=${order.id} attendu=${order.total} reçu=${verified.totalAmount}`
    );
    await supabase
      .from("shop_orders")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    return { ok: false, error: "amount_mismatch" };
  }

  const paymentStatus = PAYMENT_STATUS_MAP[verified.status];

  // 5. Garde : ne jamais rétrograder une commande déjà payée
  if (order.payment_status === "paid") {
    return { ok: true, deduped: true, status: "paid" };
  }

  // 6. Échec / annulation / expiration
  if (verified.status !== "completed") {
    await supabase
      .from("shop_orders")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (verified.status === "failed" || verified.status === "cancelled") {
      // Email d'échec (non bloquant)
      sendPaymentFailedEmail(order).catch((e) =>
        console.error("[shop-webhook] email échec non envoyé:", e)
      );
    }
    return { ok: true, status: paymentStatus };
  }

  // 7. PAIEMENT RÉUSSI — finaliser la commande
  return finalizePaidOrder(supabase, order, verified.transactionId);
}

async function finalizePaidOrder(
  supabase: SupabaseClient,
  order: ShopOrderRow,
  transactionId: string | null
): Promise<WebhookResult> {
  const now = new Date();

  // 7a. Numéro de facture séquentiel boutique (INV-BQ-YYYYMM-XXXXX)
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `INV-BQ-${yearMonth}-`;
  const { data: lastInv } = await supabase
    .from("shop_orders")
    .select("invoice_number")
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  let seq = 1;
  if (lastInv?.[0]?.invoice_number) {
    const n = parseInt(lastInv[0].invoice_number.replace(prefix, ""), 10);
    if (!isNaN(n)) seq = n + 1;
  }
  const invoiceNumber = `${prefix}${String(seq).padStart(5, "0")}`;

  // 7b. Créer les téléchargements sécurisés (60 jours / 20 max)
  const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();
  const downloadRows = order.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_title: item.title,
    // Chemin du PDF dans le bucket privé shop-files (convention: products/<id>.pdf)
    file_path: item.filePath || `products/${item.productId}.pdf`,
    expires_at: expiresAt,
    max_downloads: 20,
    download_count: 0,
  }));

  const { error: dlErr } = await supabase
    .from("shop_downloads")
    .insert(downloadRows);
  if (dlErr) {
    console.error("[shop-webhook] création downloads échouée:", dlErr.message);
  }

  // 7c. Facture PDF (non bloquant)
  let invoiceUrl: string | null = null;
  try {
    invoiceUrl = await generateShopInvoicePdf({
      invoiceNumber,
      order,
      createdAt: now.toISOString(),
    });
  } catch (e) {
    console.error("[shop-webhook] facture PDF échouée (non bloquant):", e);
  }

  // 7d. Mettre à jour la commande — statut final
  const { error: updErr } = await supabase
    .from("shop_orders")
    .update({
      payment_status: "paid",
      status: "completed",
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      invoice_url: invoiceUrl,
      updated_at: now.toISOString(),
    })
    .eq("id", order.id);

  if (updErr) {
    console.error("[shop-webhook] update commande échoué:", updErr.message);
    return { ok: false, error: updErr.message };
  }

  // 7e. Notifications (non bloquantes — la commande est déjà validée)
  const updatedOrder = { ...order, invoice_number: invoiceNumber };
  sendOrderConfirmationEmail(updatedOrder, invoiceUrl).catch((e) =>
    console.error("[shop-webhook] email confirmation non envoyé:", e)
  );
  sendWhatsAppConfirmation(updatedOrder).catch((e) =>
    console.error("[shop-webhook] WhatsApp non envoyé:", e)
  );

  triggerCustomerMagicLinkAfterPurchase(updatedOrder).catch((e) =>
    console.error("[shop-webhook] lien magique client non envoyé:", e)
  );

  return { ok: true, status: "paid" };
}
