"use client"

import { cn } from "@/lib/utils"
import type { SeasonEvent } from "../types"

interface SeasonBannerProps {
  season: SeasonEvent
  xpTotal?: number
  progress?: number
  level?: number
  className?: string
}

export function SeasonBanner({ season, progress = 0, level = 1, className }: SeasonBannerProps) {
  const pct = Math.min(progress * 100, 100)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] p-6 text-white shadow-[0_10px_30px_rgba(59,36,22,0.15)]",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${season.primary_color}, ${season.secondary_color})`,
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${season.banner})`, backgroundSize: "cover", backgroundPosition: "center" }} />

      <div className="relative">
        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
          Saison · {season.name}
        </span>
        <h2 className="mt-3 text-xl font-extrabold leading-tight">
          {season.theme}
        </h2>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-3xl">🎪</span>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs font-bold">
              <span>Niveau {level}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {season.badges.slice(0, 4).map((badge, i) => (
            <span key={badge} className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
              {["🏅", "🌟", "🔥", "👑"][i % 4]} {badge.replace("season_", "").replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
