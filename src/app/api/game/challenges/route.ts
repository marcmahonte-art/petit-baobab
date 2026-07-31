import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { ensureMissionsForChild, loadChildMissions, loadChildDailyProgress, loadChildWeeklyProgress } from "@/features/challenges/services/mission-service"
import { getSeasonForDate, getSeasonProgress } from "@/features/challenges/services/season-service"
import { getActiveMultipliers } from "@/features/challenges/services/multiplier-service"

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

    await ensureMissionsForChild(supabase, childId)
    const { daily, weekly, monthly } = await loadChildMissions(supabase, childId)
    const [dailyProgress, weeklyProgress, season, multipliers] = await Promise.all([
      loadChildDailyProgress(supabase, childId),
      loadChildWeeklyProgress(supabase, childId),
      Promise.resolve(getSeasonForDate()),
      Promise.resolve(getActiveMultipliers()),
    ])

    const { data: progression } = await supabase
      .from("child_progression")
      .select("xp_total")
      .eq("child_id", childId)
      .maybeSingle()

    const seasonProgress = getSeasonProgress(childId, season, progression?.xp_total ?? 0)

    return NextResponse.json({
      daily: daily.map((m) => ({
        ...m,
        progress: dailyProgress[m.id]?.progress ?? 0,
        completed: dailyProgress[m.id]?.completed ?? false,
        claimed: dailyProgress[m.id]?.claimed ?? false,
      })),
      weekly: weekly.map((m) => ({
        ...m,
        progress: weeklyProgress[m.id]?.progress ?? 0,
        completed: weeklyProgress[m.id]?.completed ?? false,
        claimed: weeklyProgress[m.id]?.claimed ?? false,
      })),
      monthly,
      season: {
        ...season,
        progress: seasonProgress,
      },
      multipliers: multipliers.eventMultipliers,
    })
  } catch (err: any) {
    console.error("Challenges API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
