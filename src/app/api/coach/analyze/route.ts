import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromBody } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { runAnalyze } from "@/features/adaptive-ai/server/coach-db"

export async function POST(request: Request) {
  try {
    const session = await resolveCoachSession()
    const body = await request.json().catch(() => null)
    const childId = childIdFromBody(body)
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const analysis = await runAnalyze(supabase, childId!)

    return NextResponse.json(analysis)
  } catch (err) {
    console.error("Coach analyze API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
