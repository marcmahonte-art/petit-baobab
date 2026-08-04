import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromUrl } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { listHistory } from "@/features/adaptive-ai/server/coach-db"
import type { CoachMessage } from "@/features/adaptive-ai/types/coach"

export async function GET(request: Request) {
  try {
    const session = await resolveCoachSession()
    const childId = childIdFromUrl(request.url)
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const kind = new URL(request.url).searchParams.get("kind")

    if (kind === "messages") {
      const { data } = await supabase
        .from("coach_messages")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: true })
        .limit(40)
      return NextResponse.json({ messages: (data ?? []) as CoachMessage[] })
    }

    const history = await listHistory(supabase, childId!)
    return NextResponse.json({ history })
  } catch (err) {
    console.error("Coach history API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
