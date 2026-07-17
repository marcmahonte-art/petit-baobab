import { NextResponse } from "next/server"

const PLANS = [
  {
    id: "decouverte",
    name: "Découverte",
    price: "2000 FCFA",
    period: "/ mois",
    credits: 100,
    creditsLabel: "étoiles incluses",
    features: [
      "100 étoiles par mois",
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
    creditsLabel: "étoiles incluses",
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

export async function GET() {
  return NextResponse.json({ success: true, plans: PLANS })
}
