"use client"

import { PricingCard } from "./pricing-card"
import { motion } from "framer-motion"
import Image from "next/image"

export function PricingSection() {
  const plans = [
    {
      name: "Découverte",
      price: "2 000 FCFA",
      period: "Paiement unique",
      credits: "100",
      creditsLabel: "crédits inclus",
      features: [
        "100 crédits à utiliser quand vous voulez",
        "Tous les styles de dessin",
        "Livres",
        "Téléchargement de vos créations",
        "Aucun délai d'expiration",
      ],
      themeColor: "purple" as const,
    },
    {
      name: "Super Baobab",
      price: "4 500 FCFA",
      period: "Paiement unique",
      credits: "250",
      creditsLabel: "crédits inclus",
      features: [
        "250 crédits à utiliser quand vous voulez",
        "Tous les styles de dessin",
        "Livres",
        "Téléchargement de vos créations",
        "Aucun délai d'expiration",
        "Meilleur rapport qualité / prix",
      ],
      isPopular: true,
      themeColor: "blue" as const,
    },
    {
      name: "École / Pro",
      price: "25 000 FCFA",
      period: "par mois",
      credits: "1 000",
      creditsLabel: "crédits / mois",
      features: [
        "1 000 crédits renouvelés chaque mois",
        "Tous les styles de dessin",
        "Livres et jeux complets",
        "Téléchargement illimité",
        "Gestion multi-utilisateurs",
        "Support prioritaire",
      ],
      themeColor: "green" as const,
    },
  ]

  return (
    <section className="relative w-full rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-10 shadow-lg select-none">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12px] right-[40px] z-20 w-[240px] xl:w-[280px] hidden lg:block pointer-events-none"
      >
        <Image
          src="/illustrations/pricing_illustration.webp"
          alt="Illustration"
          width={320}
          height={220}
          className="w-full h-auto object-contain"
          priority
        />
      </motion.div>

      {/* Header */}
      <div className="max-w-[70%] mb-12 text-left">
        <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#334155] leading-tight">
          Choisissez le plan qui vous convient
        </h2>
        <p className="text-[16px] md:text-[18px] font-bold text-[#F59E0B] mt-2 flex items-center gap-1">
          Plus de créations, plus de styles, plus de possibilités ! 😊
        </p>
      </div>

      {/* Cards List - Desktop 3 cols, Tablet 2 cols, Mobile flex-col or slider */}
      {/* We can use standard grid with tailwind layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {plans.map((plan, idx) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            period={plan.period}
            credits={plan.credits}
            creditsLabel={plan.creditsLabel}
            features={plan.features}
            isPopular={plan.isPopular}
            themeColor={plan.themeColor}
            index={idx}
          />
        ))}
      </div>
    </section>
  )
}
