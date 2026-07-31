import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { loadWorld, worldEngine } from "@/features/baobab-world/world/engine"
import { TREE_STAGES, STAGE_LEVELS } from "@/features/baobab-world/constants"

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

    const { data: profile } = await supabase
      .from("child_profiles")
      .select("id")
      .eq("id", childId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })
    }

    const world = await loadWorld(supabase, childId)
    const treeLevel = world?.tree_level ?? 1
    const stage = worldEngine.getStage(treeLevel)
    const nextTarget = worldEngine.getNextGrowthTarget(treeLevel)

    return NextResponse.json({
      world,
      treeLevel,
      stage,
      nextTarget,
      progress: {
        current: treeLevel,
        max: STAGE_LEVELS[STAGE_LEVELS.length - 1],
        stages: TREE_STAGES.map((s) => ({
          ...s,
          reached: treeLevel >= s.level,
          current: stage.stage === s.stage,
        })),
      },
      growthPerEvent: worldEngine.calculateGrowth,
    })
  } catch (err) {
    console.error("World growth API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
