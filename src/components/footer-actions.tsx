"use client"

import { Button } from "@/components/ui/button"
import { useColoringStore } from "@/lib/store"
import { Bookmark, BookPlus } from "lucide-react"
import { motion } from "framer-motion"

interface FooterActionsProps {
  onSave?: () => void
  onAddToBook?: () => void
}

export function FooterActions({ onSave, onAddToBook }: FooterActionsProps) {
  const { isSaved, isAddedToLivre } = useColoringStore()

  return (
    <footer className="w-full grid grid-cols-1 md:grid-cols-[320px_1fr_280px] gap-[24px] py-4 select-none shrink-0 border-t border-[#EFE7DB]/60 bg-[#FFF9F2]/80 backdrop-blur-sm sticky bottom-0 z-10 px-1 items-center">
      {/* Left: Save button (Gradient #7C57FF to #5B3EEA, Height 64px, Radius 999px) */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
        <Button
          onClick={onSave}
          className="w-full h-[64px] rounded-full bg-gradient-to-b from-[#7C57FF] to-[#5B3EEA] hover:opacity-95 text-white font-extrabold text-[16px] border-none shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Bookmark className="w-5 h-5 fill-current" />
          <span>{isSaved ? "Dessin enregistre !" : "Enregistrer dans mes dessins"}</span>
        </Button>
      </motion.div>

      {/* Center: Encouragement message (Message Card, Height 64px, Radius 28px, bg white) */}
      <div className="w-full h-[64px] bg-white border border-[#EFE7DB] rounded-[28px] px-4 flex items-center justify-center shadow-sm">
        <span className="text-sm sm:text-base font-extrabold text-[#3B2416] text-center flex items-center gap-1.5 justify-center">
          Beau travail ! Continue a creer et a t&apos;amuser ! <span className="text-yellow-400">â­</span>
        </span>
      </div>

      {/* Right: Add to Book button (Book button, Height 64px, Radius 999px, bg #FFD53D) */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
        <Button
          onClick={onAddToBook}
          disabled={isAddedToLivre}
          className="w-full h-[64px] rounded-full bg-[#FFD53D] hover:bg-[#FFD53D]/90 text-[#3B2416] font-extrabold text-[16px] border-none shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <BookPlus className="w-5 h-5" />
          <span>{isAddedToLivre ? "Ajoute au livre !" : "Ajouter a mon livre"}</span>
        </Button>
      </motion.div>
    </footer>
  )
}

