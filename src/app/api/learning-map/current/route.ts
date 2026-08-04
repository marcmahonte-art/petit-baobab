import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningMap } from "@/features/learning-paths/services/map-service"
import { mapEngine } from "@/features/learning-paths/engine/map-engine"
import type { ChildMissionProgress, LearningMission, LearningRegion } from "@/features/learning-paths/types"

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

    const { data: regionRows } = await supabase.from("learning_regions").select("*").order("order_index")
    const { data: missionRows } = await supabase.from("learning_missions").select("*").order("order_index")
    const { data: progressRows } = await supabase
      .from("child_mission_progress")
      .select("*")
      .eq("child_id", childId)
    const { data: statsRows } = await supabase
      .from("learning_statistics")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle()

    const regions = (regionRows ?? []) as unknown as LearningRegion[]
    const missions = (missionRows ?? []) as unknown as LearningMission[]
    const progress = (progressRows ?? []) as ChildMissionProgress[]
    const totalXp = (statsRows as { total_xp?: number } | null)?.total_xp ?? 0

    const missionsByRegion: Record<string, LearningMission[]> = {}
    for (const m of missions) {
      if (!missionsByRegion[m.region_id]) missionsByRegion[m.region_id] = []
      missionsByRegion[m.region_id].push(m)
    }

    const currentMission = mapEngine.getCurrentMission(regions, missionsByRegion, progress, totalXp)
    const currentRegion = currentMission
      ? regions.find((r) => r.id === currentMission.region_id) ?? null
      : null
    const sideQuests = mapEngine.getSideQuests(currentMission, regions, missionsByRegion, progress, totalXp)
    const completedCount = progress.filter((p) => p.status === "completed").length

    return NextResponse.json({
      currentMission,
      currentRegion,
      sideQuests,
      totalXp,
      completedCount,
    })
  } catch (err) {
    console.error("Learning current API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
