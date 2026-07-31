"use client"

import { motion } from "framer-motion"
import { RAIN_DROP } from "../animations"
import { cn } from "@/lib/utils"
import type { WorldWeather } from "../types"

interface WeatherLayerProps {
  weather: WorldWeather
  className?: string
}

export function WeatherLayer({ weather, className }: WeatherLayerProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-50 overflow-hidden", className)} aria-hidden>
      {weather === "rain" && (
        <div className="absolute inset-0">
          {Array.from({ length: 30 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute top-0 h-6 w-0.5 bg-blue-400/70"
              style={{ left: `${(i * 17) % 100}%`, animationDelay: `${(i % 10) * 0.15}s` }}
              variants={RAIN_DROP}
              initial="hidden"
              animate="fall"
            />
          ))}
        </div>
      )}

      {weather === "rainbow" && (
        <div className="absolute left-[10%] top-[15%] h-40 w-72 rounded-[50%] border-[10px] border-transparent opacity-70"
          style={{
            borderTopColor: "#FF4D4D",
            boxShadow:
              "0 -10px 0 -8px #FF9800, 0 -20px 0 -18px #FFEB3B, 0 -30px 0 -28px #4CAF50, 0 -40px 0 -38px #2196F3, 0 -50px 0 -48px #9C27B0",
          }}
        />
      )}

      {weather === "windy" && (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 rounded-full bg-white/60"
              style={{ top: `${20 + i * 15}%`, width: 60 + i * 15 }}
              animate={{ x: [-60, 80], opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.4 }}
            />
          ))}
        </>
      )}

      {weather === "starry" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="animate-pulse text-6xl">🌙</span>
        </div>
      )}
    </div>
  )
}
