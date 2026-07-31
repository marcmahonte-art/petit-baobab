"use client"

import { motion } from "framer-motion"
import { WORLD_HUD_PULSE } from "../animations"
import { cn } from "@/lib/utils"
import type { TreeStage } from "../types"

interface WorldHUDProps {
  treeLevel: number
  treeStage: TreeStage
  starsBalance?: number
  badgesCount?: number
  level?: number
  nextTarget?: { level: number; name: string; icon: string } | null
  className?: string
}

export function WorldHUD({ treeLevel, treeStage, starsBalance = 0, badgesCount = 0, level = 1, nextTarget, className }: WorldHUDProps) {
  return (
    <div className={cn("rounded-[20px] border border-[#F1E7DA] bg-white/95 p-4 shadow-[0_10px_30px_rgba(59,36,22,0.08)] backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF9F2] text-2xl"
            variants={WORLD_HUD_PULSE}
            initial="idle"
            animate="pulse"
          >
            🌳
          </motion.span>
          <div>
            <p className="text-sm font-extrabold text-[#3B2416]">Mon Baobab</p>
            <p className="text-xs font-semibold text-[#7A6A5E]">
              Niveau d&apos;arbre {treeLevel} · {treeStage.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-xl bg-[#FFF9F2] p-2">
          <p className="text-lg font-extrabold text-[#7D6AF8]">{level}</p>
          <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Niveau</p>
        </div>
        <div className="rounded-xl bg-[#FFF9F2] p-2">
          <p className="text-lg font-extrabold text-[#FFB300]">{starsBalance}</p>
          <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Étoiles</p>
        </div>
        <div className="rounded-xl bg-[#FFF9F2] p-2">
          <p className="text-lg font-extrabold text-[#FF6B35]">{badgesCount}</p>
          <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Badges</p>
        </div>
        <div className="rounded-xl bg-[#FFF9F2] p-2">
          <p className="text-lg font-extrabold text-[#20C997]">{treeLevel}</p>
          <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Arbre</p>
        </div>
      </div>

      {nextTarget && (
        <div className="mt-3 rounded-xl bg-gradient-to-r from-[#7D6AF8]/10 to-[#20C997]/10 p-3">
          <p className="text-xs font-bold text-[#3B2416]">
            Prochain objectif : {nextTarget.icon} {nextTarget.name} (niveau {nextTarget.level})
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997] transition-all duration-700"
              style={{ width: `${Math.min((treeLevel / nextTarget.level) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
