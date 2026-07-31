import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { loadObjects, loadWorld, worldEngine } from "@/features/baobab-world/world/engine"
import { ANIMALS, DECORATIONS, WORLD_OBJECTS } from "@/features/baobab-world/constants"

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

    const [world, objects] = await Promise.all([
      loadWorld(supabase, childId),
      loadObjects(supabase, childId),
    ])

    const treeLevel = world?.tree_level ?? 1
    const unlockedKeys = new Set(objects.map((o) => o.object_type))

    const props = WORLD_OBJECTS.map((d) => ({
      ...d,
      unlocked: unlockedKeys.has(d.type) || d.unlockLevel <= treeLevel,
    }))
    const animals = ANIMALS.map((d) => ({
      ...d,
      unlocked: unlockedKeys.has(d.type) || d.unlockLevel <= treeLevel,
    }))
    const decorations = DECORATIONS.map((d) => ({
      ...d,
      unlocked: unlockedKeys.has(d.type) || d.unlockLevel <= treeLevel,
    }))

    return NextResponse.json({
      objects: objects.map((o) => ({
        id: o.id,
        object_type: o.object_type,
        object_key: o.object_key,
        position_x: o.position_x,
        position_y: o.position_y,
        rotation: o.rotation,
        scale: o.scale,
        is_unlocked: o.is_unlocked,
      })),
      props,
      animals,
      decorations,
      definitions: worldEngine.getAllObjects(childId, objects),
    })
  } catch (err) {
    console.error("World unlocks API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
