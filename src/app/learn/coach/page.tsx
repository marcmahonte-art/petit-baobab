"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { RefreshCw, Sparkles } from "lucide-react"
import { Sidebar } from "@/app/learn/_components/sidebar"
import { Header } from "@/app/learn/_components/header"
import { useLearnSession } from "@/app/learn/_components/learn-session"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useProfile } from "@/lib/profile-store"
import { useProgression } from "@/features/progression/hooks/use-progression"
import { useGamification } from "@/features/gamification/hooks/use-gamification"
import { useCoachStore } from "@/stores/coach-store"
import { coachService } from "@/features/adaptive-ai/services/coach-service"
import {
  computeImprovements,
  computeRadar,
  daysAgoISO,
  activityLabel,
} from "@/features/adaptive-ai/engine/coach-engine"
import type { RecommendationStatus } from "@/features/adaptive-ai/types/coach"
import { CoachHero } from "@/features/adaptive-ai/components/coach/CoachHero"
import { CoachMainCard } from "@/features/adaptive-ai/components/coach/CoachMainCard"
import { CoachSection } from "@/features/adaptive-ai/components/coach/CoachSection"
import { RecommendationsList } from "@/features/adaptive-ai/components/coach/RecommendationsList"
import { ProgramTimeline } from "@/features/adaptive-ai/components/coach/ProgramTimeline"
import { ImprovementsCard } from "@/features/adaptive-ai/components/coach/ImprovementsCard"
import { AdviceCard } from "@/features/adaptive-ai/components/coach/AdviceCard"
import { ProfileAnalysisCard } from "@/features/adaptive-ai/components/coach/ProfileAnalysisCard"
import { WeeklyGoalCard } from "@/features/adaptive-ai/components/coach/WeeklyGoalCard"
import { CoachHistory } from "@/features/adaptive-ai/components/coach/CoachHistory"
import { CoachChat } from "@/features/adaptive-ai/components/coach/CoachChat"
import { ConfettiBurst } from "@/features/adaptive-ai/components/coach/ConfettiBurst"

function isRecentSession(iso: string): boolean {
  return iso.slice(0, 10) >= daysAgoISO(7)
}

