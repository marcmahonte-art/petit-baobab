"use client"

import { motion } from "framer-motion"
import { BUTTERFLY_FLUTTER, FIREFLY_GLOW, STAR_TWINKLE, CLOUD_DRIFT } from "../animations"
import { worldEngine } from "../world/engine"
import { cn } from "@/lib/utils"
import type { WorldObject } from "../types"

interface DecorationLayerProps {
  objects: WorldObject[]
  isNight?: boolean
  className?: string
}

export function DecorationLayer({ objects, isNight = false, className }: DecorationLayerProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-40 overflow-hidden", className)}>
      {objects.filter((o) => o.is_unlocked).map((object) => {
        const definition = worldEngine.getObjectDefinition(object.object_type)
        switch (object.object_type) {
          case "stars":
            return isNight ? (
              <motion.span
                key={object.id}
                className="absolute text-2xl"
                style={{ left: `${object.position_x || 20}%`, top: `${object.position_y || 20}%` }}
                variants={STAR_TWINKLE}
                initial="hidden"
                animate="twinkle"
              >
                ⭐
              </motion.span>
            ) : null
          case "fireflies":
            return isNight ? (
              <motion.span
                key={object.id}
                className="absolute text-lg"
                style={{ left: `${object.position_x || 30}%`, top: `${object.position_y || 40}%` }}
                variants={FIREFLY_GLOW}
                initial="hidden"
                animate="glow"
              >
                ✨
              </motion.span>
            ) : null
          case "butterflies":
            return (
              <motion.span
                key={object.id}
                className="absolute text-2xl"
                style={{ left: `${object.position_x || 25}%`, top: `${object.position_y || 25}%` }}
                variants={BUTTERFLY_FLUTTER}
                initial="idle"
                animate="flutter"
              >
                🦋
              </motion.span>
            )
          case "clouds":
            return (
              <motion.span
                key={object.id}
                className="absolute text-5xl"
                style={{ left: `${object.position_x || 10}%`, top: `${object.position_y || 10}%` }}
                variants={CLOUD_DRIFT}
                initial="idle"
                animate="drift"
              >
                ☁️
              </motion.span>
            )
          default:
            return (
              <span
                key={object.id}
                className="absolute text-2xl"
                style={{ left: `${object.position_x || 20}%`, top: `${object.position_y || 20}%` }}
              >
                {definition.icon}
              </span>
            )
        }
      })}
    </div>
  )
}
