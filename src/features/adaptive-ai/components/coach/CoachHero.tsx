"use client"

import { motion } from "framer-motion"
import { AnimatedCounter } from "./AnimatedCounter"

interface CoachHeroProps {
  childName?: string
  greeting: string
  encouragement: string
  level: number
  totalXp: number
  stars: number
  sessionsCount: number
}

const STAGGER = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
}
const FADE_UP = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

/** Bannière d'accueil du Coach IA — récompenses et encouragement. */
export function CoachHero({
  childName = "",
  greeting,
  encouragement,
  level,
  totalXp,
  stars,
  sessionsCount,
}: CoachHeroProps) {
  const name = childName || "petit champion"

  return (
    <motion.div
      variants={STAGGER}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-[0_16px_40px_rgba(59,36,22,0.15)] md:p-8"
      style={{ background: "linear-gradient(120deg, #7D6AF8, #20C997)" }}
    >
      <span className="pointer-events-none absolute -right-6 -top-8 text-9xl opacity-20 select-none">🧠</span>
      <span className="pointer-events-none absolute -bottom-8 right-24 text-7xl opacity-15 select-none">✨</span>

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <motion.div variants={FADE_UP} className="max-w-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Ton coach pédagogique</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl">Salut {name} ! 👋</h1>
          <p className="mt-2 text-sm font-semibold text-white/90">{greeting}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            💚 {encouragement}
          </p>
        </motion.div>

        <motion.div variants={FADE_UP} className="flex items-center gap-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <AnimatedCounter value={level} className="text-lg font-extrabold leading-none" />
              <p className="text-[10px] font-bold uppercase text-white/80">Niveau</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <AnimatedCounter value={totalXp} className="text-lg font-extrabold leading-none" />
              <p className="text-[10px] font-bold uppercase text-white/80">XP</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <AnimatedCounter value={stars} className="text-lg font-extrabold leading-none" />
              <p className="text-[10px] font-bold uppercase text-white/80">⭐ Étoiles</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <AnimatedCounter value={sessionsCount} className="text-lg font-extrabold leading-none" />
              <p className="text-[10px] font-bold uppercase text-white/80">Activités</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
