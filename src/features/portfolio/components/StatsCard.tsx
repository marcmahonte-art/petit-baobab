"use client"

import { motion } from "framer-motion"
import { CARD_IN } from "../animations"
import { cn } from "@/lib/utils"

import { MarketingIcon } from "@/components/ui/MarketingIcon"

interface StatsCardProps {
  icon: string
  label: string
  value: string | number
  accent?: string
  highlight?: boolean
}

export function StatsCard({ icon, label, value, accent = "#FF8A00", highlight }: StatsCardProps) {
  return (
    <motion.div
      variants={CARD_IN}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col gap-1 rounded-2xl border border-[#F1E7DA] bg-white p-4 shadow-sm",
        highlight && "border-[#FFE08A] bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]/60",
      )}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${accent}1F` }}
        aria-hidden="true"
      >
        <MarketingIcon icon={icon} className="h-6 w-6 object-contain" />
      </span>
      <p className="mt-1 text-2xl font-extrabold text-[#3B2416]">{value}</p>
      <p className="text-xs font-bold text-[#7A6A5E]">{label}</p>
    </motion.div>
  )
}
