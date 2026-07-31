"use client"

import { motion } from "framer-motion"
import { CLOUD_DRIFT, BIRD_FLY, STAR_TWINKLE } from "../animations"
import { cn } from "@/lib/utils"
import type { WorldWeather, WorldTimeOfDay } from "../types"

interface SkyLayerProps {
  weather: WorldWeather
  timeOfDay: WorldTimeOfDay
  className?: string
}

const SKY_COLORS: Record<WorldTimeOfDay, { top: string; bottom: string }> = {
  morning: { top: "#87CEEB", bottom: "#E8F7FF" },
  afternoon: { top: "#4A90D9", bottom: "#BFE3FF" },
  evening: { top: "#FF9E5E", bottom: "#FFD7A8" },
  night: { top: "#0B1B3B", bottom: "#2A4A7F" },
}

export function SkyLayer({ weather, timeOfDay, className }: SkyLayerProps) {
  const palette = SKY_COLORS[timeOfDay]
  const isNight = timeOfDay === "night" || timeOfDay === "evening"

  return (
    <div
      className={cn("absolute inset-0 z-0 transition-colors duration-1000", className)}
      style={{ background: `linear-gradient(to bottom, ${palette.top}, ${palette.bottom})` }}
      aria-hidden
    >
      {/* Sun */}
      {weather !== "rain" && weather !== "rainbow" && (
        <motion.div
          className="absolute right-[15%] top-[12%] h-16 w-16 rounded-full bg-yellow-300 shadow-[0_0_60px_30px_rgba(253,224,71,0.4)]"
          animate={{ opacity: isNight ? 0 : weather === "cloudy" ? 0.5 : 1, scale: isNight ? 0.6 : 1 }}
        />
      )}

      {/* Moon at night */}
      {isNight && (
        <motion.div
          className="absolute left-[15%] top-[12%] h-14 w-14 rounded-full bg-slate-200 shadow-[0_0_40px_20px_rgba(226,232,240,0.3)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="ml-3 h-4 w-4 rounded-full bg-slate-300" />
        </motion.div>
      )}

      {/* Stars at night */}
      {isNight &&
        Array.from({ length: 20 }, (_, i) => (
          <motion.span
            key={i}
            className="absolute text-white"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 13) % 60}%` }}
            variants={STAR_TWINKLE}
            initial="hidden"
            animate="twinkle"
          >
            ✦
          </motion.span>
        ))}

      {/* Clouds */}
      {(weather === "cloudy" || weather === "rain" || weather === "windy") && (
        <motion.span
          className="absolute left-[5%] top-[18%] text-7xl"
          variants={CLOUD_DRIFT}
          initial="idle"
          animate="drift"
        >
          ☁️
        </motion.span>
      )}

      {/* Flying birds */}
      <motion.span
        className="absolute left-[20%] top-[25%] text-2xl"
        variants={BIRD_FLY}
        initial="idle"
        animate="fly"
      >
        🕊️
      </motion.span>
    </div>
  )
}
