"use client"

import { useEffect } from "react"
import { useColoringStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Award, Sparkles, Check } from "lucide-react"
import confetti from "canvas-confetti"

export function RewardPopup() {
  const { isRewardPopupOpen, setRewardPopupOpen, addPoints, addBadge } = useColoringStore()

  // Trigger confetti when popup opens
  useEffect(() => {
    if (isRewardPopupOpen) {
      // Add points and badge Artiste
      addPoints(10)
      addBadge("Super Artiste")

      // Trigger Confetti
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#7D6AF8", "#FFD95C", "#20C997", "#FF5E83", "#1194FF"],
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#7D6AF8", "#FFD95C", "#20C997", "#FF5E83", "#1194FF"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    }
  }, [isRewardPopupOpen, addPoints, addBadge])

  return (
    <AnimatePresence>
      {isRewardPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRewardPopupOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              transition: { type: "spring", damping: 15, stiffness: 300 },
            }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            className="relative bg-white rounded-[32px] border-4 border-[#FFD95C] p-8 w-full max-w-[420px] text-center shadow-xl select-none overflow-hidden z-10"
          >
            {/* Top decorative sparkles */}
            <div className="absolute top-2 left-6 text-yellow-400 animate-bounce">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <div className="absolute top-6 right-8 text-purple animate-pulse">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>

            {/* Reward Card Mascot/Badge */}
            <div className="mx-auto w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-[#FFE08A] to-[#FFD95C] flex items-center justify-center shadow-md relative mb-6">
              <Award className="w-16 h-16 text-[#3B2416]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-[#3B2416]/20 rounded-full"
              />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-extrabold text-[#2D1846] flex items-center justify-center gap-1.5 leading-tight">
              <span>⭐</span> Bravo Awa !
            </h2>
            <p className="text-[#7A6A5E] text-base font-bold mt-2 leading-tight">
              Ton coloriage est magnifique !
            </p>

            {/* Reward Info */}
            <div className="my-6 grid grid-cols-2 gap-4">
              <div className="bg-[#FFE08A]/35 border border-[#FFE08A] rounded-[20px] p-4 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#3B2416]">+10</span>
                <span className="text-[11px] font-extrabold text-[#7A6A5E] uppercase tracking-wider mt-1">
                  Points
                </span>
              </div>
              <div className="bg-[#7D6AF8]/10 border border-[#7D6AF8]/20 rounded-[20px] p-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-purple">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-black">Nouveau</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#7A6A5E] uppercase tracking-wider mt-2.5">
                  Badge Artiste
                </span>
              </div>
            </div>

            {/* CTA Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRewardPopupOpen(false)}
              className="w-full h-[52px] rounded-full bg-[#20C997] hover:bg-[#20C997]/90 text-white font-extrabold text-base shadow-md cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3px]" />
              <span>Génial !</span>
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
