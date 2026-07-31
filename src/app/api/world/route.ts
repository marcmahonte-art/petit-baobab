import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { loadWorld, loadObjects, loadHistory, worldEngine } from "@/features/baobab-world/world/engine"
import { getSeasonForMonth, getTimeOfDay } from "@/features/baobab-world/constants"

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

    const [loadedWorld, objects, history] = await Promise.all([
      loadWorld(supabase, childId),
      loadObjects(supabase, childId),
      loadHistory(supabase, childId),
    ])

    let world = loadedWorld

    if (!world) {
      world = worldEngine.generateWorld(childId)
      await supabase.from("child_world").insert({
        child_id: childId,
        tree_level: world.tree_level,
        world_level: world.world_level,
        background_theme: world.background_theme,
        weather: world.weather,
        season: world.season,
      })
    }

    const stage = worldEngine.getStage(world.tree_level)
    const allObjects = worldEngine.getAllObjects(childId, objects)
    const season = getSeasonForMonth(new Date().getMonth())
    const timeOfDay = getTimeOfDay()

    return NextResponse.json({
      world,
      stage,
      objects: allObjects,
      history,
      season,
      timeOfDay: timeOfDay.time,
      nextTarget: worldEngine.getNextGrowthTarget(world.tree_level),
    })
  } catch (err) {
    console.error("World API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
