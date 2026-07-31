"use client"

import { motion } from "framer-motion"
import { FADE_UP, STAGGER } from "../animations"
import { MASCOT_IMAGES, getTheme } from "../constants"
import Image from "next/image"

export interface LearningHeroStats {
  xp: number
  stars: number
  minutes: number
  badges: number
  collections: number
}

interface LearningHeroProps {
  childName?: string
  mascot?: string
  objective?: string
  stats: LearningHeroStats
}

export function LearningHero({ childName = "petit artiste", mascot = "baobab", objective, stats }: LearningHeroProps) {
  const theme = getTheme("animals")
  const mascotSrc = MASCOT_IMAGES[mascot] ?? MASCOT_IMAGES.baobab

  const minutes = Math.floor(stats.minutes)
  const hours = Math.floor(minutes / 60)

  return (
    <motion.div
      variants={STAGGER}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-[0_16px_40px_rgba(59,36,22,0.15)] md:p-8"
      style={{ background: `linear-gradient(120deg, ${theme.primary}, ${theme.accent})` }}
    >
      <span className="pointer-events-none absolute -right-8 -top-10 text-9xl opacity-20 select-none">{theme.icon}</span>
      <span className="pointer-events-none absolute -bottom-8 right-24 text-7xl opacity-15 select-none">⭐</span>

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <motion.div variants={FADE_UP} className="max-w-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Ton centre d&apos;apprentissage</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl">
            Salut {childName} ! Prêt à explorer ?
          </h1>
          {objective && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              🎯 Objectif du jour : {objective}
            </p>
          )}
        </motion.div>

        <motion.div variants={FADE_UP} className="flex items-center gap-4">
          <Image
            src={mascotSrc}
            alt="Mascotte"
            width={72}
            height={72}
            className="h-16 w-16 rounded-full border-2 border-white/60 object-cover"
          />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold leading-none">{stats.xp}</p>
              <p className="text-[10px] font-bold uppercase text-white/80">XP gagnés</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold leading-none">{minutes > 60 ? `${hours}h${String(minutes % 60).padStart(2, "0")}` : `${minutes}min`}</p>
              <p className="text-[10px] font-bold uppercase text-white/80">Temps</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold leading-none">{stats.collections}</p>
              <p className="text-[10px] font-bold uppercase text-white/80">Collections</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
              <p className="text-lg font-extrabold leading-none">{stats.badges}</p>
              <p className="text-[10px] font-bold uppercase text-white/80">Badges</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
