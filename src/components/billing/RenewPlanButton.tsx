"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RenewPlanButtonProps {
  planId: string
  isActive?: boolean
  onClick?: () => void
}

export function RenewPlanButton({ planId, isActive, onClick }: RenewPlanButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isActive}
      className={cn(
        "w-full h-[52px] rounded-[16px] font-extrabold text-[15px] cursor-pointer transition-all border-2",
        isActive
          ? "bg-[#6D4CFF] text-white border-[#6D4CFF] opacity-60 cursor-not-allowed"
          : planId === "ecole_pro"
            ? "bg-[#16A34A] text-white border-[#16A34A] hover:bg-[#16A34A]/90 shadow-md"
            : planId === "super_baobab"
              ? "border-2 border-[#2563EB] text-[#2563EB] bg-transparent hover:bg-[#2563EB]/5"
              : "border-2 border-[#6D4AFF] text-[#6D4AFF] bg-transparent hover:bg-[#6D4AFF]/5"
      )}
    >
      {isActive ? "Plan actuel" : "Choisir ce plan"}
    </motion.button>
  )
}
