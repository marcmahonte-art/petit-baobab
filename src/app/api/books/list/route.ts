import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getStudentSession } from "@/lib/auth/student-session"

export async function GET() {
  try {
    const studentSession = await getStudentSession()
    if (studentSession) {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("profile_id", studentSession.profile_id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("GET /api/books/list error:", error)
        return NextResponse.json({ error: "Erreur de chargement des livres." }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }

    const supabase = await getSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("GET /api/books/list error:", error)
      return NextResponse.json({ error: "Erreur de chargement des livres." }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error("GET /api/books/list error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
