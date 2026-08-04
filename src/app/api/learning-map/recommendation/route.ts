import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningMap } from "@/features/learning-paths/services/map-service"
import { pathEngine } from "@/features/learning-paths/engine/path-engine"
import { getLevelForXp } from "@/features/learning-paths/constants/map-constants"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")
    const age = Number(searchParams.get("age") ?? "0") || undefined
    if (!childId) {
      return NextResponse.json({ error: "Paramètre childId manquant" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningMap(supabase)

    const { data: statsRows } = await supabase
      .from("learning_statistics")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle()
    const stats = (statsRows ?? {}) as { total_xp?: number; time_spent_seconds?: number } | null
    const totalXp = stats?.total_xp ?? 0

    const { data: progressRows } = await supabase
      .from("child_learning_progress")
      .select("*")
      .eq("child_id", childId)
    const progress = (progressRows ?? []) as Array<{ path_id?: string }>
    const completedPathIds = [...new Set(progress.filter((r) => r.path_id).map((r) => r.path_id!))]

    const recommendations = pathEngine.getRecommendations({
      age,
      level: getLevelForXp(totalXp).level,
      completedPathIds,
      learningMinutes: Math.floor((stats?.time_spent_seconds ?? 0) / 60),
    })

    const radar = {
      creativity: (statsRows as { creativity?: number })?.creativity ?? 0,
      reading: (statsRows as { reading?: number })?.reading ?? 0,
      observation: (statsRows as { observation?: number })?.observation ?? 0,
      logic: (statsRows as { logic?: number })?.logic ?? 0,
      perseverance: (statsRows as { perseverance?: number })?.perseverance ?? 0,
      imagination: (statsRows as { imagination?: number })?.imagination ?? 0,
    }
    const strongestAxis = Object.entries(radar).sort((a, b) => b[1] - a[1])[0]

    const advice =
      "Continue à explorer la carte ! Chaque mission complétée rend le Baobab un peu plus fier."

    return NextResponse.json({
      recommendations,
      advice,
      strongestAxis: strongestAxis ? { axis: strongestAxis[0], value: strongestAxis[1] } : null,
    })
  } catch (err) {
    console.error("Learning recommendation API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
