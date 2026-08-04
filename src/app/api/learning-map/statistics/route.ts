import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningMap } from "@/features/learning-paths/services/map-service"
import { mapEngine } from "@/features/learning-paths/engine/map-engine"
import { getLevelForXp } from "@/features/learning-paths/constants/map-constants"

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
    await seedLearningMap(supabase)

    const { data: statsRows } = await supabase
      .from("learning_statistics")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle()
    const { data: progressRows } = await supabase
      .from("child_mission_progress")
      .select("*")
      .eq("child_id", childId)
    const { data: regionRows } = await supabase.from("learning_regions").select("*").order("order_index")

    const stats = (statsRows ?? {}) as Record<string, unknown>
    const totalXp = (stats.total_xp as number) ?? 0
    const radar = {
      creativity: (stats.creativity as number) ?? 0,
      reading: (stats.reading as number) ?? 0,
      observation: (stats.observation as number) ?? 0,
      logic: (stats.logic as number) ?? 0,
      perseverance: (stats.perseverance as number) ?? 0,
      imagination: (stats.imagination as number) ?? 0,
    }
    const regionsUnlocked = (regionRows ?? []).filter(
      (r) => mapEngine.getRegionStatus(r as never, totalXp) !== "locked",
    ).length

    const completedMissions = (progressRows ?? []).filter((p) => p.status === "completed").length

    return NextResponse.json({
      statistics: {
        totalXp,
        missionsCompleted: completedMissions,
        regionsUnlocked,
        timeSpentSeconds: (stats.time_spent_seconds as number) ?? 0,
        creativity: radar.creativity,
        reading: radar.reading,
        observation: radar.observation,
        logic: radar.logic,
        perseverance: radar.perseverance,
        imagination: radar.imagination,
        level: getLevelForXp(totalXp).level,
        updatedAt: (stats.updated_at as string) ?? null,
      },
      radar,
    })
  } catch (err) {
    console.error("Learning statistics API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
