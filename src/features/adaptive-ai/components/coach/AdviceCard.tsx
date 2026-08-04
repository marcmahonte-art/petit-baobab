"use client"

import { motion } from "framer-motion"

interface AdviceCardProps {
  advice: string[]
}

/** Conseils personnalisés du coach (Section 7) basés sur les données réelles. */
export function AdviceCard({ advice }: AdviceCardProps) {
  const items = advice.slice(0, 3)

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Je prépare mes conseils pour toi 💡
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((tip, i) => (
        <motion.div
          key={`a${i}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-[#FFF9F2] to-[#F7F4FF] p-3.5"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
            {["💡", "🌟", "🍀"][i % 3]}
          </span>
          <p className="text-xs font-semibold leading-relaxed text-[#3B2416]">{tip}</p>
        </motion.div>
      ))}
    </div>
  )
}
