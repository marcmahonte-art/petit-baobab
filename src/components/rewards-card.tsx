import { Award, Star, Shield, Palette, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"

const badges = [
  { name: "Super Artiste", icon: Star, bgClass: "bg-[#FFF5CC] text-amber-500 border-amber-200" },
  { name: "Explorateur", icon: Shield, bgClass: "bg-[#E2F7EE] text-emerald-500 border-emerald-200" },
  { name: "Créatif", icon: Palette, bgClass: "bg-[#EBE8FF] text-purple-500 border-purple-200" },
  { name: "Lecteur", icon: BookOpen, bgClass: "bg-[#E3F2FD] text-blue-500 border-blue-200" },
]

export function RewardsCard() {
  return (
    <Card className="rounded-[28px] shadow-[0_4px_12px_rgba(0,0,0,.06)] p-6 mt-4 bg-white border border-[#EFE7DB]/60 select-none">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5.5 h-5.5 text-[#3B2416]" />
        <h3 className="text-lg font-extrabold text-[#3B2416]">Récompenses récentes</h3>
      </div>

      <div className="grid grid-cols-4 gap-2 xs:gap-3 md:gap-4">
        {badges.map((b) => (
          <div key={b.name} className="badge-hover flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className={`w-12 h-12 xs:w-16 xs:h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center border shadow-sm transition-all duration-200 group-hover:scale-105 ${b.bgClass}`}>
              <b.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 fill-current" />
            </div>
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-[#7A6A5E] text-center leading-tight group-hover:text-[#3B2416] transition-colors">{b.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
