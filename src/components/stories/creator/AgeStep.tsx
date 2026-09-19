"use client"

import { Sprout, Compass, Rocket } from "lucide-react"

interface AgeStepProps {
  age: number
  onAgeChange: (age: number) => void
}

const AGE_RANGES = [
  {
    range: "3–5 ans",
    representativeAge: 4,
    badge: "Tout-petits",
    Icon: Sprout,
    desc: "Vocabulaire simple, phrases courtes, beaucoup de douceur et d'éveil.",
    color: "#20C997",
  },
  {
    range: "6–8 ans",
    representativeAge: 7,
    badge: "Explorateurs",
    Icon: Compass,
    desc: "Aventures palpitantes, énigmes amusantes et apprentissage de l'entraide.",
    color: "#FFB300",
  },
  {
    range: "9–12 ans",
    representativeAge: 10,
    badge: "Grands Rêveurs",
    Icon: Rocket,
    desc: "Récits plus denses, légendes africaines, mystères et grandes morales.",
    color: "#7D6AF8",
  },
]

export function AgeStep({ age, onAgeChange }: AgeStepProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[#FFB300] bg-[#FFB300]/10 px-3 py-1 rounded-full">
          Étape 2 sur 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#3B2416] mt-2">
          Quel âge a le petit lecteur ?
        </h2>
        <p className="text-[#684C38] text-sm mt-1">
          L&apos;IA adaptera le vocabulaire et le rythme du récit à sa tranche d&apos;âge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
        {AGE_RANGES.map((item) => {
          const isSelected =
            (item.representativeAge === 4 && age <= 5) ||
            (item.representativeAge === 7 && age >= 6 && age <= 8) ||
            (item.representativeAge === 10 && age >= 9)
          const IconComp = item.Icon

          return (
            <button
              key={item.range}
              type="button"
              onClick={() => onAgeChange(item.representativeAge)}
              className={`flex flex-col items-start p-6 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "border-[#FFB300] bg-[#FFFBF0] shadow-sm scale-102"
                  : "border-[#F0E7DA] bg-white hover:border-[#FFD95C] hover:bg-[#FFFDF7]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full uppercase"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <span className="text-xl font-black text-[#3B2416] mb-1">{item.range}</span>
              <p className="text-xs text-[#684C38] leading-relaxed">{item.desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
