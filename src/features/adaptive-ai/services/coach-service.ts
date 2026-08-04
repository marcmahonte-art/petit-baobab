// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Service client du coach : connexion aux routes /api/coach/* et
// AUTOMATISATION. Le service écoute le bus d'événements partagé
// (eventBus de la gamification) : après chaque activité réelle
// (coloriage, dessin, livre, jeu, histoire…), il enregistre la
// session et met à jour le profil IA + les statistiques via
// /api/coach/update (écriture serveur, RLS vérifiée).
// Aucune donnée n'est inventée : seul l'événement réel est transmis.
// ============================================================

import type { GameEventType } from "@/features/gamification/types"
import { eventBus } from "@/features/gamification/event-bus"
import { activityFromEvent } from "../engine/coach-engine"
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
} from "../types/coach"

export interface ActivityRecordInput {
  event: GameEventType
  childId: string
  duration?: number
  style?: string
  colors?: string[]
  bookTitle?: string
  xp?: number
  stars?: number
}

export interface CoachProfileBundle {
  profile: LearningProfile | null
  preferences: LearningPreference[]
  statistics: CoachStatistics | null
  radar: CoachRadar
  predictions: LearningPrediction | null
  strengths: LearningStrength[]
  weaknesses: LearningWeakness[]
  greeting: string
  encouragement: string
  sessions: LearningSession[]
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    throw new Error(`Coach API ${url} a répondu ${res.status}`)
  }
  return (await res.json()) as T
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Coach API ${url} a répondu ${res.status}`)
  return (await res.json()) as T
}

class CoachService {
  private childId: string | null = null
  private listenerRegistered = false
  private recentKeys = new Map<string, number>()

  /** Enregistre le childId et démarre l'écoute des activités (idempotent). */
  init(childId: string): void {
    this.childId = childId
    if (this.listenerRegistered) return
    this.listenerRegistered = true
    eventBus.onAny((payload) => {
      void this.handleActivity(payload)
    })
  }

  dispose(): void {
    this.childId = null
    this.listenerRegistered = false
  }

  /**
   * Automatisation : toute activité réelle émet un événement sur le bus
   * partagé. On transmet l'événement au serveur qui met à jour le profil,
   * les statistiques et la session (sans jamais faire le travail à la
   * place de l'enfant — on observe et on affine le profil).
   */
  private async handleActivity(payload: {
    type: GameEventType
    childId?: string
    duration?: number
    style?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    const activity = activityFromEvent(payload.type)
    if (!activity) return
    if (!payload.childId || (this.childId && payload.childId !== this.childId)) return

    const now = Date.now()
    const dedupeKey = `${payload.type}:${payload.childId}`
    const last = this.recentKeys.get(dedupeKey)
    if (last && now - last < 4000) return
    this.recentKeys.set(dedupeKey, now)

    const meta = payload.metadata ?? {}
    const colors = Array.isArray(meta.colors) ? (meta.colors as string[]).slice(0, 6) : undefined
    const bookTitle = typeof meta.bookTitle === "string" ? meta.bookTitle : undefined
    const xp = typeof meta.xp === "number" ? meta.xp : undefined
    const stars = typeof meta.stars === "number" ? meta.stars : undefined

    try {
      await this.recordActivity({
        event: payload.type,
        childId: payload.childId,
        duration: payload.duration,
        style: payload.style,
        colors,
        bookTitle,
        xp,
        stars,
      })
    } catch {
      // L'automatisation ne doit jamais bloquer l'expérience de l'enfant.
    }
  }

  // -------------------------------------------------------------------------
  // API wrappers
  // -------------------------------------------------------------------------

  recordActivity(input: ActivityRecordInput): Promise<{ ok: boolean }> {
    return post("/api/coach/update", input)
  }

  fetchProfile(childId: string): Promise<CoachProfileBundle> {
    return get(`/api/coach/profile?childId=${encodeURIComponent(childId)}`)
  }

  fetchRecommendations(childId: string): Promise<{ recommendations: LearningRecommendation[] }> {
    return get(`/api/coach/recommendations?childId=${encodeURIComponent(childId)}`)
  }

  updateRecommendation(
    childId: string,
    id: string,
    status: RecommendationStatus,
  ): Promise<{ ok: boolean; recommendation: LearningRecommendation }> {
    return post("/api/coach/recommendations", { childId, id, status })
  }

  runAnalyze(childId: string): Promise<CoachAnalysis> {
    return post("/api/coach/analyze", { childId })
  }

  fetchProgram(childId: string): Promise<{ program: CoachProgram; daily: DailyLearningPlan | null; weekly: WeeklyLearningPlan | null }> {
    return get(`/api/coach/program?childId=${encodeURIComponent(childId)}`)
  }

  sendMessage(
    childId: string,
    content: string,
  ): Promise<{ reply: string; intent: string; filtered: boolean; messages: import("../types/coach").CoachMessage[] }> {
    return post("/api/coach/message", { childId, content })
  }

  fetchMessages(childId: string): Promise<{ messages: import("../types/coach").CoachMessage[] }> {
    return get(`/api/coach/history?childId=${encodeURIComponent(childId)}&kind=messages`)
  }

  fetchHistory(childId: string): Promise<{ history: CoachHistoryItem[] }> {
    return get(`/api/coach/history?childId=${encodeURIComponent(childId)}`)
  }

  fetchPredictions(childId: string): Promise<{ predictions: LearningPrediction | null }> {
    return get(`/api/coach/predictions?childId=${encodeURIComponent(childId)}`)
  }

  fetchReport(childId: string): Promise<{ report: MonthlyLearningReport | null }> {
    return get(`/api/coach/report?childId=${encodeURIComponent(childId)}`)
  }
}

export const coachService = new CoachService()
