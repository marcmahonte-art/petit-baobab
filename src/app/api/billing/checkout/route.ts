// ============================================================
// Petit Baobab — API Achat d'étoiles (checkout)
// ============================================================
// POST /api/billing/checkout
//
// Crée une facture PayDunya pour un pack d'étoiles et renvoie
// l'URL de paiement. Au retour du paiement, le webhook PayDunya
// (/api/billing/webhook/paydunya) crédite le solde via
// `adjustStars(accountId, +stars, 'purchase', referenceId)`.

import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { createCheckout } from "@/lib/payments";
import { findPack, STARS_PACKS } from "@/lib/payments/types";

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté pour acheter des étoiles." }, { status: 401 });
    }

    const supabase = await getSupabaseServer();
    const { data: account, error: accErr } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (accErr || !account) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const packId = typeof body?.packId === "string" ? body.packId : "";
    const pack = findPack(packId);

    if (!pack) {
      return NextResponse.json({ error: "Pack invalide." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const result = await createCheckout({
      accountId: account.id,
      packId: pack.id,
      amountXof: pack.price_xof,
      stars: pack.stars,
      label: pack.label,
      successUrl: `${origin}/parents?purchase=success`,
      cancelUrl: `${origin}/parents?purchase=cancel`,
    });

    return NextResponse.json({ available: true, checkoutUrl: result.checkoutUrl });
  } catch (error: any) {
    console.error("Billing checkout API error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la préparation du paiement." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    available: true,
    packs: STARS_PACKS,
    message: "Paiement via PayDunya — Orange Money, Moov Money et carte bancaire",
  });
}
