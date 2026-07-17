// ============================================================
// Petit Baobab — API Achat d'étoiles (checkout)
// ============================================================
// POST /api/billing/checkout
//
// NOTE (webhook) : aucun webhook (/api/billing/webhook) n'est créé
// tant que le fournisseur de paiement n'est pas choisi. Une fois
// celui-ci sélectionné (PayDunya, FedaPay, ...), le webhook devra
// vérifier la signature de l'événement et appeler la fonction
// existante `adjustStars(accountId, +stars, 'purchase', referenceId)`
// pour créditer le solde. Le format des events et la vérification
// diffèrent selon le fournisseur — à implémenter au moment venu.
//
// CAS ACTUEL (CAS B) : aucun agrégateur configuré → placeholder 503.
// L'architecture est prête : PaymentProvider + getPaymentProvider().

import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getPaymentProvider } from "@/lib/payments";
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

    const provider = getPaymentProvider();

    if (!provider) {
      // CAS B : aucun agrégateur configuré
      return NextResponse.json(
        {
          error: "Paiement en cours de configuration",
          available: false,
          message:
            "L'achat d'étoiles sera disponible prochainement. Contactez-nous sur WhatsApp pour obtenir des étoiles.",
        },
        { status: 503 }
      );
    }

    const origin = new URL(request.url).origin;
    const result = await provider.createCheckout({
      accountId: account.id,
      packId: pack.id,
      amountXof: pack.price_xof,
      stars: pack.stars,
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
    available: false,
    packs: STARS_PACKS,
    message:
      "Paiement disponible prochainement — Orange Money, Moov Money et carte bancaire",
  });
}
