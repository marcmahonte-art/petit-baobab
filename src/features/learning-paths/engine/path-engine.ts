import type {
  ChildLearningProgress,
  LearningLesson,
  LearningModule,
  LearningPath,
  LessonStatus,
  ModuleProgress,
  PathProgress,
  PathStatus,
  RecommendationContext,
  RecommendationScore,
} from "../types"
import type { GameEventType } from "../../gamification/types"
import {
  PATH_DIFFICULTIES,
  flattenLessons,
  getActivePaths,
  getDifficulty,
  getPathById,
} from "../constants"

/**
 * Moteur pur du système de parcours éducatifs.
 * Aucune I/O : toute la logique de progression, de déblocage et de
 * recommandation vit ici et reste testable hors-ligne.
 */
export class PathEngine {
  // -------------------------------------------------------------------------
  // Progression
  // -------------------------------------------------------------------------

  getCompletedLessonIds(rows: ChildLearningProgress[]): Set<string> {
    const ids = new Set<string>()
    for (const row of rows) {
      if (row.lesson_id && row.status === "completed") ids.add(row.lesson_id)
    }
    return ids
  }

  getModuleCompletion(path: LearningPath, completedLessons: Set<string>): Record<string, { done: boolean; completedAt: string | null }> {
    const result: Record<string, { done: boolean; completedAt: string | null }> = {}
    for (const mod of path.modules) {
      const all = mod.lessons.every((l) => completedLessons.has(l.id))
      result[mod.id] = { done: all, completedAt: null }
    }
    return result
  }

  /** Statut calculé d'une leçon (locked / available / in_progress / completed). */
  getLessonStatuses(path: LearningPath, rows: ChildLearningProgress[]): Record<string, LessonStatus> {
    const completed = this.getCompletedLessonIds(rows)
    const statuses: Record<string, LessonStatus> = {}

    const inProgress = new Set(
      rows.filter((r) => r.lesson_id && r.status === "in_progress").map((r) => r.lesson_id as string),
    )

    for (const lesson of flattenLessons(path)) {
      if (completed.has(lesson.id)) {
        statuses[lesson.id] = "completed"
        continue
      }
      if (inProgress.has(lesson.id)) {
        statuses[lesson.id] = "in_progress"
        continue
      }
      statuses[lesson.id] = "locked"
    }

    // La première leçon non terminée devient disponible.
    for (const lesson of flattenLessons(path)) {
      if (statuses[lesson.id] === "locked") {
        statuses[lesson.id] = "available"
        break
      }
    }

    return statuses
  }

  getNextLesson(path: LearningPath, rows: ChildLearningProgress[]): LearningLesson | null {
    const statuses = this.getLessonStatuses(path, rows)
    for (const lesson of flattenLessons(path)) {
      if (statuses[lesson.id] === "available") return lesson
    }
    return null
  }

  computePathProgress(path: LearningPath, rows: ChildLearningProgress[]): PathProgress {
    const completed = this.getCompletedLessonIds(rows)
    const totalLessons = flattenLessons(path).length
    const completedLessons = completed.size

    const modules: ModuleProgress[] = path.modules.map((module) => {
      const moduleLessons = module.lessons
      const done = moduleLessons.filter((l) => completed.has(l.id)).length
      const isDone = done === moduleLessons.length
      const moduleRows = rows.filter((r) => r.module_id === module.id)
      const completedRow = moduleRows.find((r) => r.lesson_id === null && r.status === "completed")
      return {
        module,
        status: isDone ? ("completed" as PathStatus) : ("in_progress" as PathStatus),
        completedLessons: done,
        totalLessons: moduleLessons.length,
        progress: moduleLessons.length ? Math.round((done / moduleLessons.length) * 100) : 0,
        completedAt: completedRow?.completed_at ?? null,
      }
    })

    const allDone = completedLessons === totalLessons && totalLessons > 0
    const pathRow = rows.find((r) => r.lesson_id === null && r.module_id === null && r.path_id === path.id)
    const started = completedLessons > 0

    return {
      path,
      status: allDone ? "completed" : started ? "in_progress" : "available",
      totalLessons,
      completedLessons,
      progress: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
      currentModule: modules.find((m) => m.status !== "completed")?.module ?? null,
      nextLesson: this.getNextLesson(path, rows),
      completed: allDone,
      completedAt: pathRow?.completed_at ?? null,
      modules,
    }
  }

  isPathCompleted(path: LearningPath, rows: ChildLearningProgress[]): boolean {
    return this.computePathProgress(path, rows).completed
  }

  /**
   * Validation automatique d'une leçon : ajoute la leçon aux terminées et
   * débloque la suivante. Retourne la liste des lignes de progression à jour.
   */
  applyLessonCompletion(
    path: LearningPath,
    rows: ChildLearningProgress[],
    lessonId: string,
    childId: string,
    now = new Date().toISOString(),
  ): ChildLearningProgress[] {
    const lesson = flattenLessons(path).find((l) => l.id === lessonId)
    if (!lesson) return rows

    const next = this.getNextLesson(path, rows)
    // On n'autorise que la validation de la leçon disponible (ou déjà commencée).
    if (next?.id !== lessonId && !rows.some((r) => r.lesson_id === lessonId && r.status === "in_progress")) {
      return rows
    }

    const completed = this.getCompletedLessonIds(rows)
    completed.add(lessonId)

    const nextLesson = flattenLessons(path).find((l) => !completed.has(l.id) && l.order_index > lesson.order_index)

    const updated = rows.filter((r) => r.lesson_id !== lessonId && r.lesson_id !== nextLesson?.id)

    updated.push({
      child_id: childId,
      path_id: path.id,
      module_id: lesson.module_id,
      lesson_id: lessonId,
      status: "completed",
      progress: 100,
      completed_at: now,
    })

    if (nextLesson) {
      updated.push({
        child_id: childId,
        path_id: path.id,
        module_id: nextLesson.module_id,
        lesson_id: nextLesson.id,
        status: "available",
        progress: 0,
        completed_at: null,
      })
    }

    // Complétion de module
    const moduleDone = this.getModuleCompletion(path, completed)
    for (const mod of path.modules) {
      if (moduleDone[mod.id].done && !rows.some((r) => r.module_id === mod.id && r.lesson_id === null && r.status === "completed")) {
        updated.push({
          child_id: childId,
          path_id: path.id,
          module_id: mod.id,
          lesson_id: null,
          status: "completed",
          progress: 100,
          completed_at: now,
        })
      }
    }

    // Complétion du parcours
    if (completed.size === flattenLessons(path).length && !rows.some((r) => r.path_id === path.id && r.lesson_id === null && r.module_id === null && r.status === "completed")) {
      updated.push({
        child_id: childId,
        path_id: path.id,
        module_id: null,
        lesson_id: null,
        status: "completed",
        progress: 100,
        completed_at: now,
      })
    }

    return updated
  }

