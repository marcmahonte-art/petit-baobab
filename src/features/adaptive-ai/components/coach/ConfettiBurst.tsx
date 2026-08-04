"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

interface ConfettiBurstProps {
  trigger?: number
  active?: boolean
}

/** Petite pluie de confettis Petit Baobab (récompenses, réussites). */
export function ConfettiBurst({ trigger = 0, active = false }: ConfettiBurstProps) {
  useEffect(() => {
    if (!active || trigger <= 0) return
    const colors = ["#7D6AF8", "#20C997", "#FFB300", "#FF5E83", "#FFD95C"]

    const defaults = { spread: 70, ticks: 90, gravity: 0.9, colors, zIndex: 60 }
    confetti({ ...defaults, particleCount: 42, origin: { x: 0.5, y: 0.5 } })
    confetti({ ...defaults, particleCount: 24, origin: { x: 0.25, y: 0.6 }, angle: 60 })
    confetti({ ...defaults, particleCount: 24, origin: { x: 0.75, y: 0.6 }, angle: 120 })

    const t = setTimeout(() => confetti.reset(), 2200)
    return () => clearTimeout(t)
  }, [trigger, active])

  return null
}
