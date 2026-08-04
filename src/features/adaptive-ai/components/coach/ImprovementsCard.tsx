"use client"

import { motion } from "framer-motion"
import { AnimatedCounter } from "./AnimatedCounter"
import type { SkillImprovement } from "../../types/coach"

interface ImprovementsCardProps {
  improvements: SkillImprovement[]
}

/** Progression des compétences (Section 6) calculée sur les sessions réelles. */
export function ImprovementsCard({ improvements }: ImprovementsCardProps) {
  if (improvements.length === 0) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Continue tes activités pour voir ta progression 📈
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {improvements.map((imp, i) => {
        const positive = imp.delta >= 0
        return (
          <motion.div
            key={imp.skill}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3 rounded-2xl bg-[#FFF9F2] p-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
              {imp.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#3B2416]">{imp.label}</span>
                <span
                  className={`text-xs font-extrabold ${positive ? "text-[#128A6B]" : "text-[#FF5E83]"}`}
                >
                  {positive ? "▲" : "▼"} <AnimatedCounter value={Math.abs(imp.delta)} suffix="%" />
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#F1E7DA]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: positive ? "linear-gradient(90deg,#7D6AF8,#20C997)" : "#FF5E83" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, Math.max(5, (imp.current / (imp.current + imp.previous + 1)) * 100))}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-[#7A6A5E]">
                {imp.current} activité{imp.current > 1 ? "s" : ""} récente{imp.previous > 0 ? ` (vs ${imp.previous} avant)` : ""}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
