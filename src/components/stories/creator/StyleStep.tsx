"use client"

import { VISUAL_STYLES } from "@/lib/stories/african-context"
import { Check, Palette } from "lucide-react"

interface StyleStepProps {
  style: string
  onStyleChange: (style: "petit-baobab-3d" | "album-jeunesse" | "aquarelle") => void
}

export function StyleStep({ style, onStyleChange }: StyleStepProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[#7D6AF8] bg-[#7D6AF8]/10 px-3 py-1 rounded-full">
          Étape 5 sur 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#3B2416] mt-2">
          Le style des illustrations
        </h2>
        <p className="text-[#684C38] text-sm mt-1">
          Choisis l&apos;ambiance artistique qui donnera vie aux 10 pages du conte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
        {VISUAL_STYLES.map((st) => {
          const isSelected = style === st.id
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onStyleChange(st.id as any)}
              className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "border-[#7D6AF8] bg-white shadow-md scale-102"
                  : "border-[#F0E7DA] bg-white hover:border-[#7D6AF8]/50"
              }`}
            >
              {/* Badge supérieur */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF5DD] text-[#3B2416]">
                  {st.badge}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#7D6AF8] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Aperçu couleur dégradé */}
              <div
                className={`w-full h-24 rounded-xl bg-gradient-to-br ${st.previewBg} border border-black/5 flex items-center justify-center mb-3`}
              >
                <Palette className="w-8 h-8 text-[#7D6AF8]" />
              </div>

              <h4 className="font-extrabold text-base text-[#3B2416] mb-1">{st.label}</h4>
              <p className="text-xs text-[#684C38] leading-relaxed">{st.desc}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
