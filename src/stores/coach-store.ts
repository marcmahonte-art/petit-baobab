// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Store Zustand du coach pédagogique.
// Gère : profil IA, analyse, recommandations, dialogue,
// historique, programme, prédictions + cache local + sync Supabase.
// Le cache (persist) permet un affichage instantané ; chaque
// `sync` revalide les données depuis les vraies tables Supabase.
// ============================================================

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { coachService } from "@/features/adaptive-ai/services/coach-service"
import type {
  CoachAnalysis,
  CoachHistoryItem,
  CoachProgram,
  CoachRadar,
  CoachStatistics,
  DailyLearningPlan,
  LearningPrediction,
  LearningPreference,
  LearningProfile,
  LearningRecommendation,
  LearningSession,
  LearningStrength,
  LearningWeakness,
  MonthlyLearningReport,
  RecommendationStatus,
  WeeklyLearningPlan,
} from "@/features/adaptive-ai/types/coach"
import { EMPTY_COACH_RADAR } from "@/features/adaptive-ai/constants/coach-constants"
import { buildAdvice } from "@/features/adaptive-ai/engine/coach-engine"

export interface CoachMessageUI {
  id: string
  role: "child" | "coach"
  content: string
  intent?: string
  createdAt: string
}

interface CoachState {
  childId: string | null
  profile: LearningProfile | null
  preferences: LearningPreference[]
  statistics: CoachStatistics | null
  radar: CoachRadar
  recommendations: LearningRecommendation[]
  predictions: LearningPrediction | null
  strengths: LearningStrength[]
  weaknesses: LearningWeakness[]
  history: CoachHistoryItem[]
  messages: CoachMessageUI[]
  program: CoachProgram | null
  dailyPlan: DailyLearningPlan | null
  weeklyPlan: WeeklyLearningPlan | null
  report: MonthlyLearningReport | null
  sessions: LearningSession[]
  advice: string[]
  greeting: string
  encouragement: string
  loading: boolean
  initialized: boolean
}

interface CoachActions {
  sync: (childId: string) => Promise<void>
  refresh: () => Promise<void>
  runAnalyze: () => Promise<CoachAnalysis | null>
  updateRecommendationStatus: (id: string, status: RecommendationStatus) => Promise<void>
  sendMessage: (content: string) => Promise<string | null>
  clear: () => void
  set: (partial: Partial<CoachState>) => void
}

const initialState: CoachState = {
  childId: null,
  profile: null,
  preferences: [],
  statistics: null,
  radar: EMPTY_COACH_RADAR,
  recommendations: [],
  predictions: null,
  strengths: [],
  weaknesses: [],
  history: [],
  messages: [],
  program: null,
  dailyPlan: null,
  weeklyPlan: null,
  report: null,
  sessions: [],
  advice: [],
  greeting: "",
  encouragement: "",
  loading: false,
  initialized: false,
}

export const useCoachStore = create<CoachState & CoachActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      set: (partial) => set(partial),

      sync: async (childId) => {
        if (!childId) return
        coachService.init(childId)
        set({ childId, loading: true })

        try {
          const [profileBundle, recs, programBundle, history, report, messages] =
            await Promise.all([              coachService.fetchProfile(childId),
              coachService.fetchRecommendations(childId),
              coachService.fetchProgram(childId),
              coachService.fetchHistory(childId),
              coachService.fetchReport(childId),
              coachService.fetchMessages(childId),
            ])

          set({
            profile: profileBundle.profile,
            preferences: profileBundle.preferences,
            statistics: profileBundle.statistics,
            radar: profileBundle.radar,
            predictions: profileBundle.predictions,
            strengths: profileBundle.strengths,
            weaknesses: profileBundle.weaknesses,
            sessions: profileBundle.sessions,
            advice: buildAdvice(profileBundle.profile, profileBundle.statistics, profileBundle.sessions),
            greeting: profileBundle.greeting,
            encouragement: profileBundle.encouragement,
            recommendations: recs.recommendations,
            program: programBundle.program,
            dailyPlan: programBundle.daily,
            weeklyPlan: programBundle.weekly,
            history: history.history,
            report: report.report,
            messages: messages.messages.map((m) => ({
              id: m.id ?? crypto.randomUUID(),
              role: m.role,
              content: m.content,
              intent: m.intent,
              createdAt: m.created_at ?? new Date().toISOString(),
            })),
            loading: false,
            initialized: true,
          })
        } catch {
          // En cas d'échec réseau, on garde le cache et on marque terminé.
          set({ loading: false, initialized: true })
        }
      },

      refresh: async () => {
        const childId = get().childId
        if (childId) await get().sync(childId)
      },

      runAnalyze: async () => {
        const childId = get().childId
        if (!childId) return null
        const analysis = await coachService.runAnalyze(childId)
        if (analysis) {
          await get().sync(childId)
        }
        return analysis
      },

      updateRecommendationStatus: async (id, status) => {
        const childId = get().childId
        if (!childId) return
        try {
          const { recommendation } = await coachService.updateRecommendation(childId, id, status)
          set((state) => ({
            recommendations: state.recommendations.map((r) =>
              r.id === id ? { ...r, ...recommendation } : r,
            ),
          }))
        } catch {
          // silencieux : l'UI retombe sur le dernier état connu
        }
      },

      sendMessage: async (content) => {
        const childId = get().childId
        if (!childId) return null

        const optimistic: CoachMessageUI = {
          id: crypto.randomUUID(),
          role: "child",
          content,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ messages: [...state.messages, optimistic] }))

        try {
          const result = await coachService.sendMessage(childId, content)
          const reply: CoachMessageUI = {
            id: crypto.randomUUID(),
            role: "coach",
            content: result.reply,
            intent: result.intent,
            createdAt: new Date().toISOString(),
          }
          set((state) => ({ messages: [...state.messages, reply] }))
          return result.reply
        } catch {
          return null
        }
      },

      clear: () => set({ ...initialState }),
    }),
    {
      name: "petit-baobab-coach-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        childId: state.childId,
        profile: state.profile,
        preferences: state.preferences,
        statistics: state.statistics,
        radar: state.radar,
        recommendations: state.recommendations,
        predictions: state.predictions,
        strengths: state.strengths,
        weaknesses: state.weaknesses,
        history: state.history,
        messages: state.messages,
        program: state.program,
        dailyPlan: state.dailyPlan,
        weeklyPlan: state.weeklyPlan,
        report: state.report,
        sessions: state.sessions,
        advice: state.advice,
        greeting: state.greeting,
        encouragement: state.encouragement,
      }),
    },
  ),
)
