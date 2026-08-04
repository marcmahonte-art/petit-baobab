"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import type { CoachRadar } from "../../types/coach"
import { COACH_RADAR_AXES } from "../../constants/coach-constants"

interface CoachRadarProps {
  radar: CoachRadar
  size?: number
  animated?: boolean
}

/**
 * Radar pédagogique interactif à 8 axes (Lecture, Créativité,
 * Concentration, Logique, Observation, Imagination, Communication,
 * Motricité). Les valeurs sont animées quand il apparaît.
 */
export function CoachRadar({ radar, size = 280, animated = true }: CoachRadarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, margin: "-40px" })
  const [progress, setProgress] = useState(animated ? 0 : 1)

  useEffect(() => {
    if (!animated || !inView) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900)
      const eased = 1 - Math.pow(1 - p, 3)
      setProgress(eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, animated])

  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.34
  const axes = COACH_RADAR_AXES
  const n = axes.length

  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = radius * (Math.max(0, Math.min(100, value)) / 100) * progress
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const labelPos = (i: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = radius + (size > 260 ? 40 : 34)
    return {
      left: cx + r * Math.cos(angle),
      top: cy + r * Math.sin(angle),
    }
  }

  const surfacePoints = axes
    .map((axis, i) => {
      const p = point(i, radar[axis.key] ?? 0)
      return `${p.x},${p.y}`
    })
    .join(" ")

  return (
    <div ref={containerRef} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {/* Grille */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={axes
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / n - Math.PI / 2
                return `${cx + radius * f * Math.cos(angle)},${cy + radius * f * Math.sin(angle)}`
              })
              .join(" ")}
            fill="none"
            stroke="#EFE7F8"
            strokeWidth={1}
          />
        ))}
        {axes.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + radius * Math.cos(angle)}
              y2={cy + radius * Math.sin(angle)}
              stroke="#EFE7F8"
              strokeWidth={1}
            />
          )
        })}

        {/* Surface animée */}
        <motion.polygon
          points={surfacePoints}
          fill="url(#coachRadarGrad)"
          fillOpacity={0.3}
          stroke="#7D6AF8"
          strokeWidth={2.5}
          strokeLinejoin="round"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {axes.map((axis, i) => {
          const p = point(i, radar[axis.key] ?? 0)
          return (
            <motion.circle
              key={axis.key}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={axis.color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            />
          )
        })}

        <defs>
          <linearGradient id="coachRadarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7D6AF8" />
            <stop offset="100%" stopColor="#20C997" />
          </linearGradient>
        </defs>
      </svg>

      {/* Étiquettes */}
      {axes.map((axis, i) => {
        const pos = labelPos(i)
        const value = Math.max(0, Math.min(100, radar[axis.key] ?? 0))
        return (
          <div
            key={axis.key}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ left: pos.left, top: pos.top }}
          >
            <span className="text-sm leading-none">{axis.icon}</span>
            <span className="mt-0.5 text-[9px] font-extrabold leading-tight text-[#3B2416]">{axis.label}</span>
            <span className="text-[8px] font-bold leading-none" style={{ color: axis.color }}>
              {Math.round(value * progress)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