export default function CoachPage() {
  const router = useRouter()
  const { role } = useLearnSession()
  const { isInitialized, checkSession } = useAuthStore()
  const profile = useProfile()
  const childId = profile?.id

  const store = useCoachStore()
  const progression = useProgression(childId)
  const gamification = useGamification(childId)

  const [analyzing, setAnalyzing] = useState(false)
  const [busyRecId, setBusyRecId] = useState<string | null>(null)
  const [confettiCount, setConfettiCount] = useState(0)
  const [confettiOn, setConfettiOn] = useState(false)

  // Garde enfant : le coach est réservé aux apprenants connectés.
  useEffect(() => {
    if (isInitialized && role !== "student" && !childId) {
      router.replace("/learn/dashboard")
    }
  }, [isInitialized, role, childId, router])

  useEffect(() => {
    if (!isInitialized) checkSession()
  }, [isInitialized, checkSession])

  useEffect(() => {
    if (childId) void store.sync(childId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId])

  // Initialise le service client (écoute du bus d'événements pour l'automatisation).
  useEffect(() => {
    if (childId) coachService.init(childId)
  }, [childId])

  const level = progression.progress?.level ?? 1
  const stars = gamification.profile?.starsBalance ?? 0
  const totalXp = store.statistics?.total_xp ?? progression.progress?.xp ?? 0

  // Améliorations (Section 6) : calculées depuis les sessions réelles.
  const improvements = useMemo(
    () => computeImprovements(store.statistics, store.sessions ?? []),
    [store.statistics, store.sessions],
  )

  const radar = useMemo(
    () => computeRadar(store.statistics, store.profile),
    [store.statistics, store.profile],
  )

  const recentSessionsCount = useMemo(
    () => (store.sessions ?? []).filter((s) => isRecentSession(s.started_at)).length,
    [store.sessions],
  )

  const preferredLabel = store.profile ? activityLabel(store.profile.preferred_activity) : "Coloriage"

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const analysis = await store.runAnalyze()
      if (analysis && analysis.strengths.length > 0) {
        setConfettiOn(true)
        setConfettiCount((c) => c + 1)
        setTimeout(() => setConfettiOn(false), 2600)
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRecStatus = async (id: string, status: RecommendationStatus) => {
    setBusyRecId(id)
    try {
      await store.updateRecommendationStatus(id, status)
    } finally {
      setBusyRecId(null)
    }
  }

  const handleSend = async (content: string) => {
    return store.sendMessage(content)
  }

  const showRadarCard = radar.reading > 0 || radar.creativity > 0

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <ConfettiBurst trigger={confettiCount} active={confettiOn} />
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          <CoachHero
            childName={profile?.name}
            greeting={store.greeting}
            encouragement={store.encouragement}
            level={level}
            totalXp={totalXp}
            stars={stars}
            sessionsCount={recentSessionsCount}
          />

          {/* Section 1 — Radar + profil IA */}
          {showRadarCard && (
            <CoachSection title="Mon profil d'apprentissage" subtitle="Découvert grâce à tes activités réelles" emoji="🧠">
              <CoachMainCard
                radar={radar}
                confidence={store.profile?.confidence_score ?? 0.5}
                averageSession={store.profile?.average_session ?? 0}
                favoriteTopics={store.profile?.preferred_topics ?? []}
                preferredActivity={preferredLabel}
              />
            </CoachSection>
          )}

          {/* Analyse + recommandations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CoachSection
              title="Mes forces"
              subtitle="Ce que tu réussis le mieux"
              emoji="🌟"
              right={
                <button
                  type="button"
                  onClick={() => void handleAnalyze()}
                  disabled={analyzing}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#7D6AF8] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer border-none"
                >
                  <RefreshCw className={`h-3 w-3 ${analyzing ? "animate-spin" : ""}`} />
                  {analyzing ? "Analyse…" : "Analyser"}
                </button>
              }
            >
              <ProfileAnalysisCard strengths={store.strengths} weaknesses={store.weaknesses} />
            </CoachSection>

            <CoachSection
              title="Mes recommandations"
              subtitle="Des activités adaptées à ma progression"
              emoji="🎯"
            >
              <RecommendationsList
                recommendations={store.recommendations}
                onStatusChange={handleRecStatus}
                busyId={busyRecId}
              />
            </CoachSection>
          </div>

          {/* Programme personnalisé + objectif semaine */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CoachSection title="Mon programme" subtitle="Un plan sur mesure pour grandir" emoji="📅">
                <ProgramTimeline program={store.program} />
              </CoachSection>
            </div>
            <div className="lg:col-span-1">
              <CoachSection title="Objectif semaine" subtitle="Selon mon rythme" emoji="🏆">
                <WeeklyGoalCard prediction={store.predictions} />
              </CoachSection>
            </div>
          </div>

          {/* Progression + conseils */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CoachSection title="Ma progression" subtitle="Sur 30 jours d'activités" emoji="📈">
              <ImprovementsCard improvements={improvements} />
            </CoachSection>
            <CoachSection title="Le conseil de ton coach" subtitle="Basé sur tes vraies activités" emoji="💡">
              <AdviceCard advice={store.advice ?? []} />
            </CoachSection>
          </div>

          {/* Dialogue + historique */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CoachSection title="Parle avec ton coach" subtitle="Pose-moi une question" emoji="🤖">
              <div className="rounded-[24px] border border-[#F1E7DA] bg-white p-4 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                <CoachChat messages={store.messages} onSend={handleSend} disabled={analyzing} />
              </div>
            </CoachSection>
            <CoachSection title="Mon historique" subtitle="Les actions de ton coach" emoji="🕘">
              <div className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                <CoachHistory history={store.history} />
              </div>
            </CoachSection>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#7A6A5E]">
            <Sparkles className="h-3.5 w-3.5 text-[#7D6AF8]" />
            Le Coach IA s&apos;adapte à chaque activité que tu réalises.
            <span className="text-[#3B2416]">Dernière analyse : {store.profile?.last_analysis ? new Date(store.profile.last_analysis).toLocaleDateString("fr-FR") : "jamais"}</span>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-1" />
        </main>
      </div>
    </div>
  )
}
