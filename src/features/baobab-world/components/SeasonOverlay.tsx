"use client"

import { AnimatePresence, motion } from "framer-motion"
import { SEASON_FADE } from "../animations"
import { cn } from "@/lib/utils"
import type { WorldSeason, WorldTimeOfDay } from "../types"

interface SeasonOverlayProps {
  season: WorldSeason
  timeOfDay: WorldTimeOfDay
  className?: string
}

const SEASON_FX: Record<WorldSeason, { particles: string; tint: string; label: string }> = {
  dry: { particles: "🍂", tint: "rgba(232, 200, 126, 0.15)", label: "Saison sèche" },
  rainy: { particles: "💧", tint: "rgba(107, 140, 174, 0.18)", label: "Saison des pluies" },
  spring: { particles: "🌸", tint: "rgba(255, 182, 193, 0.12)", label: "Printemps" },
  autumn: { particles: "🍁", tint: "rgba(196, 147, 91, 0.15)", label: "Automne" },
  christmas: { particles: "❄️", tint: "rgba(220, 235, 255, 0.2)", label: "Noël" },
  halloween: { particles: "🎃", tint: "rgba(59, 42, 91, 0.2)", label: "Halloween" },
  school: { particles: "🎒", tint: "rgba(255, 201, 126, 0.12)", label: "Rentrée scolaire" },
  holidays: { particles: "🏖️", tint: "rgba(255, 220, 140, 0.12)", label: "Vacances" },
}

export function SeasonOverlay({ season, timeOfDay, className }: SeasonOverlayProps) {
  const fx = SEASON_FX[season]
  const nightTint = timeOfDay === "night" ? "rgba(5, 15, 40, 0.35)" : timeOfDay === "evening" ? "rgba(255, 140, 60, 0.15)" : "transparent"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={season}
        className={cn("pointer-events-none absolute inset-0 z-30", className)}
        variants={SEASON_FADE}
        initial="initial"
        animate="visible"
        exit="exit"
        style={{ background: fx.tint }}
        aria-label={fx.label}
        role="img"
      >
        {/* Time of day darkening */}
        <div className="absolute inset-0 transition-colors duration-1000" style={{ background: nightTint }} />

        {/* Falling particles for certain seasons */}
        {(season === "christmas" || season === "autumn" || season === "spring" || season === "rainy") &&
          Array.from({ length: 12 }, (_, i) => (
            <motion.span
              key={`${season}_${i}`}
              className="absolute text-xl"
              style={{ left: `${(i * 29) % 100}%`, top: -30 }}
              animate={{ y: [0, 320], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 6 + (i % 4), delay: i * 0.7 }}
            >
              {fx.particles}
            </motion.span>
          ))}
      </motion.div>
    </AnimatePresence>
  )
}
