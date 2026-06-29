"use client"

import { CheckCircle2, HelpCircle, Sparkles, RotateCcw, Clock } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      title: "Choisissez votre style",
      desc: "Chaque style a un coût en crédits différent.",
      icon: CheckCircle2,
      color: "text-[#16A34A]",
    },
    {
      title: "Générez votre dessin",
      desc: "Vos crédits ou votre quota journalier sont décomptés automatiquement.",
      icon: Sparkles,
      color: "text-[#6D4AFF]",
    },
    {
      title: "Remboursement en cas d'échec",
      desc: "Si la génération échoue, vos crédits ou quota sont automatiquement remboursés.",
      icon: RotateCcw,
      color: "text-[#2563EB]",
    },
    {
      title: "Plan Gratuit",
      desc: "3 générations par jour, réinitialisées à minuit GMT (GMT - Burkina Faso).",
      icon: Clock,
      color: "text-[#F59E0B]",
    },
  ]

  return (
    <div className="w-full min-h-[270px] h-full rounded-[24px] bg-white border border-[#E5E7EB]/80 p-5 md:p-6 shadow-md flex flex-col justify-between select-none">
      {/* Title */}
      <div className="flex items-center gap-1.5">
        <h3 className="text-[20px] font-extrabold text-[#334155] flex items-center gap-1.5">
          Comment ça fonctionne ?
        </h3>
        <HelpCircle className="w-4.5 h-4.5 text-[#64748B]" />
      </div>

      {/* List */}
      <div className="flex-1 flex flex-col justify-center gap-2.5 mt-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <step.icon className={`w-5 h-5 shrink-0 mt-0.5 ${step.color}`} />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-extrabold text-[#334155]">
                {step.title}
              </span>
              <span className="text-[11px] font-bold text-[#64748B] mt-0.5">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
