"use client"

import { motion } from "framer-motion"
import { ANIMAL_WALK, ANIMAL_BOUNCE } from "../animations"
import { worldEngine } from "../world/engine"
import { cn } from "@/lib/utils"
import type { WorldObject } from "../types"

interface AnimalSpriteProps {
  object: WorldObject
  animate?: boolean
  className?: string
}

const WALKERS = ["lion", "elephant", "giraffe", "zebra", "gazelle", "ostrich", "hippo", "crocodile"]
const JUMPERS = ["monkey"]
const FLIERS = ["parrot"]

export function AnimalSprite({ object, animate = true, className }: AnimalSpriteProps) {
  const definition = worldEngine.getObjectDefinition(object.object_type)

  if (!object.is_unlocked) {
    return (
      <div
        className={cn("absolute flex items-center justify-center opacity-25 grayscale", className)}
        style={{
          left: `${object.position_x || 20}%`,
          top: `${object.position_y || 60}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <span className="text-3xl">❔</span>
      </div>
    )
  }

  const isWalker = WALKERS.includes(object.object_type)
  const isJumper = JUMPERS.includes(object.object_type)
  const isFlier = FLIERS.includes(object.object_type)

  return (
    <motion.div
      className={cn("absolute cursor-pointer select-none", className)}
      style={{
        left: `${object.position_x || 20}%`,
        top: `${object.position_y || 60}%`,
        transform: "translate(-50%, -50%)",
        scale: object.scale ?? 1,
      }}
      variants={animate ? (isWalker ? ANIMAL_WALK : isJumper ? ANIMAL_BOUNCE : ANIMAL_WALK) : undefined}
      initial="idle"
      animate={animate ? "walk" : "idle"}
      role="img"
      aria-label={definition.name}
      title={definition.name}
    >
      <span className="block text-4xl drop-shadow-md">{definition.icon}</span>
      {isFlier && <span className="absolute -right-2 -top-2 text-lg">🪶</span>}
    </motion.div>
  )
}
