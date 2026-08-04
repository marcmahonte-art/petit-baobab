import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromUrl } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { generateOrGetReport } from "@/features/adaptive-ai/server/coach-db"

export async function GET(request: Request) {
  try {
    const session = await resolveCoachSession()
    const childId = childIdFromUrl(request.url)
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const report = await generateOrGetReport(supabase, childId!)
    return NextResponse.json({ report })
  } catch (err) {
    console.error("Coach report API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
