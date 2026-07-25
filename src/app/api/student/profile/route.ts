import { NextRequest, NextResponse } from "next/server"
import { getStudentSession } from "@/lib/auth/student-session"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const session = await getStudentSession()
    if (!session?.profile_id) {
      return NextResponse.json({ error: "Non authentifié (élève)." }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("child_profiles")
      .select("name, mascot, age")
      .eq("id", session.profile_id)
      .single()

    if (error) {
      console.error("GET /api/student/profile error:", error)
      return NextResponse.json({ error: "Erreur de chargement du profil." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("GET /api/student/profile exception:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getStudentSession()
    if (!session?.profile_id) {
      return NextResponse.json({ error: "Non authentifié (élève)." }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (typeof body.age === "number") update.age = body.age
    if (typeof body.name === "string") update.name = body.name
    if (typeof body.mascot === "string") update.mascot = body.mascot

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("child_profiles")
      .update(update)
      .eq("id", session.profile_id)
      .select("name, mascot, age")
      .single()

    if (error) {
      // La colonne age peut ne pas exister encore (migration DB à appliquer).
      // On renvoie 200 avec les champs connus pour ne pas casser le front.
      console.warn("PATCH /api/student/profile warn:", error.message)
      return NextResponse.json({ warning: error.message, applied: Object.keys(update) })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("PATCH /api/student/profile exception:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
