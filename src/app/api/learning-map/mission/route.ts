import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningMap } from "@/features/learning-paths/services/map-service"
import type { LearningMission } from "@/features/learning-paths/types"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const missionId = searchParams.get("id")
    if (!missionId) {
      return NextResponse.json({ error: "Paramètre id manquant" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningMap(supabase)

    const { data: mission } = await supabase
      .from("learning_missions")
      .select("*")
      .eq("id", missionId)
      .maybeSingle()

    if (!mission) {
      return NextResponse.json({ error: "Mission introuvable" }, { status: 404 })
    }

    const { data: region } = await supabase
      .from("learning_regions")
      .select("*")
      .eq("id", (mission as LearningMission).region_id)
      .maybeSingle()

    const { data: rewards } = await supabase
      .from("mission_rewards")
      .select("*")
      .eq("mission_id", missionId)

    return NextResponse.json({ mission, region, rewards: rewards ?? [] })
  } catch (err) {
    console.error("Learning mission API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
