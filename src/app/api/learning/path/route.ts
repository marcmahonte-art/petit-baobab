import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningPaths } from "@/features/learning-paths/services/seed"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const id = searchParams.get("id")
    if (!slug && !id) {
      return NextResponse.json({ error: "Paramètre slug ou id manquant" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningPaths(supabase)

    const key = slug ?? id
    const { data: path } = await supabase.from("learning_paths").select("*").or(`slug.eq.${key},id.eq.${key}`).single()

    if (!path) {
      return NextResponse.json({ error: "Parcours introuvable" }, { status: 404 })
    }

    const { data: modules } = await supabase.from("learning_modules").select("*").eq("path_id", path.id).order("order_index")
    const moduleIds = (modules ?? []).map((m) => m.id)

    const { data: lessons } = moduleIds.length
      ? await supabase.from("learning_lessons").select("*").in("module_id", moduleIds).order("order_index")
      : { data: [] }

    return NextResponse.json({
      path,
      modules: (modules ?? []).map((m) => ({
        ...m,
        lessons: (lessons ?? []).filter((l) => l.module_id === m.id),
      })),
    })
  } catch (err) {
    console.error("Learning path API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
