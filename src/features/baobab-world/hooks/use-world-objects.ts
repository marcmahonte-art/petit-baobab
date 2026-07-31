"use client"

import { useMemo } from "react"
import { useWorldStore } from "../store/world-store"
import { worldEngine } from "../world/engine"
import { getTimeOfDay } from "../constants"
import type { WorldObject } from "../types"

export function useWorldObjects() {
  const objects = useWorldStore((s) => s.objects)

  const classified = useMemo(() => {
    const all = worldEngine.getAllObjects("viewer", objects)
    const unlocked = all.filter((o) => o.is_unlocked && !o.id.startsWith("stub_"))
    const locked = all.filter((o) => !o.is_unlocked || o.id.startsWith("stub_"))
    const { animals, decorations, props } = splitByType(unlocked)
    return { all, unlocked, locked, animals, decorations, props }
  }, [objects])

  return classified
}

function splitByType(objects: WorldObject[]) {
  const animals: WorldObject[] = []
  const decorations: WorldObject[] = []
  const props: WorldObject[] = []

  const animalTypes = ["lion", "elephant", "giraffe", "zebra", "monkey", "parrot", "hippo", "crocodile", "gazelle", "ostrich"]
  const decorationTypes = ["lanterns", "butterflies", "clouds", "rainbow", "stars", "fireflies", "balloons", "confetti", "rare_flowers"]

  for (const obj of objects) {
    if (animalTypes.includes(obj.object_type)) {
      animals.push(obj)
    } else if (decorationTypes.includes(obj.object_type)) {
      decorations.push(obj)
    } else {
      props.push(obj)
    }
  }
  return { animals, decorations, props }
}

export function useWorldTime() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay)
  const palette = getTimeOfDay()
  return { timeOfDay, palette }
}
