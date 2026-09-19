"use client"

import { Sparkles, User, Smile, Baby, PawPrint, Wand2 } from "lucide-react"

interface HeroStepProps {
  name: string
  onNameChange: (name: string) => void
  heroType: string
  onHeroTypeChange: (type: "garcon" | "fille" | "enfant" | "animal" | "imaginaire") => void
}

const HERO_TYPES = [
  { id: "garcon", label: "Un garçon", Icon: User, desc: "Un petit aventurier curieux" },
  { id: "fille", label: "Une fille", Icon: Smile, desc: "Une héroïne pleine d'énergie" },
  { id: "enfant", label: "Un enfant", Icon: Baby, desc: "Un enfant plein d'imagination" },
  { id: "animal", label: "Un animal ami", Icon: PawPrint, desc: "Un lionceau, un oiseau ou une gazelle" },
  { id: "imaginaire", label: "Personnage magique", Icon: Wand2, desc: "Un petit génie du baobab" },
] as const

export function HeroStep({ name, onNameChange, heroType, onHeroTypeChange }: HeroStepProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[#7D6AF8] bg-[#7D6AF8]/10 px-3 py-1 rounded-full">
          Étape 1 sur 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#3B2416] mt-2">
          Qui est le héros de l&apos;histoire ?
        </h2>
        <p className="text-[#684C38] text-sm mt-1">
          Choisis le personnage principal et donne-lui son prénom magique.
        </p>
      </div>

      {/* Prénom */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0E7DA] shadow-xs max-w-md mx-auto w-full">
        <label className="block text-xs font-bold text-[#684C38] uppercase tracking-wider mb-2">
          Prénom de l&apos;enfant
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex : Moussa, Aïcha, Koffi..."
            className="w-full px-4 py-3 rounded-xl border-2 border-[#EFE7DB] focus:border-[#7D6AF8] focus:outline-none text-[#3B2416] font-bold text-base placeholder-[#B5A595] transition-colors"
          />
          <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFB300] pointer-events-none" />
        </div>
      </div>

      {/* Choix du type de héros */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto w-full">
        {HERO_TYPES.map((t) => {
          const isSelected = heroType === t.id
          const IconComp = t.Icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onHeroTypeChange(t.id)}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-[#7D6AF8] bg-[#7D6AF8]/5 shadow-sm scale-102"
                  : "border-[#F0E7DA] bg-white hover:border-[#FFD95C] hover:bg-[#FFFDF7]"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform ${
                  isSelected
                    ? "bg-[#7D6AF8] text-white"
                    : "bg-[#FFF9F2] text-[#7D6AF8] border border-[#F0E7DA]"
                }`}
              >
                <IconComp className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-sm text-[#3B2416]">{t.label}</span>
              <span className="text-xs text-[#8A7565] mt-1 line-clamp-2">{t.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
