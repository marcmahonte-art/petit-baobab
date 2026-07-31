import type { GameEventType } from "../../gamification/types"
import { eventBus } from "../../gamification/event-bus"
import { getSupabaseClient } from "@/lib/supabase-client"
import { pathEngine } from "../engine/path-engine"
import { useLearningStore } from "../store/learning-store"
import { seedLearningPaths } from "./seed"
import {
  LESSON_EVENT_MAP,
  flattenLessons,
  getActivePaths,
} from "../constants"
import type {
  ChildLearningProgress,
  LearningCertificate,
  LearningLesson,
  LearningPath,
} from "../types"

type Supabase = ReturnType<typeof getSupabaseClient>

export class LearningService {
  private childId: string | null = null
  private cleanup: (() => void) | null = null
  private initialized = false

  async init(childId: string): Promise<void> {
    this.childId = childId
    const store = useLearningStore.getState()
    store.set({ childId, loading: true })

    try {
      const supabase = getSupabaseClient()
      await seedLearningPaths(supabase)

      const [paths, progress, certificates] = await Promise.all([
        this.loadPaths(supabase),
        this.loadAllProgress(supabase, childId),
        this.loadCertificates(supabase, childId),
      ])

      const progressByPath: Record<string, ChildLearningProgress[]> = {}
      for (const row of progress) {
        if (!progressByPath[row.path_id]) progressByPath[row.path_id] = []
        progressByPath[row.path_id].push(row)
      }

      store.set({
        paths,
        progress: progressByPath,
        certificates,
        loading: false,
        initialized: true,
      })
    } catch {
      // Offline : on utilise le contenu canonique, aucun progrès chargé.
      store.set({
        paths: getActivePaths(),
        progress: {},
        certificates: [],
        loading: false,
        initialized: true,
      })
    }

    if (!this.initialized) {
      this.cleanup = eventBus.onAny((payload) => {
        if (payload.childId === this.childId) {
          void this.handleEvent(payload.type)
        }
      })
      this.initialized = true
    }
  }

  dispose(): void {
    this.cleanup?.()
    this.initialized = false
  }

  // -------------------------------------------------------------------------
  // Chargement
  // -------------------------------------------------------------------------

  private async loadPaths(supabase: Supabase): Promise<LearningPath[]> {
    const { data } = await supabase.from("learning_paths").select("*").order("order_index")
    return (data ?? []) as unknown as LearningPath[]
  }

  private async loadAllProgress(supabase: Supabase, childId: string): Promise<ChildLearningProgress[]> {
    const { data } = await supabase
      .from("child_learning_progress")
      .select("*")
      .eq("child_id", childId)
    return (data ?? []) as ChildLearningProgress[]
  }

  private async loadCertificates(supabase: Supabase, childId: string): Promise<LearningCertificate[]> {
    const { data } = await supabase
      .from("learning_certificates")
      .select("*")
      .eq("child_id", childId)
      .order("issued_at", { ascending: false })
    return (data ?? []) as LearningCertificate[]
  }

  // -------------------------------------------------------------------------
  // Validation automatique des leçons via le bus d'événements
  // -------------------------------------------------------------------------

  async handleEvent(event: GameEventType): Promise<void> {
    const childId = this.childId
    if (!childId) return
    const store = useLearningStore.getState()

    for (const path of store.paths) {
      const rows = store.progress[path.id] ?? []
      const progress = pathEngine.computePathProgress(path, rows)
      if (progress.completed) continue

      const next = progress.nextLesson
      if (!next) continue

      // Seules les leçons automatiquement validables correspondent à un événement.
      const expectedEvent = LESSON_EVENT_MAP[next.lesson_type]
      if (expectedEvent !== event) continue

      await this.completeLesson(path, next, childId)
      break
    }
  }

