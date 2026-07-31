import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningPaths } from "@/features/learning-paths/services/seed"
import { pathEngine } from "@/features/learning-paths/engine/path-engine"
import type { ChildLearningProgress } from "@/features/learning-paths/types"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningPaths(supabase)

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")

    const { data: pathRows } = await supabase.from("learning_paths").select("*").order("order_index")
    const { data: moduleRows } = await supabase.from("learning_modules").select("*").order("order_index")
    const { data: lessonRows } = await supabase.from("learning_lessons").select("*").order("order_index")

    type ModuleRow = { id: string; path_id: string }
    type LessonRow = { id: string; module_id: string }
    const modulesByPath: Record<string, ModuleRow[]> = {}
    for (const m of (moduleRows ?? []) as ModuleRow[]) {
      if (!modulesByPath[m.path_id]) modulesByPath[m.path_id] = []
      modulesByPath[m.path_id].push(m)
    }
    const lessonsByModule: Record<string, LessonRow[]> = {}
    for (const l of (lessonRows ?? []) as LessonRow[]) {
      if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = []
      lessonsByModule[l.module_id].push(l)
    }

    const paths = (pathRows ?? []).map((p) => ({
      ...p,
      modules: (modulesByPath[p.id] ?? []).map((m) => ({
        ...m,
        lessons: lessonsByModule[m.id] ?? [],
      })),
    }))

    // Progression de l'enfant (si demandé)
    let progress: ChildLearningProgress[] = []
    if (childId) {
      const { data } = await supabase
        .from("child_learning_progress")
        .select("*")
        .eq("child_id", childId)
      progress = (data ?? []) as ChildLearningProgress[]
    }

    // Synthèse par parcours pour l'enfant
    const summaries = childId
      ? paths.map((p) => {
          const rows = progress.filter((r) => r.path_id === p.id)
          return { pathId: p.id, ...pathEngine.computePathProgress(p as never, rows) }
        })
      : null

    return NextResponse.json({ paths, progress, summaries })
  } catch (err) {
    console.error("Learning API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
