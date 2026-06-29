"use client"

import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: string
  period: string
  credits: string
  creditsLabel: string
  features: string[]
  isPopular?: boolean
  themeColor: "purple" | "blue" | "green"
  index: number
}

export function PricingCard({
  name,
  price,
  period,
  credits,
  creditsLabel,
  features,
  isPopular,
  themeColor,
  index,
}: PricingCardProps) {
  const colorMap = {
    purple: {
      text: "text-[#6D4AFF]",
      bg: "bg-[#6D4AFF]",
      border: "border-[#6D4AFF]",
      borderLight: "border-[#6D4AFF]/20",
      btnOutline: "border-2 border-[#6D4AFF] text-[#6D4AFF] bg-transparent hover:bg-[#6D4AFF]/5",
    },
    blue: {
      text: "text-[#2563EB]",
      bg: "bg-[#2563EB]",
      border: "border-[#2563EB]",
      borderLight: "border-[#2563EB]/20",
      btnOutline: "border-2 border-[#2563EB] text-[#2563EB] bg-transparent hover:bg-[#2563EB]/5",
    },
    green: {
      text: "text-[#16A34A]",
      bg: "bg-[#16A34A]",
      border: "border-[#16A34A]",
      borderLight: "border-[#16A34A]/20",
      btnOutline: "bg-[#16A34A] text-white hover:bg-[#16A34A]/90 border-none shadow-md",
    },
  }

  const activeColors = colorMap[themeColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className={cn(
        "relative w-full max-w-[360px] min-h-[520px] md:min-h-[550px] rounded-[28px] border bg-white p-6 sm:p-8 flex flex-col justify-between shadow-md transition-shadow hover:shadow-xl select-none",
        isPopular ? "border-[2px] border-[#2563EB] ring-4 ring-[#2563EB]/5" : activeColors.borderLight
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 right-6 bg-[#FFC83D] text-[#334155] rounded-full p-1.5 shadow-md flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 fill-current text-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h4 className={cn("text-[26px] font-extrabold mb-1", activeColors.text)}>
          {name}
        </h4>
        <p className="text-xs font-semibold text-[#64748B] mb-4">
          {name === "Découverte" && "Pour plus de créativité"}
          {name === "Super Baobab" && "Le meilleur choix"}
          {name === "École / Pro" && "Pour les écoles et professionnels"}
        </p>

        <div className="flex flex-col items-center gap-1.5 mb-5">
          <span className="text-[38px] font-extrabold text-[#334155] tracking-tight">
            {price}
          </span>
          <span className="text-[12px] font-semibold text-[#64748B]">
            {period}
          </span>
        </div>

        {/* Credits Badge */}
        <div
          className={cn(
            "h-[38px] rounded-full px-4 flex items-center justify-center gap-1.5 text-white text-xs font-extrabold shadow-sm",
            activeColors.bg
          )}
        >
          <span>{credits}</span>
          <Star className="w-3.5 h-3.5 fill-current text-[#FFC83D]" />
          <span>{creditsLabel}</span>
        </div>
      </div>

      {/* Features List */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <ul className="flex flex-col gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-left">
              <Check className={cn("w-4 h-4 shrink-0 mt-0.5", activeColors.text)} />
              <span className="text-[13px] font-bold text-[#64748B] leading-tight">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="w-full">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className={cn(
              "w-full h-[52px] rounded-[16px] font-extrabold text-[15px] cursor-pointer transition-all",
              activeColors.btnOutline
            )}
          >
            Choisir ce plan
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
