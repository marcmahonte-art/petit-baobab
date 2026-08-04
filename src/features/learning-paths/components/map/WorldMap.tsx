"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import type { LearningRegion } from "../../types"
import type { RegionProgress } from "../../types"

export interface WorldMapProps {
  regions: LearningRegion[]
  regionProgress: RegionProgress[]
  totalXp: number
  selectedRegionId: string | null
  onSelectRegion: (regionId: string | null) => void
  loading?: boolean
}

const REGION_STATUS_COLORS: Record<string, string> = {
  locked: "grayscale opacity-70",
  available: "",
  in_progress: "",
  completed: "",
}

export function WorldMap({
  regions,
  regionProgress,
  totalXp,
  selectedRegionId,
  onSelectRegion,
  loading,
}: WorldMapProps) {
  const statusById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const rp of regionProgress) map[rp.region.id] = rp.status
    return map
  }, [regionProgress])

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#F1E7DA] bg-gradient-to-b from-[#EAF7F0] to-[#D7F0E3] shadow-[0_14px_40px_rgba(32,201,151,0.14)]">
      {/* Décor de fond : savane africaine */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-t-[100%] bg-gradient-to-t from-[#CBE8DA] to-transparent" />
        <div className="absolute left-[6%] bottom-[6%] h-20 w-14 rounded-full bg-[#B7DCC9]" />
        <div className="absolute right-[10%] bottom-[10%] h-24 w-16 rounded-full bg-[#C3E3D3]" />
        <div className="absolute left-[45%] bottom-[2%] h-14 w-10 rounded-full bg-[#C3E3D3]" />
        <div className="absolute top-[12%] left-[8%] h-8 w-8 rounded-full bg-[#FFE9B8] opacity-80 blur-[1px]" />
        <div className="absolute top-[18%] right-[16%] h-6 w-6 rounded-full bg-[#FFE9B8] opacity-70 blur-[1px]" />
        <div className="absolute top-[30%] left-[55%] h-4 w-4 rounded-full bg-[#FFE9B8] opacity-60 blur-[1px]" />
      </div>

      {/* Conteneur des régions */}
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#20C997] border-t-transparent" />
              <span className="text-xs font-bold text-[#128A6B]">Chargement de la carte...</span>
            </div>
          </div>
        )}

        {regions.map((region, index) => {
          const status = statusById[region.id] ?? "locked"
          const isSelected = selectedRegionId === region.id
          const locked = status === "locked"
          const completed = status === "completed"

          return (
            <motion.button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(isSelected ? null : region.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer ${REGION_STATUS_COLORS[status]}`}
              style={{ left: `${region.position_x}%`, top: `${region.position_y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.08, type: "spring", stiffness: 260, damping: 18 }}
              whileHover={locked ? undefined : { scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`${region.title}${locked ? " (verrouillée)" : ""}`}
            >
              {/* Halo pulsant pour la région active */}
              {!locked && !completed && (
                <span
                  className="absolute inset-0 animate-ping rounded-full opacity-25"
                  style={{ background: region.color }}
                />
              )}

              {/* Bulle de la région */}
              <span
                className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 text-2xl shadow-lg sm:h-14 sm:w-14 sm:text-3xl"
                style={{
                  background: locked ? "#E8E2DA" : region.color,
                  borderColor: isSelected ? "#3B2416" : "rgba(255,255,255,0.9)",
                }}
              >
                {locked ? "🔒" : region.icon}
              </span>

              {/* Étiquette */}
              <span
                className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#3B2416]/85 px-2 py-0.5 text-[9px] font-extrabold text-white shadow"
                style={{ fontSize: 9 }}
              >
                {region.title}
              </span>

              {/* Pastille de statut */}
              {completed && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#20C997] text-[10px] text-white shadow">
                  ✓
                </span>
              )}
            </motion.button>
          )
        })}

        {/* Légende */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-2xl bg-white/85 px-3 py-2 backdrop-blur">
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#3B2416]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E8E2DA]" /> Verrouillée
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#3B2416]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#20C997]" /> Active
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#3B2416]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3B2416]/85" /> Terminée
          </span>
        </div>

        {/* XP total en surimpression */}
        <div className="absolute right-3 top-3 z-10 rounded-2xl bg-white/85 px-3 py-2 text-right backdrop-blur">
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#7A6A5E]">XP</p>
          <p className="text-sm font-extrabold text-[#3B2416]">{totalXp}</p>
        </div>
      </div>
    </div>
  )
}
