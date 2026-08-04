import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromUrl } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { loadProfileBundle } from "@/features/adaptive-ai/server/coach-db"

export async function GET(request: Request) {
  try {
    const session = await resolveCoachSession()
    const childId = childIdFromUrl(request.url)
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const bundle = await loadProfileBundle(supabase, childId!)

    return NextResponse.json(bundle)
  } catch (err) {
    console.error("Coach profile API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await resolveCoachSession()
    const body = await request.json().catch(() => null)
    const childId = typeof body?.childId === "string" ? body.childId : null
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const patch = (body?.updates ?? {}) as Record<string, unknown>

    // Champs autorisés uniquement (jamais child_id ni id).
    const allowed = [
      "preferred_topics",
      "preferred_activity",
      "favorite_animals",
      "favorite_colors",
      "favorite_styles",
      "favorite_books",
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in patch) updates[key] = patch[key]
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
      await supabase.from("learning_profiles").update(updates).eq("child_id", childId)
    }

    const bundle = await loadProfileBundle(supabase, childId!)
    return NextResponse.json({ ok: true, ...bundle })
  } catch (err) {
    console.error("Coach profile update API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
