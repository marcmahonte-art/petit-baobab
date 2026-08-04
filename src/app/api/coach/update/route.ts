import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromBody } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { applyAutomation, loadProfileBundle } from "@/features/adaptive-ai/server/coach-db"
import type { ActivityRecordInput } from "@/features/adaptive-ai/services/coach-service"

export async function POST(request: Request) {
  try {
    const session = await resolveCoachSession()
    const body = await request.json().catch(() => null)
    const childId = childIdFromBody(body)
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const input: ActivityRecordInput = {
      event: typeof body?.event === "string" ? (body.event as ActivityRecordInput["event"]) : "COLORING_COMPLETED",
      childId: childId!,
      duration: typeof body?.duration === "number" ? body.duration : undefined,
      style: typeof body?.style === "string" ? body.style : undefined,
      colors: Array.isArray(body?.colors) ? (body.colors as string[]) : undefined,
      bookTitle: typeof body?.bookTitle === "string" ? body.bookTitle : undefined,
      xp: typeof body?.xp === "number" ? body.xp : undefined,
      stars: typeof body?.stars === "number" ? body.stars : undefined,
    }

    const supabase = getSupabaseAdmin()
    const result = await applyAutomation(supabase, childId!, input)
    const bundle = await loadProfileBundle(supabase, childId!)

    return NextResponse.json({ ok: result.applied, ...bundle })
  } catch (err) {
    console.error("Coach update API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
