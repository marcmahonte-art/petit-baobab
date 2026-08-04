import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningMap } from "@/features/learning-paths/services/map-service"

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

    const { data: progressRows } = await supabase
      .from("child_mission_progress")
      .select("mission_id, completed_at")
      .eq("child_id", childId)
      .eq("status", "completed")

    const missionIds = (progressRows ?? []).map((r) => r.mission_id as string)
    const { data: rewardRows } = missionIds.length
      ? await supabase.from("mission_rewards").select("*").in("mission_id", missionIds)
      : { data: [] }

    return NextResponse.json({ rewards: rewardRows ?? [] })
  } catch (err) {
    console.error("Learning rewards API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
