"use client"

import { useState } from "react"
import { ParentHeader } from "./parents/parent-header"
import { PremiumBanner } from "./parents/premium-banner"
import { PricingSection } from "./parents/pricing-section"
import { UpcomingActivities } from "./parents/upcoming-activities"
import { HowItWorks } from "./parents/how-it-works"
import { InformationCard } from "./parents/information-card"
import { Footer } from "./parents/footer"
import { motion } from "framer-motion"

export function ParentsPage() {
  const [currentChild, setCurrentChild] = useState("awa")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full select-none"
    >
      {/* 1. ParentHeader */}
      <ParentHeader currentChild={currentChild} onChildChange={setCurrentChild} />

      {/* 2. PremiumBanner (Bandeau Gratuit) */}
      <PremiumBanner />

      {/* 3. PricingSection */}
      <PricingSection />

      {/* 4. Bottom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <UpcomingActivities />
        <HowItWorks />
        <InformationCard />
      </div>

      {/* 5. Footer */}
      <Footer />
    </motion.div>
  )
}
