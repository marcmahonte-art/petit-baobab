"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CONFETTI, MODAL_OVERLAY, MODAL_PANEL } from "../animations"
import { getTheme } from "../constants"
import type { LearningPath } from "../types"

interface PathCompletedModalProps {
  open: boolean
  path: LearningPath | null
  onClose: () => void
  onViewCertificate?: () => void
}

export function PathCompletedModal({ open, path, onClose, onViewCertificate }: PathCompletedModalProps) {
  const theme = path ? getTheme(path.theme) : null

  return (
    <AnimatePresence>
      {open && path && theme && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
          variants={MODAL_OVERLAY}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={CONFETTI}
                initial="hidden"
                animate="visible"
                className="absolute left-1/2 top-1/4 text-2xl"
                style={{ color: [theme.primary, theme.secondary, theme.accent, "#FFB300"][i % 4] }}
              >
                {["🎉", "⭐", "🎓", "✨"][i % 4]}
              </motion.span>
            ))}
          </div>

          <motion.div
            variants={MODAL_PANEL}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] bg-white text-center shadow-2xl"
          >
            <div
              className="h-32 w-full"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
            />
            <div className="-mt-12 px-6 pb-6">
              <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#FFF4D6] text-5xl shadow-lg">
                {path.icon}
              </span>
              <h3 className="mt-3 text-2xl font-extrabold text-[#3B2416]">Parcours terminé !</h3>
              <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">
                Tu as complété <span className="font-extrabold text-[#FF8A00]">{path.title}</span> avec succès.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="rounded-full bg-[#7D6AF8]/10 px-3 py-1 text-xs font-extrabold text-[#5B4AE0]">
                  +{path.rewards.xp} XP
                </span>
                <span className="rounded-full bg-[#FFB300]/10 px-3 py-1 text-xs font-extrabold text-[#FF8A00]">
                  +{path.rewards.stars} ⭐
                </span>
                <span className="rounded-full bg-[#20C997]/10 px-3 py-1 text-xs font-extrabold text-[#128A6B]">
                  🏅 {path.badge.name}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onViewCertificate}
                  className="w-full cursor-pointer rounded-full bg-[#FFB300] py-3 text-sm font-extrabold text-white transition-transform hover:bg-[#D96A00] active:scale-[0.98]"
                >
                  🎓 Voir mon certificat
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-full bg-[#F5F0EB] py-3 text-sm font-extrabold text-[#3B2416] transition-transform hover:bg-[#E8DFD4] active:scale-[0.98]"
                >
                  Continuer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
