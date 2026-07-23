"use client"

import { BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function BookHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 py-3 md:py-4 px-0 md:px-2">
        <div>
          <h1 className="text-[22px] md:text-[40px] font-extrabold text-[#2D1846] leading-none tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-[#6D4CFF]" /> Livres de coloriage
          </h1>
          <p className="text-[13px] md:text-[16px] font-bold text-[#7A6A5E] mt-1 md:mt-1.5 flex items-center gap-1">
            Crée ton propre livre de coloriage personnalisé !
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Mes Livres Button */}
          <Link href="/mes-livres">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button className="w-[150px] h-[52px] rounded-[16px] bg-[#6D4CFF] text-white hover:bg-[#6D4CFF]/90 font-bold text-[15px] flex items-center justify-center gap-2 shadow-md border-none cursor-pointer">
                <BookOpen className="w-5 h-5" />
                <span>Mes livres</span>
              </Button>
            </motion.div>
          </Link>
        </div>
      </header>
  )
}
