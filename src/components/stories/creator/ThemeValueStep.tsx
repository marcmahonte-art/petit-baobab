"use client"

import {
  Heart,
  Leaf,
  BookOpen,
  Star,
  Music,
  Users,
  Shield,
  Trophy,
  Sparkles,
} from "lucide-react"
import { STORY_THEMES } from "@/lib/stories/mock-stories"
import { EDUCATIONAL_VALUES } from "@/lib/stories/african-context"
import type { StoryThemeId } from "@/lib/stories/types"

interface ThemeValueStepProps {
  theme: StoryThemeId
  onThemeChange: (theme: StoryThemeId) => void
  educationalGoal: string
  onEducationalGoalChange: (goal: string) => void
}

const THEME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Leaf,
  BookOpen,
  Star,
  Music,
  Users,
}

const VALUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Shield,
  Leaf,
  BookOpen,
  Trophy,
  Sparkles,
  Users,
}

export function ThemeValueStep({
  theme,
  onThemeChange,
  educationalGoal,
  onEducationalGoalChange,
}: ThemeValueStepProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[#FF5E83] bg-[#FF5E83]/10 px-3 py-1 rounded-full">
          Étape 4 sur 5
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#3B2416] mt-2">
          Le thème et la leçon de vie
        </h2>
        <p className="text-[#684C38] text-sm mt-1">
          Chaque histoire Petit Baobab transmet une valeur chaleureuse et constructive.
        </p>
      </div>

      {/* Thème */}
      <div className="max-w-3xl mx-auto w-full">
        <label className="block text-xs font-black uppercase text-[#684C38] tracking-wider mb-3">
          1. Thème de l&apos;histoire
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {STORY_THEMES.map((t) => {
            const isSelected = theme === t.id
            const IconComp = THEME_ICONS[t.icon] || Star

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                className={`flex flex-col items-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#3B2416] shadow-xs scale-102"
                    : "border-[#F0E7DA] bg-white hover:border-[#FFB300]"
                }`}
                style={{
                  backgroundColor: isSelected ? t.bgLight : undefined,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5"
                  style={{
                    backgroundColor: `${t.color}20`,
                    color: t.color,
                  }}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold text-[#3B2416]">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Valeur éducative */}
      <div className="max-w-3xl mx-auto w-full">
        <label className="block text-xs font-black uppercase text-[#684C38] tracking-wider mb-3">
          2. Valeur éducative transmise
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EDUCATIONAL_VALUES.map((val) => {
            const isSelected = educationalGoal.toLowerCase() === val.id.toLowerCase()
            const IconComp = VALUE_ICONS[val.icon] || Heart

            return (
              <button
                key={val.id}
                type="button"
                onClick={() => onEducationalGoalChange(val.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#20C997] bg-[#20C997]/5 shadow-xs"
                    : "border-[#F0E7DA] bg-white hover:border-[#20C997]/40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#20C997] text-white" : "bg-[#FFF9F2] text-[#20C997]"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#3B2416]">{val.label}</h4>
                  <p className="text-xs text-[#8A7565] mt-0.5 leading-snug">{val.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
