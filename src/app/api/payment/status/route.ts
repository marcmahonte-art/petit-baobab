// GET /api/payment/status?order=<id>&token=<access_token>
// Statut d'une commande pour l'invité (page merci / mes-achats).
// Auth: access_token de la commande (lien magique). Fallback: si la commande
// est encore "pending"/"processing", on re-vérifie auprès de PayDunya
// (utile si l'IPN n'est pas encore arrivé quand le client revient).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { processShopWebhook, type ShopOrderRow } from "@/lib/paydunya/webhook";

export const runtime = "nodejs";

const QuerySchema = z.object({
  order: z.string().uuid(),
  token: z.string().min(20).max(80),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      order: searchParams.get("order"),
      token: searchParams.get("token"),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: order } = await supabase
      .from("shop_orders")
      .select("*")
      .eq("id", parsed.data.order)
      .eq("access_token", parsed.data.token)
      .maybeSingle<ShopOrderRow & { invoice_url: string | null; created_at: string; payment_status: string }>();

    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Si le paiement n'est pas finalisé, tenter une re-vérification PayDunya
    // (couvre le cas: client revenu avant réception de l'IPN)
    if (
      (order.payment_status === "pending" || order.payment_status === "processing") &&
      order.invoice_token
    ) {
      try {
        await processShopWebhook(order.invoice_token);
      } catch (e) {
        console.warn("[payment/status] re-vérification échouée:", (e as Error).message);
      }
    }

    // Relire l'état à jour + téléchargements
    const { data: fresh } = await supabase
      .from("shop_orders")
      .select("id, order_number, first_name, items, total, total_ht, payment_status, status, invoice_number, invoice_url, created_at")
      .eq("id", parsed.data.order)
      .single();

    const { data: downloads } = await supabase
      .from("shop_downloads")
      .select("id, product_id, product_title, token, expires_at, max_downloads, download_count")
      .eq("order_id", parsed.data.order);

    // URL signée de la facture (10 min) si payée
    let invoiceSignedUrl: string | null = null;
    if (fresh?.invoice_url && fresh.payment_status === "paid") {
      const { data: signed } = await supabase.storage
        .from("shop-files")
        .createSignedUrl(fresh.invoice_url, 600);
      invoiceSignedUrl = signed?.signedUrl || null;
    }

    return NextResponse.json({
      order: fresh,
      downloads: (downloads || []).map((d) => ({
        id: d.id,
        product_title: d.product_title,
        token: d.token,
        expires_at: d.expires_at,
        remaining: Math.max(0, d.max_downloads - d.download_count),
      })),
      invoice_signed_url: invoiceSignedUrl,
    });
  } catch (err) {
    console.error("[payment/status] fatal:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
