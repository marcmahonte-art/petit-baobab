import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningMap } from "@/features/learning-paths/services/map-service"
import { mapEngine } from "@/features/learning-paths/engine/map-engine"
import { getMissionById } from "@/features/learning-paths/constants/map-constants"

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

    const mission = getMissionById(missionId)
    if (!mission) {
      return NextResponse.json({ error: "Mission introuvable" }, { status: 404 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningMap(supabase)

    const { data: existing } = await supabase
      .from("child_mission_progress")
      .select("status")
      .eq("child_id", childId)
      .eq("mission_id", missionId)
      .maybeSingle()
    if (existing?.status === "completed") {
      return NextResponse.json({ alreadyCompleted: true, reward: { xp: 0, stars: 0, badge: null } })
    }

    const { data: statsRows } = await supabase
      .from("learning_statistics")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle()
    const stats = statsRows as {
      creativity?: number
      reading?: number
      observation?: number
      logic?: number
      perseverance?: number
      imagination?: number
      total_xp?: number
      time_spent_seconds?: number
      missions_completed?: number
      regions_unlocked?: number
    } | null

    const radar = {
      creativity: stats?.creativity ?? 0,
      reading: stats?.reading ?? 0,
      observation: stats?.observation ?? 0,
      logic: stats?.logic ?? 0,
      perseverance: stats?.perseverance ?? 0,
      imagination: stats?.imagination ?? 0,
    }
    const nextRadar = mapEngine.updateRadar(radar, mission.type)

    const totalXp = (stats?.total_xp ?? 0) + mission.xp

    await supabase.from("child_mission_progress").upsert(
      {
        child_id: childId,
        mission_id: missionId,
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "child_id,mission_id" },
    )

    await supabase.from("learning_statistics").upsert(
      {
        child_id: childId,
        creativity: nextRadar.creativity,
        reading: nextRadar.reading,
        observation: nextRadar.observation,
        logic: nextRadar.logic,
        perseverance: nextRadar.perseverance,
        imagination: nextRadar.imagination,
        total_xp: totalXp,
        time_spent_seconds: stats?.time_spent_seconds ?? 0,
        missions_completed: (stats?.missions_completed ?? 0) + 1,
        regions_unlocked: stats?.regions_unlocked ?? 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "child_id" },
    )

    return NextResponse.json({
      completed: true,
      reward: { xp: mission.xp, stars: mission.stars, badge: mission.badge ?? null },
      radar: nextRadar,
      totalXp,
    })
  } catch (err) {
    console.error("Learning complete API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
