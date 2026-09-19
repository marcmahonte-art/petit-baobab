"use client"

import { Heart, Leaf, BookOpen, Star, Music, Users } from "lucide-react"
import { StoryTheme, StoryThemeId } from "@/lib/stories/types"
import { cn } from "@/lib/utils"

interface ThemeSelectorProps {
  themes: StoryTheme[]
  selectedTheme: StoryThemeId | null
  onSelectTheme: (id: StoryThemeId | null) => void
}

const THEME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Leaf,
  BookOpen,
  Star,
  Music,
  Users,
}

export function ThemeSelector({
  themes,
  selectedTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-3.5 select-none">
      {themes.map((theme) => {
        const IconComponent = THEME_ICONS[theme.icon] || Star
        const isSelected = selectedTheme === theme.id

        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelectTheme(isSelected ? null : theme.id)}
            style={{
              backgroundColor: theme.color,
            }}
            className={cn(
              "group relative h-20 sm:h-22 md:h-24 rounded-[20px] md:rounded-[24px] flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.03] active:scale-[0.98]",
              isSelected
                ? "ring-4 ring-[#3B2416]/20 scale-[1.02] shadow-md"
                : "opacity-95 hover:opacity-100"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                theme.textColor === "#3B2416" ? "text-[#3B2416]" : "text-white"
              )}
            >
              <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <span
              className={cn(
                "text-xs md:text-sm font-extrabold tracking-wide",
                theme.textColor === "#3B2416" ? "text-[#3B2416]" : "text-white"
              )}
            >
              {theme.label}
            </span>

            {isSelected && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#3B2416] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
