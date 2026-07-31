import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { getChestForDay } from "@/features/challenges/services/calendar-service"
import { CHESTS } from "@/features/challenges/constants"
import type { RewardChest } from "@/features/challenges/types"

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

    const { data: chestRows } = await supabase
      .from("calendar_chests")
      .select("*")
      .eq("child_id", childId)
      .eq("claimed", true)

    const chests = (chestRows ?? []).map((row) => ({
      id: row.id,
      chest_id: row.chest_id,
      day: row.day,
      claimed: row.claimed,
      claimed_at: row.claimed_at,
    })) as RewardChest[]

    const rewards = chests.map((c) => {
      const definition = CHESTS.find((d) => d.id === c.chest_id)
      return {
        day: c.day,
        chestId: c.chest_id,
        claimedAt: c.claimed_at,
        contents: definition?.contents ?? [],
      }
    })

    return NextResponse.json({
      chests: CHESTS.map((c) => ({ id: c.id, name: c.name, icon: c.icon, day: c.day, color: c.color })),
      rewards,
      nextChest: getChestForDay(
        Math.min(...(chests.length > 0 ? chests.map((c) => c.day) : [0])) > 0
          ? Math.min(...CHESTS.filter((c) => !chests.some((x) => x.day === c.day)).map((c) => c.day))
          : CHESTS[0]?.day ?? 7,
      ),
    })
  } catch (err: any) {
    console.error("Rewards API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
