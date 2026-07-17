"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"

interface StarsCardProps {
  starsBalance: number
  starsTotal: number
  plan: string
}

export function StarsCard({ starsBalance, starsTotal, plan }: StarsCardProps) {
  const isFree = plan === "free"
  const displayTotal = isFree ? 3 : starsTotal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] md:rounded-[28px] border border-[#EFE7DB] bg-white p-5 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#FFB300]/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-[#FFB300] fill-[#FFB300]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-[#3B2416]">Mes étoiles</h3>
          <p className="text-xs font-semibold text-[#7A6A5E]">Consommation et récompenses</p>
        </div>
      </div>
    </motion.div>
  )
}
