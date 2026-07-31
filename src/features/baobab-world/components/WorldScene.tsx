"use client"

import { useWorldStore } from "../store/world-store"
import { useWorldObjects, useWorldTime } from "../hooks"
import { getSeasonForMonth } from "../constants"
import { SkyLayer } from "./SkyLayer"
import { SeasonOverlay } from "./SeasonOverlay"
import { BaobabTree } from "./BaobabTree"
import { WorldObject } from "./WorldObject"
import { AnimalSprite } from "./AnimalSprite"
import { DecorationLayer } from "./DecorationLayer"
import { WeatherLayer } from "./WeatherLayer"
import { cn } from "@/lib/utils"

interface WorldSceneProps {
  treeLevel?: number
  className?: string
}

export function WorldScene({ treeLevel, className }: WorldSceneProps) {
  const world = useWorldStore((s) => s.world)
  const { animals, decorations, props } = useWorldObjects()
  const { timeOfDay, palette } = useWorldTime()

  const level = treeLevel ?? world?.tree_level ?? 1
  const season = getSeasonForMonth(new Date().getMonth())
  const weather = world?.weather ?? "sunny"
  const isNight = timeOfDay === "night"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-[#F1E7DA] shadow-[0_20px_50px_rgba(59,36,22,0.12)]",
        className,
      )}
      role="img"
      aria-label={`Le monde de mon baobab — ${season.name}, ${palette.name}`}
      style={{ aspectRatio: "4 / 3" }}
    >
      {/* Sky */}
      <SkyLayer weather={weather} timeOfDay={timeOfDay} />

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 h-[45%] rounded-t-[60px] transition-colors duration-1000"
        style={{ background: season.ground, boxShadow: "inset 0 20px 30px rgba(0,0,0,0.08)" }}
      />

      {/* Decorations (behind, floating) */}
      <DecorationLayer objects={decorations} isNight={isNight} />

      {/* Props (house, lake, etc.) */}
      {props.map((object) => (
        <WorldObject key={object.id} object={object} />
      ))}

      {/* Animals */}
      {animals.map((object) => (
        <AnimalSprite key={object.id} object={object} />
      ))}

      {/* The Baobab */}
      <div className="absolute bottom-[30%] left-1/2 z-20 h-[55%] w-1/2 -translate-x-1/2">
        <BaobabTree treeLevel={level} />
      </div>

      {/* Season tint + particles */}
      <SeasonOverlay season={season.season} timeOfDay={timeOfDay} />

      {/* Weather FX */}
      <WeatherLayer weather={weather} />
    </div>
  )
}
