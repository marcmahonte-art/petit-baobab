"use client"

import { Calendar, Trophy, Gift } from "lucide-react"

export function UpcomingActivities() {
  const activities = [
    {
      title: "Atelier coloriage en ligne",
      desc: "Samedi 24 mai 2025 à 15h00",
      icon: Calendar,
      bgClass: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      title: "Défi créatif : Les animaux de la savane",
      desc: "Du 25 mai au 1er juin 2025",
      icon: Trophy,
      bgClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
    {
      title: "Nouvelle collection : Fêtes du Faso",
      desc: "Disponible le 1er juin 2025",
      icon: Gift,
      bgClass: "bg-[#EF4444]/10 text-[#EF4444]",
    },
  ]

  return (
    <div className="w-full min-h-[270px] h-full rounded-[24px] bg-white border border-[#E5E7EB]/80 p-6 shadow-md flex flex-col justify-between select-none">
      {/* Title & Link */}
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-extrabold text-[#334155]">
          Activités à venir
        </h3>
        <a
          href="#"
          className="text-[12px] font-bold text-[#64748B] bg-[#F1F5F9] px-3 py-1.5 rounded-full hover:bg-[#E5E7EB] hover:text-[#334155] transition-all"
        >
          Voir tout
        </a>
      </div>

      {/* List */}
      <div className="flex-1 flex flex-col justify-center gap-3.5 mt-2">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bgClass}`}>
              <act.icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-extrabold text-[#334155]">
                {act.title}
              </span>
              <span className="text-[12px] font-bold text-[#64748B] mt-0.5">
                {act.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
