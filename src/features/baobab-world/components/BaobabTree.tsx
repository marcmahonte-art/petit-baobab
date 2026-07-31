"use client"

import { motion } from "framer-motion"
import { GROWTH_VARIANTS, LEAF_VARIANTS, FLOWER_VARIANTS } from "../animations"
import { getTreeStageForTreeLevel } from "../constants"
import { cn } from "@/lib/utils"

interface BaobabTreeProps {
  treeLevel: number
  animating?: boolean
  className?: string
}

const CANOPY_LEVELS = [0, 1, 1, 2, 3, 4, 5]

export function BaobabTree({ treeLevel, animating = false, className }: BaobabTreeProps) {
  const stage = getTreeStageForTreeLevel(treeLevel)
  const canopyCount = CANOPY_LEVELS[Math.min(treeLevel, 6)] ?? 5
  const isSeed = stage.stage === "seed"

  return (
    <motion.div
      className={cn("relative flex items-end justify-center", className)}
      variants={GROWTH_VARIANTS}
      initial={animating ? "hidden" : "grow"}
      animate="grow"
      aria-label={`Baobab niveau ${treeLevel} : ${stage.name}`}
      role="img"
    >
      {/* Trunk */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative"
          style={{ height: `${stage.height * 100}%`, minHeight: isSeed ? 0 : 80 }}
        >
          {!isSeed && (
            <div
              className="w-10 rounded-t-full rounded-b-md bg-gradient-to-r from-[#7A4A2B] via-[#8B5A3B] to-[#6E3E22]"
              style={{ height: `${stage.height * 220}px`, minHeight: 80 }}
            >
              <div className="mx-auto h-full w-6 rounded-t-full bg-[#8B5A3B]/40" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Canopy (feuilles) */}
      {!isSeed && (
        <div className="absolute bottom-16 z-20 flex items-end justify-center">
          {Array.from({ length: canopyCount }, (_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={LEAF_VARIANTS}
              initial="hidden"
              animate="visible"
              className={cn(
                "rounded-full",
                i % 3 === 0 ? "h-14 w-14 bg-[#4CAF50]/90" : i % 3 === 1 ? "h-12 w-12 bg-[#388E3C]/90" : "h-16 w-16 bg-[#66BB6A]/90",
              )}
              style={{ marginLeft: i === 0 ? 0 : -12 }}
            />
          ))}
        </div>
      )}

      {/* Fleurs sur l'arbre mature+ */}
      {treeLevel >= 4 && (
        <div className="absolute bottom-20 z-30 flex gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.span
              key={`flower_${i}`}
              variants={FLOWER_VARIANTS}
              initial="hidden"
              animate="open"
              className="text-xl"
              style={{ transitionDelay: `${i * 300}ms` }}
            >
              🌸
            </motion.span>
          ))}
        </div>
      )}

      {/* Stage icon badge */}
      <div className="absolute -top-6 right-0 z-30 rounded-full bg-white/80 px-2 py-1 text-sm shadow-sm">
        {stage.icon}
      </div>
    </motion.div>
  )
}
