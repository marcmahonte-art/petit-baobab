import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"

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

    const { data: profile } = await supabase.from("child_profiles").select("id").eq("id", childId).single()
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })
    }

    const [portfolio, events, albums, favorites, capsules] = await Promise.all([
      supabase.from("child_portfolio").select("*").eq("child_id", childId).maybeSingle(),
      supabase.from("portfolio_events").select("*").eq("child_id", childId).order("created_at", { ascending: true }),
      supabase.from("portfolio_albums").select("*").eq("child_id", childId),
      supabase.from("portfolio_favorites").select("*").eq("child_id", childId),
      supabase.from("portfolio_time_capsules").select("*").eq("child_id", childId),
    ])

    return NextResponse.json({
      portfolio: portfolio.data ?? null,
      events: events.data ?? [],
      albums: albums.data ?? [],
      favorites: favorites.data ?? [],
      capsules: capsules.data ?? [],
    })
  } catch (err) {
    console.error("Portfolio API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
