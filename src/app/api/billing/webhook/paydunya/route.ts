import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { adjustStars, STARS_REASONS } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/invoices/generate-invoice";

const MODE = process.env.PAYDUNYA_MODE === "live" ? "live" : "test";

const BASE_URL =
  MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY || "",
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY || "",
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN || "",
  };
}

export async function POST(request: NextRequest) {
  try {
    // PayDunya envoie l'IPN en form-data
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const invoiceToken = data.invoice_token;
    if (!invoiceToken) {
      return NextResponse.json({ error: "missing_invoice_token" }, { status: 400 });
    }

    // 1. Vérification côté serveur : rappeler l'API confirm de PayDunya
    //    (ne JAMAIS faire confiance au body brut de l'IPN)
    const verifyRes = await fetch(
      `${BASE_URL}/checkout-invoice/confirm/${invoiceToken}`,
      { headers: getHeaders() }
    );

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "confirm_failed" }, { status: 502 });
    }

    const verified = await verifyRes.json();

    // 2. Idempotence : si adjust_stars RPC a déjà traité ce reference_id
    //    (le token de facture), la RPC ne crédite pas deux fois.
    //    On vérifie aussi dans la table payments en protection supplémentaire.
    const supabase = getSupabaseAdmin();
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status")
      .eq("transaction_id", invoiceToken)
      .maybeSingle();

    if (existingPayment?.status === "completed") {
      return NextResponse.json({ ok: true, deduped: true });
    }

    // 3. Ne créditer que si le statut confirmé est "completed"
    if (verified.status !== "completed") {
      return NextResponse.json({ ok: true, status: verified.status });
    }

    // 4. Extraire les infos depuis custom_data de la réponse confirmée
    const customData = verified.custom_data || {};
    const accountId: string | undefined = customData.account_id;
    const packId: string | undefined = customData.pack_id;
    const planId: string | undefined = customData.plan_id;
    const stars = parseInt(String(customData.stars || "0"), 10);

    if (!accountId || stars <= 0) {
      return NextResponse.json({ error: "invalid_custom_data" }, { status: 400 });
    }

    // 5. Si c'est un achat de PLAN (plan_id présent) : changer accounts.plan.
    if (planId) {
      const updates: Record<string, any> = {
        plan: planId,
        plan_renewed_at: planId === "ecole_pro" ? new Date().toISOString() : null,
      };

      if (planId === "ecole_pro") {
        updates.stars_balance = 0;
      }

      const { error: planErr } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", accountId);

      if (planErr) {
        return NextResponse.json({ error: planErr.message }, { status: 500 });
      }
    }

    // 6. Créditer les étoiles via adjustStars (RPC atomique avec gestion
    //    d'idempotence par reference_id = invoiceToken)
    const result = await adjustStars(accountId, stars, STARS_REASONS.PURCHASE, invoiceToken);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "adjust_failed" }, { status: 500 });
    }

    // 7. Générer un numéro de facture séquentiel (INV-YYYYMM-XXXXX)
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prefix = `INV-${yearMonth}-`;

    const { data: lastInvoice } = await supabase
      .from("payments")
      .select("invoice_number")
      .like("invoice_number", `${prefix}%`)
      .order("invoice_number", { ascending: false })
      .limit(1);

    let seq = 1;
    if (lastInvoice && lastInvoice.length > 0) {
      const lastNum = parseInt(lastInvoice[0].invoice_number.replace(prefix, ""), 10);
      if (!isNaN(lastNum)) seq = lastNum + 1;
    }
    const invoiceNumber = `${prefix}${String(seq).padStart(5, "0")}`;

    // 8. Récupérer le nom du client pour la facture
    const { data: accountData } = await supabase
      .from("accounts")
      .select("user_id")
      .eq("id", accountId)
      .single();

    let customerName = "Client";
    if (accountData?.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", accountData.user_id)
        .single();
      customerName = profile?.email || "Client";
    }

    // 9. Générer le PDF de la facture et l'uploader dans Supabase Storage
    const planLabel = planId
      ? planId === "ecole_pro" ? "École Pro" : planId === "super_baobab" ? "Super Baobab" : planId === "decouverte" ? "Découverte" : planId
      : packId
        ? `Pack ${stars} ★`
        : null;

    let receiptUrl: string | null = null;
    try {
      receiptUrl = await generateInvoicePdf({
        invoiceNumber,
        accountId,
        customerName,
        amount: verified.invoice?.total_amount || 0,
        currency: "XOF",
        plan: planLabel,
        packLabel: planId ? null : planLabel,
        starsEarned: stars,
        transactionId: invoiceToken,
        createdAt: now.toISOString(),
      });
    } catch (err) {
      console.error("Failed to generate invoice PDF (non-blocking):", err);
    }

    // 10. Persister la transaction dans la table payments (historique côté client)
    await supabase.from("payments").upsert(
      {
        user_id: accountId,
        invoice_number: invoiceNumber,
        transaction_id: invoiceToken,
        provider: "paydunya",
        amount: verified.invoice?.total_amount || 0,
        currency: "XOF",
        status: "completed",
        plan: planId || null,
        pack_id: packId || null,
        stars_earned: stars,
        receipt_url: receiptUrl,
        payload: verified,
        created_at: now.toISOString(),
      },
      { onConflict: "transaction_id" }
    );

    return NextResponse.json({ ok: true, invoice_number: invoiceNumber });
  } catch (err: any) {
    console.error("PayDunya webhook error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
