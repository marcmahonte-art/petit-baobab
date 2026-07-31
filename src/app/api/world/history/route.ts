import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { loadHistory, worldEngine } from "@/features/baobab-world/world/engine"
import { MEMORY_EVENTS } from "@/features/baobab-world/constants"

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

    const limit = Number(searchParams.get("limit") ?? 100)
    const history = await loadHistory(supabase, childId, limit)

    return NextResponse.json({
      history,
      memoryDefinitions: MEMORY_EVENTS,
    })
  } catch (err) {
    console.error("World history API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const childId = typeof body.childId === "string" ? body.childId : ""
    const event = typeof body.event === "string" ? body.event : ""
    const metadata = typeof body.metadata === "object" && body.metadata ? body.metadata : {}

    if (!childId || !event) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
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

    const entry = worldEngine.createMemoryPublic(childId, event, metadata as Record<string, unknown>)
    const { error } = await supabase.from("world_history").insert({
      child_id: childId,
      event: entry.event,
      metadata: entry.metadata,
    })

    if (error) {
      console.error("World history insert error:", error)
      return NextResponse.json({ error: "Impossible de créer le souvenir" }, { status: 500 })
    }

    return NextResponse.json({ success: true, entry })
  } catch (err) {
    console.error("World history POST error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
