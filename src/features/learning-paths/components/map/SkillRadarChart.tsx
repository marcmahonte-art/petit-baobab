"use client"

import { useMemo } from "react"
import type { SkillRadar } from "../../types"
import { SKILL_AXES } from "../../constants/map-constants"

export interface SkillRadarChartProps {
  radar: SkillRadar
  size?: number
}

const RADAR_COLOR = "#7D6AF8"

/**
 * Roue radar des compétences : 6 axes (créativité, lecture, observation,
 * logique, persévérance, imagination). Chaque valeur est clampée 0-100.
 */
export function SkillRadarChart({ radar, size = 220 }: SkillRadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  const axes = SKILL_AXES

  const points = useMemo(() => {
    return axes.map((axis) => {
      const value = Math.min(100, Math.max(0, radar[axis.key]))
      const angle = (Math.PI * 2 * (axes.indexOf(axis) / axes.length)) - Math.PI / 2
      return {
        x: cx + radius * (value / 100) * Math.cos(angle),
        y: cy + radius * (value / 100) * Math.sin(angle),
      }
    })
  }, [axes, radar, cx, cy, radius])

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {/* Grille */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={axes
              .map((_, i) => {
                const angle = (Math.PI * 2 * (i / axes.length)) - Math.PI / 2
                return `${cx + radius * f * Math.cos(angle)},${cy + radius * f * Math.sin(angle)}`
              })
              .join(" ")}
            fill="none"
            stroke="#EFE7F8"
            strokeWidth={1}
          />
        ))}
        {axes.map((_, i) => {
          const angle = (Math.PI * 2 * (i / axes.length)) - Math.PI / 2
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

        {/* Surface */}
        <polygon points={polygonPoints} fill={RADAR_COLOR} fillOpacity={0.28} stroke={RADAR_COLOR} strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={RADAR_COLOR} />
        ))}
      </svg>

      {/* Étiquettes des axes */}
      {axes.map((axis, i) => {
        const angle = (Math.PI * 2 * (i / axes.length)) - Math.PI / 2
        const lx = cx + (radius + 34) * Math.cos(angle)
        const ly = cy + (radius + 34) * Math.sin(angle)
        const value = Math.min(100, Math.max(0, radar[axis.key]))
        return (
          <div
            key={axis.key}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={{ left: lx, top: ly }}
          >
            <span className="text-sm leading-none">{axis.icon}</span>
            <span className="mt-0.5 text-[9px] font-extrabold leading-tight text-[#3B2416]">{axis.label}</span>
            <span className="text-[8px] font-bold leading-none text-[#7D6AF8]">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
