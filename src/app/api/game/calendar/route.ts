import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { loadCalendarState, getCurrentCalendarDay } from "@/features/challenges/services/calendar-service"
import { buildCalendarMonth } from "@/features/challenges/calendar/calendar-engine"

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

    const calendar = await loadCalendarState(supabase, childId)
    const currentDay = getCurrentCalendarDay()
    const days = buildCalendarMonth(childId, calendar.claimedDays, currentDay)

    return NextResponse.json({
      currentDay,
      claimedDays: calendar.claimedDays,
      days,
      chests: calendar.chests,
      lastClaimAt: calendar.lastClaimAt,
    })
  } catch (err: any) {
    console.error("Calendar API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
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
    const day = Number(body.day)

    if (!childId || !Number.isInteger(day) || day < 1) {
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

    const calendar = await loadCalendarState(supabase, childId)
    const today = getCurrentCalendarDay()

    if (day > today) {
      return NextResponse.json({ error: "Ce jour n'est pas encore disponible" }, { status: 400 })
    }

    if (calendar.claimedDays.includes(day)) {
      return NextResponse.json({ error: "Déjà réclamé" }, { status: 409 })
    }

    const chest = calendar.chests.find((c) => c.day === day)
    const chestId = chest?.chest_id ?? "none"

    const { error: insertErr } = await supabase.from("calendar_chests").insert({
      child_id: childId,
      chest_id: chestId,
      day,
      claimed: true,
      claimed_at: new Date().toISOString(),
    })

    if (insertErr) {
      console.error("Calendar claim insert error:", insertErr)
      return NextResponse.json({ error: "Impossible de réclamer" }, { status: 500 })
    }

    const updated = await loadCalendarState(supabase, childId)
    return NextResponse.json({ success: true, calendar: updated })
  } catch (err: any) {
    console.error("Calendar claim API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
