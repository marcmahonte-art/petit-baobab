"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PricingCard } from "./pricing-card"
import StarPurchaseModal from "@/components/school/StarPurchaseModal"
import SuperBaobabModal from "@/components/parents/SuperBaobabModal"
import { motion } from "framer-motion"
import Image from "next/image"

const PLAN_PACK_MAP: Record<string, string> = {
  "Découverte": "pack_100",
}

export function PricingSection() {
  const router = useRouter()
  const [purchasePack, setPurchasePack] = useState<string | null>(null)
  const [showSuperBaobabModal, setShowSuperBaobabModal] = useState(false)
  const plans = [
    {
      name: "Découverte",
      price: "2 000 FCFA",
      period: "Paiement unique",
      credits: "100",
      creditsLabel: "étoiles incluses",
      features: [
        "100 étoiles à utiliser quand vous voulez",
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
      period: "/ mois (3 mois)",
      credits: "250",
      creditsLabel: "étoiles incluses / mois",
      features: [
        "250 étoiles à utiliser par mois",
        "Disponible en 3 mois (13 500 FCFA)",
        "Tous les styles de dessin",
        "Livres",
        "Téléchargement de vos créations",
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
      creditsLabel: "étoiles / mois",
      features: [
        "1 000 étoiles renouvelées chaque mois",
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
      <div className="w-full lg:max-w-[70%] mb-8 md:mb-12 text-left">
        <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-extrabold text-[#334155] leading-tight">
          Choisissez le plan qui vous convient
        </h2>
        <p className="text-[16px] md:text-[18px] font-bold text-[#F59E0B] mt-2 flex items-center gap-1">
          Plus de créations, plus de styles, plus de possibilités !
        </p>
      </div>

      {/* Cards List - Desktop 3 cols, Tablet 2 cols, Mobile flex-col or slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
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
            onChoose={() => {
              if (plan.name === "Super Baobab") {
                setShowSuperBaobabModal(true)
                return
              }
              const packId = PLAN_PACK_MAP[plan.name]
              if (packId) {
                setPurchasePack(packId)
              } else {
                router.push("/signup?space=school")
              }
            }}
          />
        ))}
      </div>

      <StarPurchaseModal
        open={purchasePack !== null}
        onClose={() => setPurchasePack(null)}
        preselectedPackId={purchasePack || undefined}
      />

      <SuperBaobabModal
        open={showSuperBaobabModal}
        onClose={() => setShowSuperBaobabModal(false)}
      />
    </section>
  )
}
