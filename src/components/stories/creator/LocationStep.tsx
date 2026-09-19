"use client"

import {
  MapPin,
  TreePine,
  Home,
  Waves,
  Palmtree,
  Store,
  GraduationCap,
  Sun,
  Mountain,
} from "lucide-react"
import { AFRICAN_COUNTRIES, STORY_ENVIRONMENTS } from "@/lib/stories/african-context"

interface LocationStepProps {
  country: string
  onCountryChange: (country: string) => void
  environment: string
  onEnvironmentChange: (env: string) => void
}

const ENV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TreePine,
  Home,
  Waves,
  Palmtree,
  Store,
  GraduationCap,
  Sun,
  Mountain,
}

export function LocationStep({
  country,
  onCountryChange,
  environment,
  onEnvironmentChange,
}: LocationStepProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[#20C997] bg-[#20C997]/10 px-3 py-1 rounded-full">
          Étape 3 sur 5
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#3B2416] mt-2">
          Où se déroule l&apos;aventure ?
        </h2>
        <p className="text-[#684C38] text-sm mt-1">
          Choisis le pays africain et le décor dans lequel le héros va voyager.
        </p>
      </div>

      {/* Pays */}
      <div className="max-w-3xl mx-auto w-full">
        <label className="block text-xs font-black uppercase text-[#684C38] tracking-wider mb-3">
          1. Choisis un pays africain
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {AFRICAN_COUNTRIES.map((c) => {
            const isSelected = country.toLowerCase() === c.name.toLowerCase()
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCountryChange(c.name)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#20C997] bg-[#20C997]/10 font-black text-[#3B2416]"
                    : "border-[#F0E7DA] bg-white hover:border-[#20C997]/50 font-bold text-[#684C38]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#20C997] text-white" : "bg-[#F0E7DA] text-[#684C38]"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm truncate">{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Environnement */}
      <div className="max-w-3xl mx-auto w-full">
        <label className="block text-xs font-black uppercase text-[#684C38] tracking-wider mb-3">
          2. Choisis le décor magique
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STORY_ENVIRONMENTS.map((env) => {
            const isSelected = environment.toLowerCase().includes(env.id.toLowerCase())
            const IconComp = ENV_ICONS[env.icon] || TreePine

            return (
              <button
                key={env.id}
                type="button"
                onClick={() => onEnvironmentChange(env.id)}
                className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#7D6AF8] bg-[#7D6AF8]/5 shadow-xs"
                    : "border-[#F0E7DA] bg-white hover:border-[#FFD95C]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                    isSelected ? "bg-[#7D6AF8] text-white" : "bg-[#FFF9F2] text-[#7D6AF8]"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-sm text-[#3B2416] mb-1">{env.label}</span>
                <span className="text-xs text-[#8A7565] line-clamp-2">{env.desc}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
