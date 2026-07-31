"use client"

import { motion } from "framer-motion"
import { worldEngine } from "../world/engine"
import { cn } from "@/lib/utils"
import type { WorldObject } from "../types"

interface WorldObjectProps {
  object: WorldObject
  onClick?: (object: WorldObject) => void
  className?: string
}

export function WorldObject({ object, onClick, className }: WorldObjectProps) {
  const definition = worldEngine.getObjectDefinition(object.object_type)

  if (!object.is_unlocked) {
    return (
      <div
        className={cn("absolute flex items-center justify-center opacity-30 grayscale", className)}
        style={{
          left: `${(object.position_x || 20) + 40}%`,
          top: `${object.position_y || 60}%`,
          transform: `translate(-50%, -50%)`,
        }}
        title={definition.name}
      >
        <span className="text-3xl">❔</span>
      </div>
    )
  }

  return (
    <motion.button
      className={cn("absolute cursor-pointer select-none", className)}
      style={{
        left: `${object.position_x || 20}%`,
        top: `${object.position_y || 60}%`,
        transform: `translate(-50%, -50%) rotate(${object.rotation ?? 0}deg)`,
        scale: object.scale ?? 1,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: object.scale ?? 1, opacity: 1 }}
      whileHover={{ scale: (object.scale ?? 1) * 1.15 }}
      onClick={() => onClick?.(object)}
      role="button"
      aria-label={definition.name}
      title={definition.name}
    >
      <span className="block text-4xl drop-shadow-md">{definition.icon}</span>
    </motion.button>
  )
}
