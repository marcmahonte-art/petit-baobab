import { NextResponse } from "next/server"

const PLANS = [
  {
    id: "decouverte",
    name: "Découverte",
    price: "2000 FCFA",
    period: "",
    oneTime: true,
    credits: 100,
    creditsLabel: "étoiles (sans expiration)",
    features: [
      "100 étoiles sans expiration",
      "Dessin magique (contour simple)",
      "Livres de coloriage",
      "Support par email",
    ],
    color: "purple" as const,
  },
  {
    id: "super_baobab",
    name: "Super Baobab",
    price: "4500 FCFA",
    period: "/ mois",
    credits: 250,
    creditsLabel: "étoiles / mois",
    isPopular: true,
    features: [
      "250 étoiles par mois",
      "Tous les styles de dessin",
      "Livres personnalisés illimités",
      "Support prioritaire",
      "Sans publicité",
    ],
    color: "blue" as const,
  },
  {
    id: "ecole_pro",
    name: "École / Pro",
    price: "25000 FCFA",
    period: "/ mois",
    credits: 1000,
    creditsLabel: "étoiles / mois",
    schoolOnly: true,
    features: [
      "1 000 étoiles par mois",
      "Tous les styles de dessin",
      "Comptes multi-utilisateurs",
      "Export PDF en lot",
      "Support dédié",
      "Tableau de bord professeur",
    ],
    color: "green" as const,
  },
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  // scope=parent  -> on exclut les plans réservés aux écoles (ecole_pro)
  // scope=school  -> on ne renvoie que les éléments pertinents pour une école
  // (les écoles n'achètent que des packs, pas de plan ; on renvoie donc [] )
  const scope = url.searchParams.get("scope")

  let plans = PLANS
  if (scope === "parent") {
    plans = PLANS.filter((p) => !p.schoolOnly)
  } else if (scope === "school") {
    plans = []
  }

  return NextResponse.json({ success: true, plans })
}
