"use client"

import { Shield, Sparkles, Download, Heart } from "lucide-react"

export function InformationCard() {
  const benefits = [
    {
      title: "Paiement 100% sécurisé",
      desc: "Vos données sont protégées",
      icon: Shield,
      bgClass: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      title: "Sans engagement",
      desc: "Annulez à tout moment",
      icon: Sparkles,
      bgClass: "bg-[#16A34A]/10 text-[#16A34A]",
    },
    {
      title: "Téléchargez vos créations",
      desc: "En haute qualité (PDF/PNG)",
      icon: Download,
      bgClass: "bg-[#6D4AFF]/10 text-[#6D4AFF]",
    },
    {
      title: "Conçu pour les enfants",
      desc: "Sûr, éducatif et amusant",
      icon: Heart,
      bgClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
  ]

  return (
    <div className="w-full min-h-[270px] h-full rounded-[24px] bg-[#F8FAFC] border border-[#E5E7EB]/80 p-5 md:p-6 shadow-md flex flex-col justify-between select-none">
      {/* List */}
      <div className="flex-1 flex flex-col justify-center gap-3.5">
        {benefits.map((ben, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ben.bgClass}`}>
              <ben.icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-extrabold text-[#334155]">
                {ben.title}
              </span>
              <span className="text-[12px] font-bold text-[#64748B] mt-0.5">
                {ben.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
