"use client"

import { AnimatePresence, motion } from "framer-motion"
import { UNLOCK_BURST } from "../animations"
import { worldEngine } from "../world/engine"
import { cn } from "@/lib/utils"
import type { WorldObject } from "../types"

interface UnlockAnimationProps {
  objects: WorldObject[]
  visible: boolean
  onClose?: () => void
  className?: string
}

export function UnlockAnimation({ objects, visible, onClose, className }: UnlockAnimationProps) {
  return (
    <AnimatePresence>
      {visible && objects.length > 0 && (
        <motion.div
          className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-label="Nouvel élément débloqué"
        >
          <div className="absolute inset-0 bg-[#3B2416]/50" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-md rounded-[24px] bg-white/95 p-8 text-center shadow-2xl"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          >
            <h3 className="text-lg font-extrabold text-[#3B2416]">Nouveau déblocage !</h3>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              {objects.map((object, i) => {
                const definition = worldEngine.getObjectDefinition(object.object_type)
                return (
                  <motion.div
                    key={object.id}
                    className="flex flex-col items-center gap-2"
                    variants={UNLOCK_BURST}
                    initial="hidden"
                    animate="burst"
                    transition={{ delay: i * 0.2 }}
                  >
                    <span className="text-6xl">{definition.icon}</span>
                    <span className="text-xs font-bold text-[#3B2416]">{definition.name}</span>
                  </motion.div>
                )
              })}
            </div>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997] px-6 py-2 text-sm font-bold text-white transition-transform hover:scale-105"
            >
              Génial !
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