  /** Récupère une leçon précise dans un parcours. */
  getLesson(path: LearningPath, lessonId: string): LearningLesson | undefined {
    return flattenLessons(path).find((l) => l.id === lessonId)
  }

  getLessonModule(path: LearningPath, lesson: LearningLesson): LearningModule | undefined {
    return path.modules.find((m) => m.id === lesson.module_id)
  }

  // -------------------------------------------------------------------------
  // Recommandations & personnalisation
  // -------------------------------------------------------------------------

  /**
   * Personnalisation : transforme l'activité réelle de l'enfant en affinités.
   * Exemple : l'enfant colorie et joue avec les animaux → affinités
   * ["animals", "art", "nature"] → le moteur recommande Animaux, Safari,
   * Nature, Afrique au lieu d'Alphabet.
   */
  buildPreferences(context: RecommendationContext): string[] {
    const prefs = new Set<string>(context.preferences ?? [])

    const activityTags: Partial<Record<GameEventType, string[]>> = {
      DRAWING_COMPLETED: ["art", "creativity"],
      COLORING_COMPLETED: ["art", "colors", "creativity"],
      BOOK_CREATED: ["reading", "stories", "creativity"],
      STORY_CREATED: ["stories", "reading"],
      GAME_COMPLETED: ["logic", "math"],
      QUIZ_COMPLETED: ["learning", "logic", "science"],
      MAGIC_DRAWING_CREATED: ["art", "creativity", "imagination"],
    }

    for (const [event, tags] of Object.entries(activityTags)) {
      const count = context.activities?.[event as GameEventType] ?? 0
      if (count > 0) tags.forEach((t) => prefs.add(t))
      if (count >= 3) tags.forEach((t) => prefs.add(t))
    }

    return [...prefs]
  }

  getRecommendations(context: RecommendationContext): RecommendationScore[] {
    const paths = getActivePaths()
    const preferences = this.buildPreferences(context)
    const completed = new Set(context.completedPathIds ?? [])
    const scored: RecommendationScore[] = []

    for (const path of paths) {
      if (completed.has(path.id)) continue

      let score = 0
      const reasons: string[] = []

      // Adéquation à l'âge
      const age = context.age
      if (age !== undefined) {
        if (age >= path.age_min && age <= path.age_max) {
          score += 40
          reasons.push("adapté à ton âge")
        } else if (age >= path.age_min - 1 && age <= path.age_max + 1) {
          score += 15
        } else {
          score -= 50
        }
      }

      // Adéquation au niveau (difficulté)
      const level = context.level ?? 1
      const difficulty = getDifficulty(path.difficulty)
      if (level >= difficulty.recommendedMinLevel) {
        score += 15
      } else if (level >= difficulty.recommendedMinLevel - 2) {
        score += 5
      } else {
        score -= 20
      }

      // Affinités personnalisées
      const matches = path.tags.filter((t) => preferences.includes(t))
      score += matches.length * 10
      if (matches.length > 0) {
        reasons.push(...matches.map((t) => `tu adores les ${t === "animals" ? "animaux" : t}`))
      }

      // Temps d'apprentissage : les parcours un peu plus longs conviennent aux habitués
      const minutes = context.learningMinutes ?? 0
      if (minutes >= 20) score += 5

      scored.push({ path, score, reasons })
    }

    return scored
      .filter((s) => s.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }

  /** Top des parcours "en cours" pour la page d'accueil. */
  getInProgressPaths(paths: LearningPath[], rowsByPath: Record<string, ChildLearningProgress[]>): PathProgress[] {
    return paths
      .map((p) => this.computePathProgress(p, rowsByPath[p.id] ?? []))
      .filter((p) => p.status === "in_progress")
      .sort((a, b) => b.progress - a.progress)
  }

  getCompletedPaths(paths: LearningPath[], rowsByPath: Record<string, ChildLearningProgress[]>): PathProgress[] {
    return paths
      .map((p) => this.computePathProgress(p, rowsByPath[p.id] ?? []))
      .filter((p) => p.status === "completed")
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
  }

  /** Nombre total de leçons pour un niveau de difficulté donné. */
  getRecommendedPathForLevel(level: number, context: RecommendationContext): LearningPath | null {
    const recs = this.getRecommendations({ ...context, level })
    return recs[0]?.path ?? getPathById("petit-artiste") ?? getActivePaths()[0] ?? null
  }

  getDifficultyLabel(difficulty: string): string {
    return PATH_DIFFICULTIES.find((d) => d.key === difficulty)?.label ?? "Débutant"
  }
}

export const pathEngine = new PathEngine()