  async completeLesson(path: LearningPath, lesson: LearningLesson, childId = this.childId ?? undefined): Promise<void> {
    if (!childId) return
    const store = useLearningStore.getState()
    const rows = store.progress[path.id] ?? []
    const before = pathEngine.computePathProgress(path, rows)
    const wasModuleDone = before.modules.find((m) => m.module.id === lesson.module_id)?.status === "completed"

    const updated = pathEngine.applyLessonCompletion(path, rows, lesson.id, childId)

    store.setProgress(path.id, updated)
    this.persistProgress(path.id, updated)

    const after = pathEngine.computePathProgress(path, updated)

    // Récompense de la leçon
    const grant = {
      xp: lesson.reward_xp,
      stars: lesson.reward_stars,
      badges: [] as string[],
      stickers: [] as string[],
    }

    // Bonus de module
    const moduleNowDone = after.modules.find((m) => m.module.id === lesson.module_id)
    if (moduleNowDone?.status === "completed" && !wasModuleDone) {
      grant.xp += Math.max(0, moduleNowDone.module.reward_xp - moduleNowDone.module.lessons.reduce((s, l) => s + l.reward_xp, 0))
    }

    store.addReward(grant)
    store.openReward(grant)

    // Complétion du parcours → certificat
    if (after.completed && !before.completed) {
      store.openPathCompleted(path)
      await this.issueCertificate(path, childId)
    }
  }

  async startLesson(pathId: string, lessonId: string): Promise<void> {
    const childId = this.childId
    if (!childId) return
    const store = useLearningStore.getState()
    const path = store.paths.find((p) => p.id === pathId)
    if (!path) return

    const rows = store.progress[pathId] ?? []
    const lesson = flattenLessons(path).find((l) => l.id === lessonId)
    if (!lesson) return
    if (rows.some((r) => r.lesson_id === lessonId)) return

    const updated = [
      ...rows,
      {
        child_id: childId,
        path_id: path.id,
        module_id: lesson.module_id,
        lesson_id: lessonId,
        status: "in_progress" as const,
        progress: 10,
        completed_at: null,
      },
    ]
    store.setProgress(pathId, updated)
    await this.persistProgress(pathId, updated)
  }

  /** Validation directe d'une leçon (bouton "J'ai terminé" pour VIDEO et cas manuels). */
  async completeLessonByPath(pathId: string, lessonId: string): Promise<void> {
    const childId = this.childId
    if (!childId) return
    const store = useLearningStore.getState()
    const path = store.paths.find((p) => p.id === pathId)
    if (!path) return
    const lesson = flattenLessons(path).find((l) => l.id === lessonId)
    if (!lesson) return
    await this.completeLesson(path, lesson, childId)
  }

  // -------------------------------------------------------------------------
  // Persistance
  // -------------------------------------------------------------------------

  private async persistProgress(pathId: string, rows: ChildLearningProgress[]): Promise<void> {
    const childId = this.childId
    if (!childId) return
    try {
      const supabase = getSupabaseClient()
      const upserts = rows
        .filter((r) => r.lesson_id !== null || (r.module_id === null && r.path_id === pathId))
        .map((r) => ({
          child_id: r.child_id,
          path_id: r.path_id,
          module_id: r.module_id,
          lesson_id: r.lesson_id,
          status: r.status,
          progress_pct: r.progress,
          completed_at: r.completed_at,
        }))
      if (upserts.length > 0) {
        await supabase.from("child_learning_progress").upsert(upserts, {
          onConflict: "child_id,path_id,module_id,lesson_id",
        })
      }
    } catch {
      // Offline : Zustand reste la source de vérité (optimistic).
    }
  }

  async issueCertificate(path: LearningPath, childId: string): Promise<void> {
    const store = useLearningStore.getState()
    const token = `${path.slug}_${crypto.randomUUID()}`

    const certificate: LearningCertificate = {
      id: crypto.randomUUID(),
      child_id: childId,
      path_id: path.id,
      path_title: path.title,
      child_name: "",
      mascot: path.mascot,
      issued_at: new Date().toISOString(),
      token,
      pdf_url: null,
    }
    store.addCertificate(certificate)

    try {
      const supabase = getSupabaseClient()
      await supabase.from("learning_certificates").insert({
        child_id: childId,
        path_id: path.id,
        path_title: path.title,
        child_name: "",
        mascot: path.mascot,
        token,
        issued_at: certificate.issued_at,
      })
    } catch {
      // Offline
    }
  }
}

export const learningService = new LearningService()
