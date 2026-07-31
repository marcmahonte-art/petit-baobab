"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useProgressionStore } from "../progression-store"
import { getTitleForLevel } from "../progression.constants"
import { Button } from "@/components/ui/button"
import { playLevelUpSound, playUnlockSound } from "../sound-utils"
import type { UnlockReward } from "../progression.types"

const CONFETTI_COLORS = ["#7D6AF8", "#FFD95C", "#20C997", "#FF5E83", "#1194FF"]

export function LevelUpModal() {
  const state = useProgressionStore((s) => s.state)
  const hideLevelUp = useProgressionStore((s) => s.hideLevelUp)
  const confettiFired = useRef(false)

  const { levelUpVisible, lastLevelUp } = state

  useEffect(() => {
    if (levelUpVisible && !confettiFired.current) {
      confettiFired.current = true

      const fire = () => {
        void import("canvas-confetti").then((module) => {
          const confetti = module.default
          const duration = 3500
          const end = Date.now() + duration

          const frame = () => {
            confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: CONFETTI_COLORS })
            confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: CONFETTI_COLORS })
            confetti({ particleCount: 30, spread: 90, origin: { y: 0.4 }, colors: CONFETTI_COLORS })
            if (Date.now() < end) requestAnimationFrame(frame)
          }

          confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: CONFETTI_COLORS })
          frame()
        })
      }

      const timer = setTimeout(fire, 100)
      playLevelUpSound()
      if (unlocks.length > 0) {
        setTimeout(playUnlockSound, 900)
      }
      return () => clearTimeout(timer)
    }
  }, [levelUpVisible])

  useEffect(() => {
    if (!levelUpVisible) {
      confettiFired.current = false
    }
  }, [levelUpVisible])

  if (!lastLevelUp) return null

  const { previousLevel, newLevel, title, unlocks } = lastLevelUp
  const newTitleIcon = getTitleForLevel(newLevel).icon
  const previousTitleIcon = getTitleForLevel(previousLevel).icon

  return (
    <AnimatePresence>
      {levelUpVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={hideLevelUp}
          />

          <motion.div
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 260 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#F1E7DA] bg-white p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#FFD95C]/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#7D6AF8]/20 blur-2xl" />

            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD95C] to-[#FFB300] text-6xl shadow-lg"
              >
                {newTitleIcon}
              </motion.div>

              <p className="text-sm font-bold uppercase tracking-widest text-[#7D6AF8]">
                Niveau supérieur !
              </p>

              <div className="mt-3 flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{previousTitleIcon}</span>
                  <span className="text-xs font-bold text-[#7A6A5E]">Niv. {previousLevel}</span>
                </div>
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-2xl font-extrabold text-[#7D6AF8]"
                >
                  →
                </motion.div>
                <div className="flex flex-col items-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", damping: 10 }}
                    className="text-3xl"
                  >
                    {newTitleIcon}
                  </motion.span>
                  <span className="text-sm font-extrabold text-[#7D6AF8]">Niv. {newLevel}</span>
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-extrabold text-[#3B2416]">
                {newTitleIcon} {title} {newTitleIcon}
              </h2>
              <p className="mt-1 text-sm font-medium text-[#7A6A5E]">
                Tu as gagné le titre « {title} »
              </p>

              {unlocks.length > 0 && (
                <div className="mt-6 text-left">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#7A6A5E]">
                    Récompenses débloquées
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {unlocks.map((unlock: UnlockReward) => (
                      <motion.div
                        key={unlock.key}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 rounded-xl border border-[#E8E2D8] bg-[#FFF9F2] p-3"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                          {unlock.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#3B2416]">{unlock.label}</p>
                          {unlock.description && (
                            <p className="truncate text-xs font-medium text-[#7A6A5E]">{unlock.description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={hideLevelUp}
                className="mt-6 h-12 w-full rounded-[12px] bg-[#7D6AF8] text-base font-bold text-white shadow-lg shadow-[#7D6AF8]/25 hover:bg-[#6753E9]"
              >
                Continuer l&apos;aventure !
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
