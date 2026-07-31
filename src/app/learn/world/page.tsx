"use client"

import { useEffect } from "react"
import { Sidebar } from "@/app/learn/_components/sidebar"
import { Header } from "@/app/learn/_components/header"
import { useAuthStore } from "@/lib/auth-store"
import { useProfile } from "@/lib/profile-store"
import { useGamification } from "@/features/gamification/hooks/use-gamification"
import { useProgression } from "@/features/progression/hooks/use-progression"
import { useChallenges } from "@/features/challenges/hooks/use-challenges"
import { useWorld, useWorldObjects, useWorldTimeline } from "@/features/baobab-world/hooks"
import {
  WorldScene,
  WorldHUD,
  GrowthAnimation,
  UnlockAnimation,
} from "@/features/baobab-world/components"
import { useWorldStore } from "@/features/baobab-world/store/world-store"
import { ANIMALS, getSeasonForMonth } from "@/features/baobab-world/constants"
import { motion } from "framer-motion"
import { SLIDE_UP } from "@/features/baobab-world/animations"
import type { PlanType } from "@/features/gamification/types"

const animalIcon = (type: string) => ANIMALS.find((a) => a.type === type)?.icon ?? "🐾"

function normalizePlan(plan: string | undefined): PlanType {
  if (plan === "super_baobab") return "super-baobab"
  if (plan === "ecole_pro") return "ecole-pro"
  return plan === "decouverte" ? "decouverte" : "free"
}

