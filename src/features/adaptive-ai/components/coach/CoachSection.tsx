"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface CoachSectionProps {
  title: string
  subtitle?: string
  emoji?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}

/** Bloc de section du Coach IA : titre, emoji et contenu animé. */
export function CoachSection({ title, subtitle, emoji, right, children, className = "" }: CoachSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className={className}
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#3B2416]">
            {emoji && <span>{emoji}</span>}
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs font-medium text-[#7A6A5E]">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </motion.section>
  )
}
