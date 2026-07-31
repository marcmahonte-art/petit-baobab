"use client"

import { AnimatePresence, motion } from "framer-motion"
import { GROWTH_VARIANTS } from "../animations"
import { getTreeStageForTreeLevel } from "../constants"
import { cn } from "@/lib/utils"

interface GrowthAnimationProps {
  treeLevel: number
  visible: boolean
  onComplete?: () => void
  className?: string
}

export function GrowthAnimation({ treeLevel, visible, onComplete, className }: GrowthAnimationProps) {
  const stage = getTreeStageForTreeLevel(treeLevel)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn("pointer-events-none fixed inset-0 z-50 flex items-center justify-center", className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
          role="status"
          aria-label={`Le baobab atteint le niveau ${treeLevel}`}
        >
          <div className="absolute inset-0 bg-[#3B2416]/40" />

          <motion.div
            className="relative rounded-[24px] bg-white/95 p-8 text-center shadow-2xl"
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          >
            <motion.span
              className="block text-7xl"
              variants={GROWTH_VARIANTS}
              initial="hidden"
              animate="grow"
            >
              {stage.icon}
            </motion.span>
            <h3 className="mt-4 text-xl font-extrabold text-[#3B2416]">Le baobab grandit !</h3>
            <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">
              Niveau {treeLevel} · {stage.name}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
