// ============================================================
// Petit Baobab — API Achat / changement de plan
// ============================================================
// POST /api/billing/subscribe
//
// Distinct du checkout de packs (/api/billing/checkout) :
// ici on achète un PLAN (decouverte / super_baobab / ecole_pro),
// ce qui modifie accounts.plan. Un achat de pack, lui, n'ajoute
// que des étoiles sans toucher au plan.
//
// Règles de ciblage :
//  - ecole_pro est réservé aux comptes école (plan ecole_pro).
//    Un particulier ne peut pas y souscrire.
//  - decouverte / super_baobab sont réservés aux particuliers.

import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { createCheckout } from "@/lib/payments";
import { findPlan, PAID_PLANS } from "@/lib/payments/types";

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté pour souscrire à un plan." }, { status: 401 });
    }

    const supabase = await getSupabaseServer();
    const { data: account, error: accErr } = await supabase
      .from("accounts")
      .select("id, plan")
      .eq("user_id", user.id)
      .single();

    if (accErr || !account) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const planId = typeof body?.planId === "string" ? body.planId : "";
    const plan = findPlan(planId);

    if (!plan) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }

    // Ciblage : un particulier ne peut pas souscrire au plan école.
    if (plan.schoolOnly && account.plan !== "ecole_pro") {
      return NextResponse.json(
        { error: "Ce plan est réservé aux structures scolaires." },
        { status: 403 }
      );
    }

    const origin = new URL(request.url).origin;
    const result = await createCheckout({
      accountId: account.id,
      planId: plan.id,
      amountXof: plan.price_xof,
      stars: plan.stars,
      label: plan.name,
      successUrl: `${origin}/parents?purchase=success`,
      cancelUrl: `${origin}/parents?purchase=cancel`,
    });

    return NextResponse.json({ available: true, checkoutUrl: result.checkoutUrl });
  } catch (error: any) {
    console.error("Billing subscribe API error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la préparation du paiement." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    available: true,
    plans: PAID_PLANS,
    message: "Paiement via PayDunya — Orange Money, Moov Money et carte bancaire",
  });
}
