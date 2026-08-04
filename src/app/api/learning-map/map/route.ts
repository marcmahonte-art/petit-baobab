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

    const supabase = await getSupabaseServer()
    await seedLearningMap(supabase)

    const { data: regionRows } = await supabase.from("learning_regions").select("*").order("order_index")
    const { data: missionRows } = await supabase.from("learning_missions").select("*").order("order_index")
    const { data: statsRows } = childId
      ? await supabase.from("learning_statistics").select("*").eq("child_id", childId).maybeSingle()
      : { data: null }

    const regions = (regionRows ?? []) as unknown as LearningRegion[]
    const missions = (missionRows ?? []) as unknown as LearningMission[]
    const missionsByRegion: Record<string, LearningMission[]> = {}
    for (const m of missions) {
      if (!missionsByRegion[m.region_id]) missionsByRegion[m.region_id] = []
      missionsByRegion[m.region_id].push(m)
    }

    const totalXp = (statsRows as { total_xp?: number } | null)?.total_xp ?? 0

    const regionProgress = regions.map((region) => ({
      regionId: region.id,
      status: mapEngine.getRegionStatus(region, totalXp),
    }))

    return NextResponse.json({ regions, missions, missionsByRegion, regionProgress, totalXp })
  } catch (err) {
    console.error("Learning map API error:", err)
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
    const { childId, missionId } = body as { childId?: string; missionId?: string }
    if (!childId || !missionId) {
      return NextResponse.json({ error: "childId et missionId requis" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    const { data: mission } = await supabase
      .from("learning_missions")
      .select("*")
      .eq("id", missionId)
      .maybeSingle()

    if (!mission) {
      return NextResponse.json({ error: "Mission introuvable" }, { status: 404 })
    }

    const now = new Date().toISOString()
    await supabase.from("child_mission_progress").upsert(
      {
        child_id: childId,
        mission_id: missionId,
        status: "in_progress",
        progress: 10,
        started_at: now,
        completed_at: null,
      },
      { onConflict: "child_id,mission_id" },
    )

    return NextResponse.json({ started: true, mission })
  } catch (err) {
    console.error("Learning map API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
