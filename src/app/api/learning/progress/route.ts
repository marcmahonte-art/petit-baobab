import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningPaths } from "@/features/learning-paths/services/seed"
import { getPathById, LESSON_BASE_XP, LESSON_BASE_STARS, flattenLessons } from "@/features/learning-paths/constants"
import { pathEngine } from "@/features/learning-paths/engine/path-engine"
import type { ChildLearningProgress } from "@/features/learning-paths/types"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")
    if (!childId) {
      return NextResponse.json({ error: "Paramètre childId manquant" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningPaths(supabase)

    const { data: rows } = await supabase
      .from("child_learning_progress")
      .select("*")
      .eq("child_id", childId)
      .order("completed_at", { ascending: true })

    return NextResponse.json({ progress: (rows ?? []) as ChildLearningProgress[] })
  } catch (err) {
    console.error("Learning progress API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { childId, pathId, lessonId } = body as { childId?: string; pathId?: string; lessonId?: string }
    if (!childId || !pathId || !lessonId) {
      return NextResponse.json({ error: "Paramètres childId, pathId et lessonId requis" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningPaths(supabase)

    const path = getPathById(pathId)
    if (!path) {
      return NextResponse.json({ error: "Parcours introuvable" }, { status: 404 })
    }
    const lesson = flattenLessons(path).find((l) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 })
    }

    // Déjà validée ?
    const { data: existing } = await supabase
      .from("child_learning_progress")
      .select("id")
      .eq("child_id", childId)
      .eq("path_id", pathId)
      .eq("module_id", lesson.module_id)
      .eq("lesson_id", lessonId)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ alreadyCompleted: true })
    }

    const { data: rows } = await supabase
      .from("child_learning_progress")
      .select("*")
      .eq("child_id", childId)
      .eq("path_id", pathId)

    const statuses = pathEngine.getLessonStatuses(path, (rows ?? []) as ChildLearningProgress[])
    const current = statuses[lesson.id]

    // Seule la leçon en cours (ou suivante du parcours) peut être validée.
    const nextLessonId = pathEngine.getNextLesson(path, (rows ?? []) as ChildLearningProgress[])?.id
    if (lessonId !== nextLessonId && current !== "in_progress") {
      return NextResponse.json({ error: "Leçon non disponible" }, { status: 409 })
    }

    const now = new Date().toISOString()
    const { error: insertError } = await supabase.from("child_learning_progress").insert({
      child_id: childId,
      path_id: pathId,
      module_id: lesson.module_id,
      lesson_id: lessonId,
      status: "completed",
      progress_pct: 100,
      completed_at: now,
    })
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      completed: true,
      reward: {
        xp: LESSON_BASE_XP[lesson.lesson_type] + lesson.reward_xp,
        stars: LESSON_BASE_STARS[lesson.lesson_type] + lesson.reward_stars,
      },
    })
  } catch (err) {
    console.error("Learning progress API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
