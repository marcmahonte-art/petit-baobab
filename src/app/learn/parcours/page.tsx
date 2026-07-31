"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/app/learn/_components/sidebar"
import { Header } from "@/app/learn/_components/header"
import { useAuthStore } from "@/lib/auth-store"
import { useProfile } from "@/lib/profile-store"
import { useGamification } from "@/features/gamification/hooks/use-gamification"
import { useProgression } from "@/features/progression/hooks/use-progression"
import { useChallenges } from "@/features/challenges/hooks/use-challenges"
import { useWorldObjects } from "@/features/baobab-world/hooks"
import { useLearningPaths } from "@/features/learning-paths/hooks"
import { pathEngine } from "@/features/learning-paths/engine/path-engine"
import {
  LearningCard,
  LearningHero,
  LearningProgress,
  LearningTimeline,
  ModuleCard,
  CertificateCard,
  RewardPopup,
  PathCompletedModal,
} from "@/features/learning-paths/components"
import { getPathBySlug, getDifficulty } from "@/features/learning-paths/constants"
import { useLearningStore } from "@/features/learning-paths/store/learning-store"
import { FADE_UP, STAGGER } from "@/features/learning-paths/animations"
import type { PlanType } from "@/features/gamification/types"

const MASCOT_PREFERENCES: Record<string, string[]> = {
  bobo: ["animals", "africa"],
  kaya: ["animals", "nature"],
  zuri: ["art", "creativity"],
  momo: ["math", "logic", "creativity"],
  kiki: ["music", "reading"],
  baobab: ["nature", "science"],
}

function normalizePlan(plan: string | undefined): PlanType {
  if (plan === "super_baobab") return "super-baobab"
  if (plan === "ecole_pro") return "ecole-pro"
  return plan === "decouverte" ? "decouverte" : "free"
}

