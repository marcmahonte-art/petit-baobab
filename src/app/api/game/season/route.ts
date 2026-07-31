import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { getSeasonForDate, getSeasonProgress, buildSeasonRewards } from "@/features/challenges/services/season-service"
import { loadBattlePassState } from "@/features/challenges/services/battle-pass-service"
import { BATTLE_PASS_TIERS } from "@/features/challenges/constants"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")
    const plan = searchParams.get("plan") ?? "free"

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

    const season = getSeasonForDate()

    const { data: progression } = await supabase
      .from("child_progression")
      .select("xp_total")
      .eq("child_id", childId)
      .maybeSingle()

    const seasonProgress = getSeasonProgress(childId, season, progression?.xp_total ?? 0)
    const battlePass = await loadBattlePassState(supabase, childId, season.id)
    const rewards = buildSeasonRewards(season.id)

    return NextResponse.json({
      season: {
        ...season,
        progress: seasonProgress,
      },
      battlePass: battlePass ?? null,
      battlePassTiers: BATTLE_PASS_TIERS,
      isPremium: plan === "super-baobab",
      rewards,
    })
  } catch (err: any) {
    console.error("Season API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
