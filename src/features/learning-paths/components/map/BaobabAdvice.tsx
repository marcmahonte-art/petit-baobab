"use client"

import { motion } from "framer-motion"
import { FADE_UP } from "../../animations"

export interface BaobabAdviceProps {
  advice: string
  recommendation?: string
  levelTitle?: string
  levelIcon?: string
}

export function BaobabAdvice({ advice, recommendation, levelTitle, levelIcon }: BaobabAdviceProps) {
  return (
    <motion.div
      variants={FADE_UP}
      className="relative overflow-hidden rounded-[24px] border border-[#DDEFD8] bg-gradient-to-br from-[#EAF7E4] to-[#D9EFCF] p-6 shadow-[0_10px_30px_rgba(32,201,151,0.12)]"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow">
          🌳
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#128A6B]">
            Le Baobab te conseille
          </p>
          <p className="mt-1 text-sm font-bold leading-relaxed text-[#2E4A3A]">{advice}</p>
          {recommendation && (
            <p className="mt-2 text-xs font-semibold text-[#4E6E5A]">💡 {recommendation}</p>
          )}
          {levelTitle && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-[#128A6B]">
              {levelIcon} Niveau : {levelTitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