export default function MonBaobabPage() {
  const { account, isInitialized, checkSession } = useAuthStore()
  const profile = useProfile()
  const childId = profile?.id

  const world = useWorld(childId)
  const { animals, decorations, props, locked } = useWorldObjects()
  const timeline = useWorldTimeline()
  const progression = useProgression(childId)
  const gamification = useGamification(childId)
  const challenges = useChallenges(childId, account?.plan ?? "free")

  useEffect(() => {
    if (!isInitialized) checkSession()
  }, [isInitialized, checkSession])

  useEffect(() => {
    if (childId) {
      gamification.initialize(childId, { name: profile?.name, mascot: profile?.mascot, plan: normalizePlan(account?.plan) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, profile?.name, profile?.mascot, account?.plan])

  const store = useWorldStore()
  const season = getSeasonForMonth(new Date().getMonth())

  if (!isInitialized || !childId) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Chargement de ton baobab...</span>
        </div>
      </div>
    )
  }

  const treeLevel = world.world?.tree_level ?? 1
  const stage = world.treeStage
  const badgesCount = gamification.badges?.length ?? 0
  const starsBalance = gamification.profile?.starsBalance ?? account?.stars_balance ?? 0
  const level = progression.level ?? 1
  const nextTarget = world.nextTarget

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          <motion.div variants={SLIDE_UP} initial="hidden" animate="visible">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-[#3B2416]">Mon Baobab 🌳</h1>
                <p className="text-sm font-semibold text-[#7A6A5E]">
                  Bienvenue dans ton monde, {profile?.name ?? "petit artiste"} !
                </p>
              </div>
              <span className="rounded-full bg-[#FFB300]/10 px-3 py-1 text-xs font-bold text-[#FF8A00]">
                {season.icon} {season.name}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
              {/* Left: The living world */}
              <div className="flex flex-col gap-6">
                <WorldScene treeLevel={treeLevel} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Collections */}
                  <div className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                    <h3 className="mb-3 text-sm font-bold text-[#3B2416]">Mes collections</h3>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-[#7A6A5E]">
                      <div className="flex items-center justify-between">
                        <span>🦁 Animaux</span>
                        <span className="font-extrabold text-[#3B2416]">
                          {animals.filter((a) => a.is_unlocked).length}/{animals.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>🏘️ Objets</span>
                        <span className="font-extrabold text-[#3B2416]">
                          {props.filter((p) => p.is_unlocked).length}/{props.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>✨ Décorations</span>
                        <span className="font-extrabold text-[#3B2416]">
                          {decorations.filter((d) => d.is_unlocked).length}/{decorations.length}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {animals.slice(0, 8).map((a) => (
                        <span
                          key={a.object_type}
                          className={`text-xl ${a.is_unlocked ? "" : "opacity-25 grayscale"}`}
                          title={a.object_type}
                        >
                          {a.is_unlocked ? animalIcon(a.object_type) : "❔"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Défis actifs */}
                  <div className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                    <h3 className="mb-3 text-sm font-bold text-[#3B2416]">Défis actifs</h3>
                    <div className="flex flex-col gap-2.5">
                      {challenges.daily.slice(0, 2).map((mission) => {
                        const progress = challenges.dailyProgress[mission.id] ?? 0
                        const pct = Math.min((progress / mission.target) * 100, 100)
                        return (
                          <div key={mission.id}>
                            <div className="flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
                              <span>
                                {mission.icon} {mission.title}
                              </span>
                              <span>
                                {Math.min(progress, mission.target)}/{mission.target}
                              </span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997] transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                    <h3 className="mb-3 text-sm font-bold text-[#3B2416]">Mes badges</h3>
                    {gamification.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {gamification.badges.slice(0, 9).map((badge) => (
                          <span
                            key={badge.id}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9F2] text-xl"
                            title={badge.name}
                          >
                            {badge.iconUrl ? (
                              <img src={badge.iconUrl} alt={badge.name} className="h-7 w-7" />
                            ) : (
                              "🏅"
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-[#7A6A5E]">
                        Continue tes activités pour gagner tes premiers badges !
                      </p>
                    )}
                    <p className="mt-3 text-xs font-bold text-[#3B2416]">
                      {badgesCount} badge{badgesCount > 1 ? "s" : ""} · Niveau {level}
                    </p>
                  </div>
                </div>

                {/* Timeline / Souvenirs */}
                <div className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                  <h3 className="mb-4 text-sm font-bold text-[#3B2416]">📖 L&apos;histoire de mon baobab</h3>
                  <div className="flex flex-col gap-4">
                    {timeline.map((group) =>
                      group.entries.length > 0 ? (
                        <div key={group.label}>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#7A6A5E]">
                            {group.label}
                          </p>
                          <div className="flex flex-col gap-2">
                            {group.entries.slice(0, 4).map((entry) => (
                              <div key={entry.id} className="flex items-center gap-3 rounded-xl bg-[#FFF9F2] p-2.5">
                                <span className="text-xl">{entry.icon}</span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-[#3B2416]">{entry.label}</p>
                                  <p className="text-[10px] font-medium text-[#7A6A5E]">
                                    {new Date(entry.createdAt).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null,
                    )}
                    {timeline.every((g) => g.entries.length === 0) && (
                      <p className="text-xs font-medium text-[#7A6A5E]">
                        Ta toute première activité créera ton premier souvenir !
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: HUD + locked collection */}
              <div className="flex flex-col gap-6">
                <WorldHUD
                  treeLevel={treeLevel}
                  treeStage={stage?.stage ?? "seed"}
                  starsBalance={starsBalance}
                  badgesCount={badgesCount}
                  level={level}
                  nextTarget={nextTarget}
                />

                <div className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                  <h3 className="mb-3 text-sm font-bold text-[#3B2416]">À découvrir</h3>
                  <div className="flex flex-wrap gap-2">
                    {locked.slice(0, 12).map((obj) => (
                      <span
                        key={obj.object_type}
                        className="flex flex-col items-center gap-1 rounded-xl bg-[#FFF9F2] px-2 py-2 opacity-50 grayscale"
                        title={obj.object_type}
                      >
                        <span className="text-xl">❔</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#7A6A5E]">
                    Continue à créer et jouer pour faire grandir ton monde !
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Growth + Unlock overlays */}
      <GrowthAnimation
        treeLevel={treeLevel}
        visible={store.stageUpVisible}
        onComplete={() => store.hideStageUp()}
      />
      <UnlockAnimation
        objects={store.lastUnlocks}
        visible={store.unlockVisible}
        onClose={() => store.hideUnlock()}
      />
    </div>
  )
}
