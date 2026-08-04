import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromUrl, childIdFromBody } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { listRecommendations, setRecommendationStatus } from "@/features/adaptive-ai/server/coach-db"
import type { RecommendationStatus } from "@/features/adaptive-ai/types/coach"

const ALLOWED_STATUSES: RecommendationStatus[] = ["accepted", "ignored", "completed", "succeeded"]

export async function GET(request: Request) {
  try {
    const session = await resolveCoachSession()
    const childId = childIdFromUrl(request.url)
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const recommendations = await listRecommendations(supabase, childId!)
    return NextResponse.json({ recommendations })
  } catch (err) {
    console.error("Coach recommendations API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await resolveCoachSession()
    const body = await request.json().catch(() => null)
    const childId = childIdFromBody(body)
    const id = typeof body?.id === "string" ? body.id : null
    const status = ALLOWED_STATUSES.includes(body?.status) ? (body.status as RecommendationStatus) : null

    if (!id || !status) {
      return NextResponse.json({ error: "Paramètres id et status requis" }, { status: 400 })
    }
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const recommendation = await setRecommendationStatus(supabase, childId!, id, status)
    if (!recommendation) {
      return NextResponse.json({ error: "Recommandation introuvable" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, recommendation })
  } catch (err) {
    console.error("Coach recommendations update API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
