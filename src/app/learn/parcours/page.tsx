"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/app/learn/_components/sidebar"
import { Header } from "@/app/learn/_components/header"
import { useLearnSession } from "@/app/learn/_components/learn-session"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useProfile } from "@/lib/profile-store"
import { useGamification } from "@/features/gamification/hooks/use-gamification"
import { useProgression } from "@/features/progression/hooks/use-progression"
import { useChallenges } from "@/features/challenges/hooks/use-challenges"
import { useWorldObjects } from "@/features/baobab-world/hooks"
import { useLearningPaths } from "@/features/learning-paths/hooks"
import { useLearningMap } from "@/features/learning-paths/hooks/use-learning-map"
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
  WorldMap,
  RegionDetail,
  SkillRadarChart,
  NextObjective,
  DailyQuests,
  SideQuests,
  HistoryTimeline,
  BaobabAdvice,
  MapRewardPopup,
} from "@/features/learning-paths/components"
import { getPathBySlug, getDifficulty } from "@/features/learning-paths/constants"
import { SKILL_AXES } from "@/features/learning-paths/constants/map-constants"
import { useLearningStore } from "@/features/learning-paths/store/learning-store"
import { FADE_UP, STAGGER } from "@/features/learning-paths/animations"
import type { HistoryItem } from "@/features/learning-paths/components/map/HistoryTimeline"
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
  const router = useRouter()
  const { role } = useLearnSession()
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
  const map = useLearningMap(childId)
  const challenges = useChallenges(childId, account?.plan ?? "free")
  const { animals, props, decorations } = useWorldObjects()

  const store = useLearningStore()

  const [view, setView] = useState<"map" | "paths">("map")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [busyMissionId, setBusyMissionId] = useState<string | null>(null)
  const [busyQuestId, setBusyQuestId] = useState<string | null>(null)
  const selectedPath = selectedSlug ? getPathBySlug(selectedSlug) ?? null : null

  // Garde enfant : la carte et les parcours sont réservés aux enfants connectés.
  useEffect(() => {
    if (isInitialized && role !== "student" && !childId) {
      router.replace("/learn/dashboard")
    }
  }, [isInitialized, role, childId, router])

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

  // -------------------------------------------------------------------------
  // Vue Carte — dérivations des 8 sections
  // -------------------------------------------------------------------------

  const selectedRegion = selectedRegionId ? map.regions.find((r) => r.id === selectedRegionId) ?? null : null
  const selectedRegionMissions = selectedRegion ? map.missionsByRegion[selectedRegion.id] ?? [] : []

  const historyItems: HistoryItem[] = useMemo(() => {
    const items: HistoryItem[] = map.missionProgress
      .filter((p) => p.status === "completed" && p.completed_at)
      .map((p) => {
        const mission = map.missions.find((m) => m.id === p.mission_id)
        const region = mission ? map.regions.find((r) => r.id === mission.region_id) : undefined
        return {
          id: `mission_${p.mission_id}`,
          title: mission?.title ?? "Mission terminée",
          description: region ? `Mission dans ${region.title}` : "Mission accomplie",
          icon: "🎯",
          date: p.completed_at!,
          type: "mission" as const,
        }
      })

    for (const d of map.dailyProgress) {
      if (d.completed) {
        items.push({
          id: `daily_${d.mission.id}`,
          title: `Quête du jour : ${d.mission.title}`,
          description: `+${d.mission.xp} XP`,
          icon: d.mission.icon,
          date: new Date().toISOString(),
          type: "quest" as const,
        })
      }
    }

    return items
  }, [map.missionProgress, map.missions, map.regions, map.dailyProgress])

  const strongestAxis = useMemo(() => {
    return [...SKILL_AXES].sort((a, b) => (map.radar[b.key] ?? 0) - (map.radar[a.key] ?? 0))[0]
  }, [map.radar])

  const advice = useMemo(() => {
    if (!map.currentMission) {
      return "La carte est entièrement débloquée, quel explorateur ! Continue d'enrichir tes compétences chaque jour."
    }
    const axis = strongestAxis
    if (axis && map.radar[axis.key] > 0) {
      return `Tu brilles en ${axis.label.toLowerCase()} ! La mission « ${map.currentMission.title} » est parfaite pour faire grandir cette force.`
    }
    return `Ta prochaine aventure : « ${map.currentMission.title} ». Chaque mission te rapproche du prochain niveau !`
  }, [map.currentMission, map.radar, strongestAxis])

  const recommendation = useMemo(() => {
    if (learning.recommendations[0]) {
      return `Pour continuer, je te recommande le parcours « ${learning.recommendations[0].path.title} ».`
    }
    return undefined
  }, [learning.recommendations])

  const handleStartMission = async (missionId: string) => {
    setBusyMissionId(missionId)
    try {
      await map.startMission(missionId)
    } finally {
      setBusyMissionId(null)
    }
  }

  const handleCompleteMission = async (missionId: string) => {
    setBusyMissionId(missionId)
    try {
      await map.completeMission(missionId)
    } finally {
      setBusyMissionId(null)
    }
  }

  const handleCompleteQuest = async (type: "daily" | "weekly", questId: string) => {
    setBusyQuestId(questId)
    try {
      await map.completeQuest(type, questId)
    } finally {
      setBusyQuestId(null)
    }
  }

  if (!isInitialized || !childId) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Chargement de ton aventure...</span>
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

          {/* Toggle Carte / Parcours */}
          <div className="flex w-fit items-center gap-1 rounded-full border border-[#F1E7DA] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setView("map")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-extrabold transition-colors ${
                view === "map" ? "bg-[#20C997] text-white shadow" : "text-[#7A6A5E] hover:text-[#3B2416]"
              }`}
            >
              🗺️ Carte du monde
            </button>
            <button
              type="button"
              onClick={() => setView("paths")}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-extrabold transition-colors ${
                view === "paths" ? "bg-[#7D6AF8] text-white shadow" : "text-[#7A6A5E] hover:text-[#3B2416]"
              }`}
            >
              📚 Parcours
            </button>
          </div>

          {view === "map" ? (
            /* -----------------------------------------------------------------
             * VUE CARTE DU MONDE — PHASE 9
             * 1. Carte africaine  2. Prochain objectif  3. Mission du jour
             * 4. Région active    5. Quêtes secondaires  6. Roue radar
             * 7. Conseil du Baobab  8. Historique
             * -------------------------------------------------------------- */
            <motion.div variants={STAGGER} initial="hidden" animate="visible" className="flex flex-col gap-6">
              <WorldMap
                regions={map.regions}
                regionProgress={map.regionProgress}
                totalXp={map.totalXp}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
                loading={map.loading}
              />

              <NextObjective
                region={map.nextObjective ?? null}
                mission={map.currentMission}
                regionJustUnlocked={map.regionJustUnlocked}
                totalXp={map.totalXp}
              />

              {/* Mission du jour + progression globale */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DailyQuests dailies={map.dailyProgress} onComplete={handleCompleteQuest} busyQuestId={busyQuestId} />

                <motion.div variants={FADE_UP} className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                  <h3 className="mb-3 text-sm font-extrabold text-[#3B2416]">Ma progression</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-2xl bg-[#F7F4FF] p-3">
                      <span className="text-xs font-bold text-[#5B4AE0]">{map.levelInfo.icon} Niveau {map.levelInfo.level} · {map.levelInfo.title}</span>
                      <span className="text-xs font-extrabold text-[#5B4AE0]">{map.levelInfo.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997]"
                        initial={{ width: 0 }}
                        animate={{ width: `${map.levelInfo.progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-[#FFF4D6] p-3 text-center">
                        <p className="text-lg font-extrabold text-[#D96A00]">{map.totalXp}</p>
                        <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">XP</p>
                      </div>
                      <div className="rounded-2xl bg-[#20C997]/10 p-3 text-center">
                        <p className="text-lg font-extrabold text-[#128A6B]">
                          {map.regionProgress.filter((r) => r.status === "completed").length}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Régions</p>
                      </div>
                      <div className="rounded-2xl bg-[#7D6AF8]/10 p-3 text-center">
                        <p className="text-lg font-extrabold text-[#5B4AE0]">{map.completedMissionIds.size}</p>
                        <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">Missions</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Détail de la région sélectionnée */}
              {selectedRegion && (
                <RegionDetail
                  region={selectedRegion}
                  missions={selectedRegionMissions}
                  missionProgress={map.missionProgress}
                  totalXp={map.totalXp}
                  onStartMission={handleStartMission}
                  onCompleteMission={handleCompleteMission}
                  busyMissionId={busyMissionId}
                />
              )}

              {/* Quêtes secondaires */}
              <SideQuests sideQuests={map.sideQuests} onStart={handleStartMission} busyMissionId={busyMissionId} />

              {/* Roue radar + conseil du Baobab */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <motion.div variants={FADE_UP} className="flex flex-col items-center rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                  <h3 className="mb-2 self-start text-sm font-extrabold text-[#3B2416]">Mes compétences</h3>
                  <SkillRadarChart radar={map.radar} size={240} />
                </motion.div>

                <BaobabAdvice
                  advice={advice}
                  recommendation={recommendation}
                  levelTitle={map.levelInfo.title}
                  levelIcon={map.levelInfo.icon}
                />
              </div>

              {/* Historique */}
              <HistoryTimeline items={historyItems} />
            </motion.div>
          ) : !selectedPath ? (
            /* -----------------------------------------------------------------
             * VUE PARCOURS — dashboard existant
             * -------------------------------------------------------------- */
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
      <MapRewardPopup
        open={map.showReward}
        reward={map.lastReward}
        regionUnlocked={map.regionJustUnlocked}
        onClose={() => map.closeReward()}
      />
    </div>
  )
}
