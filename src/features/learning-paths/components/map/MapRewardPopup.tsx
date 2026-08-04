"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CONFETTI, MODAL_OVERLAY, REWARD_POP } from "../../animations"
import type { MissionRewardGrant } from "../../store/learning-map-store"

export interface MapRewardPopupProps {
  open: boolean
  reward: MissionRewardGrant | null
  regionUnlocked: boolean
  onClose: () => void
}

export function MapRewardPopup({ open, reward, regionUnlocked, onClose }: MapRewardPopupProps) {
  return (
    <AnimatePresence>
      {open && reward && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          variants={MODAL_OVERLAY}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Confettis */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 16 }, (_, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={CONFETTI}
                initial="hidden"
                animate="visible"
                className="absolute left-1/2 top-1/3 text-2xl"
                style={{ color: ["#FF6B35", "#7D6AF8", "#20C997", "#FFB300"][i % 4] }}
              >
                {["✨", "⭐", "🎉", "🌟"][i % 4]}
              </motion.span>
            ))}
          </div>

          <motion.div
            variants={REWARD_POP}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4D6] text-4xl">
              {regionUnlocked ? "🗺️" : "🎁"}
            </span>
            <h3 className="mt-3 text-xl font-extrabold text-[#3B2416]">
              {regionUnlocked ? "Région débloquée !" : "Bravo !"}
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">
              {regionUnlocked
                ? "Tu as débloqué une nouvelle région de la carte !"
                : "Tu as gagné une récompense !"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-[#7D6AF8]/10 p-3">
                <p className="text-2xl font-extrabold text-[#5B4AE0]">+{reward.xp} XP</p>
                <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Expérience</p>
              </div>
              <div className="rounded-2xl bg-[#FFB300]/10 p-3">
                <p className="text-2xl font-extrabold text-[#FF8A00]">+{reward.stars} ⭐</p>
                <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Étoiles</p>
              </div>
            </div>

            {reward.badge && (
              <div className="mt-2">
                <span className="rounded-full bg-[#20C997]/10 px-3 py-1 text-xs font-extrabold text-[#128A6B]">
                  🏅 {reward.badge}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full cursor-pointer rounded-full bg-[#3B2416] py-3 text-sm font-extrabold text-white transition-transform hover:bg-[#5B3A28] active:scale-[0.98]"
            >
              Continuer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
