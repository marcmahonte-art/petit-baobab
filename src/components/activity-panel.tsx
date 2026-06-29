"use client"

import { Activity, Award, Star, Flame } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  { icon: Star, label: "Points", value: "120", iconColor: "text-amber-400" },
  { icon: Award, label: "Badges", value: "5", iconColor: "text-orange-400" },
  { icon: Flame, label: "Jours", value: "7", iconColor: "text-red-400" },
]

export function ActivityPanel() {
  return (
    <Card className="rounded-[28px] shadow-[0_4px_12px_rgba(0,0,0,.06)] p-6 bg-white border border-[#EFE7DB]/60 select-none">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5.5 h-5.5 text-[#3B2416]" />
          <h3 className="text-lg font-extrabold text-[#3B2416]">Mon activité</h3>
        </div>
        <a href="#" className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416]">Voir tout</a>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="38" fill="none" stroke="#F0E7DA" strokeWidth="10" />
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="#20C997"
              strokeWidth="10"
              strokeDasharray={`${75 * 2.39} 239`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-extrabold text-lg text-[#3B2416]">
            75%
          </div>
        </div>
        <div>
          <p className="text-base font-extrabold text-[#3B2416]">Bravo Awa !</p>
          <p className="text-xs text-[#7A6A5E] font-bold mt-0.5">Tu es sur la bonne voie.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="h-[72px] rounded-[16px] bg-[#FFF9F2] flex flex-col items-center justify-center gap-0.5 border border-[#F0E7DA]/40">
            <s.icon className={`w-5 h-5 ${s.iconColor} fill-current`} />
            <span className="text-sm font-extrabold text-[#3B2416] mt-0.5">{s.value}</span>
            <span className="text-[10px] font-bold text-[#7A6A5E]">{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