export default function LearningPathsPage() {
  const { account, isInitialized, checkSession } = useAuthStore()
  const profile = useProfile()
  const childId = profile?.id

  const gamification = useGamification(childId)
  const progression = useProgression(childId)
  const level = progression.level ?? 1

  const learning = useLearningPaths(childId, {
    childName: profile?.name,
    level,
    preferences: profile?.mascot ? MASCOT_PREFERENCES[profile.mascot] ?? [] : [],
  })
  const challenges = useChallenges(childId, account?.plan ?? "free")
  const { animals, props, decorations } = useWorldObjects()

  const store = useLearningStore()

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const selectedPath = selectedSlug ? getPathBySlug(selectedSlug) ?? null : null

  useEffect(() => {
    if (!isInitialized) checkSession()
  }, [isInitialized, checkSession])

  useEffect(() => {
    if (childId) {
      gamification.initialize(childId, { name: profile?.name, mascot: profile?.mascot, plan: normalizePlan(account?.plan) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, profile?.name, profile?.mascot, account?.plan])

  const badgesCount = gamification.badges?.length ?? 0
  const collectionsCount = animals.filter((a) => a.is_unlocked).length + props.filter((p) => p.is_unlocked).length + decorations.filter((d) => d.is_unlocked).length

  const stats = useMemo(
    () => ({
      xp: store.earnedXp,
      stars: gamification.profile?.starsBalance ?? 0,
      minutes: store.learningSeconds / 60,
      badges: badgesCount,
      collections: collectionsCount,
    }),
    [store.earnedXp, store.learningSeconds, gamification.profile?.starsBalance, badgesCount, collectionsCount],
  )

  const dailyObjective = useMemo(() => {
    const first = learning.inProgress[0]
    if (first?.nextLesson) {
      return `${first.path.title} : ${first.nextLesson.title}`
    }
    const mission = challenges.daily[0]
    return mission ? `${mission.title} (défi du jour)` : "Choisis un parcours et commence ton aventure !"
  }, [learning.inProgress, challenges.daily])

  if (!isInitialized || !childId) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Chargement de tes parcours...</span>
        </div>
      </div>
    )
  }

  const selectedProgress = selectedPath
    ? learning.progressByPath.find((p) => p.path.id === selectedPath.id) ?? null
    : null
  const lessonStatuses = selectedPath
    ? pathEngine.getLessonStatuses(selectedPath, store.progress[selectedPath.id] ?? [])
    : {}

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

          {!selectedPath ? (
            <motion.div variants={STAGGER} initial="hidden" animate="visible" className="flex flex-col gap-6">
              <LearningHero childName={profile?.name} mascot={profile?.mascot} objective={dailyObjective} stats={stats} />

              <LearningProgress progress={learning.progressByPath} />

              {/* Parcours en cours */}
              <motion.section variants={FADE_UP}>
                <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Parcours en cours</h2>
                {learning.inProgress.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {learning.inProgress.map((p) => (
                      <LearningCard key={p.path.id} progress={p} onClick={() => setSelectedSlug(p.path.slug)} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-[#F1E7DA] bg-white/60 p-6 text-center">
                    <p className="text-sm font-bold text-[#7A6A5E]">
                      Commence ton premier parcours ci-dessous ! 🚀
                    </p>
                  </div>
                )}
              </motion.section>

              {/* Recommandations */}
              <motion.section variants={FADE_UP}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#3B2416]">Parcours recommandés pour toi</h2>
                  <span className="rounded-full bg-[#7D6AF8]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#5B4AE0]">
                    ✨ Personnalisé
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {learning.recommendations.slice(0, 6).map((rec) => {
                    const progress = learning.progressByPath.find((p) => p.path.id === rec.path.id)
                    return progress ? (
                      <LearningCard key={rec.path.id} progress={progress} onClick={() => setSelectedSlug(rec.path.slug)} />
                    ) : null
                  })}
                </div>
                {learning.recommendations.length === 0 && (
                  <p className="text-sm font-medium text-[#7A6A5E]">
                    Complète des activités pour affiner tes recommandations.
                  </p>
                )}
              </motion.section>

              {/* Derniers certificats */}
              {store.certificates.length > 0 && (
                <motion.section variants={FADE_UP}>
                  <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Mes certificats 🎓</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {store.certificates.slice(0, 4).map((cert) => (
                      <CertificateCard key={cert.id} certificate={cert} childName={profile?.name} />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Tous les parcours */}
              <motion.section variants={FADE_UP}>
                <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Tous les parcours</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {learning.progressByPath.map((p) => (
                    <LearningCard key={p.path.id} progress={p} onClick={() => setSelectedSlug(p.path.slug)} />
                  ))}
                </div>
              </motion.section>
            </motion.div>
          ) : (
            /* ---------- Détail d'un parcours ---------- */
            <motion.div variants={STAGGER} initial="hidden" animate="visible" className="flex flex-col gap-6">
              <button
                type="button"
                onClick={() => setSelectedSlug(null)}
                className="w-fit cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#3B2416] shadow-sm transition-transform hover:bg-[#FFF4D6] active:scale-95"
              >
                ← Tous les parcours
              </button>

              {selectedPath && selectedProgress && (
                <>
                  <motion.div variants={FADE_UP} className="rounded-[24px] border border-[#F1E7DA] bg-white p-6 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span
                          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
                          style={{ background: selectedPath.colors.secondary }}
                        >
                          {selectedPath.icon}
                        </span>
                        <div>
                          <h1 className="text-2xl font-extrabold text-[#3B2416]">{selectedPath.title}</h1>
                          <p className="mt-1 max-w-xl text-sm font-medium text-[#7A6A5E]">{selectedPath.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#FFF4D6] px-2.5 py-1 text-[10px] font-extrabold text-[#D96A00]">
                              {getDifficulty(selectedPath.difficulty).icon} {getDifficulty(selectedPath.difficulty).label}
                            </span>
                            <span className="rounded-full bg-[#F5F0EB] px-2.5 py-1 text-[10px] font-extrabold text-[#7A6A5E]">
                              {selectedPath.age_min}–{selectedPath.age_max} ans
                            </span>
                            <span className="rounded-full bg-[#F5F0EB] px-2.5 py-1 text-[10px] font-extrabold text-[#7A6A5E]">
                              ⏱ {selectedPath.estimated_duration} min
                            </span>
                            <span className="rounded-full bg-[#20C997]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#128A6B]">
                              +{selectedPath.rewards.xp} XP à la clé
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="min-w-[160px]">
                        <p className="text-right text-[10px] font-bold uppercase text-[#7A6A5E]">Progression</p>
                        <p className="text-right text-2xl font-extrabold text-[#3B2416]">
                          {selectedProgress.progress}%
                        </p>
                        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997]"
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedProgress.progress}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
                    {/* Timeline des modules → certification */}
                    <motion.div variants={FADE_UP} className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)] xl:sticky xl:top-24 xl:self-start">
                      <h2 className="mb-3 text-sm font-extrabold text-[#3B2416]">Ton aventure</h2>
                      <LearningTimeline progress={selectedProgress} />
                    </motion.div>

                    {/* Leçons par module */}
                    <div className="flex flex-col gap-5">
                      {selectedProgress.modules.map((m) => (
                        <ModuleCard
                          key={m.module.id}
                          moduleProgress={m}
                          lessonStatuses={lessonStatuses}
                          nextLesson={selectedProgress.nextLesson}
                          onStart={(lesson) => learning.startLesson(selectedPath.id, lesson.id)}
                          onComplete={(lesson) => learning.validateManually(selectedPath.id, lesson.id)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Overlays de récompenses */}
      <RewardPopup open={store.showReward} reward={store.lastReward} onClose={() => store.closeReward()} />
      <PathCompletedModal
        open={store.showCompleted}
        path={store.completedPath}
        onClose={() => store.closePathCompleted()}
        onViewCertificate={() => {
          store.closePathCompleted()
          setSelectedSlug(null)
        }}
      />
    </div>
  )
}
