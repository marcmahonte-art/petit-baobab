"use client"

import { Info } from "lucide-react"

export function PremiumBanner() {
  return (
    <div className="w-full h-auto md:h-[52px] rounded-[14px] bg-[#FFFBEB] border border-[#F59E0B] flex items-center gap-3 px-4 py-3 md:py-0 shadow-sm select-none">
      <Info className="w-5 h-5 text-[#F59E0B] shrink-0" />
      <span className="text-[14px] md:text-[16px] font-medium text-[#B45309] leading-tight">
        <span className="font-extrabold">Plan gratuit inclus</span> — 3 générations par jour (style Contour simple uniquement), réinitialisées à minuit GMT (Burkina Faso). Aucune carte requise.
      </span>
    </div>
  )
}
