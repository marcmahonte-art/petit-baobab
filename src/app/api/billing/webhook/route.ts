import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { adjustStars, STARS_REASONS } from "@/lib/auth";

const MASTER_KEY = () => process.env.PAYDUNYA_MASTER_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const invoiceToken = data.invoice_token;
    const hash = data.hash;

    if (!invoiceToken || !hash) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // 1. Vérifier la signature HMAC-SHA512
    const expectedHash = crypto
      .createHash("sha512")
      .update(MASTER_KEY() + invoiceToken)
      .digest("hex");

    if (hash !== expectedHash) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }

    // 2. Idempotence — éviter de double-créditer
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("payments")
      .select("id, status")
      .eq("transaction_id", invoiceToken)
      .maybeSingle();

    if (existing && existing.status === "completed") {
      return NextResponse.json({ ok: true, deduped: true });
    }

    // 3. Vérifier le statut auprès de PayDunya (ne pas se fier au body seul)
    const verifyRes = await fetch(
      `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${invoiceToken}`,
      {
        headers: {
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY || "",
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY || "",
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN || "",
        },
      }
    );

    const verified = await verifyRes.json();

    if (verified.status !== "completed") {
      return NextResponse.json({ ok: true, status: verified.status });
    }

    // 4. Extraire custom_data
    const customData = verified.custom_data || {};
    const accountId: string | undefined = customData.account_id;
    const packId: string | undefined = customData.pack_id;
    const stars = parseInt(customData.stars || "0", 10);

    if (!accountId || stars <= 0) {
      return NextResponse.json({ error: "invalid_custom_data" }, { status: 400 });
    }

    // 5. Créditer les étoiles
    const result = await adjustStars(accountId, stars, STARS_REASONS.PURCHASE, invoiceToken);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "adjust_failed" }, { status: 500 });
    }

    // 6. Enregistrer la transaction dans la table payments
    await supabase.from("payments").upsert({
      user_id: accountId,
      invoice_number: `PD-${invoiceToken}`,
      transaction_id: invoiceToken,
      provider: "paydunya",
      amount: verified.invoice?.total_amount || 0,
      currency: "XOF",
      status: "completed",
      pack_id: packId || null,
      stars_earned: stars,
      payload: verified,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PayDunya webhook error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
