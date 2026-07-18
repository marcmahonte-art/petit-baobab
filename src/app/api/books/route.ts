import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getStudentSession } from "@/lib/auth/student-session"

export async function GET() {
  return NextResponse.json({ message: "OK" })
}

export async function POST(request: Request) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
    }
    if (!body || !body.id || !body.profileId) {
      return NextResponse.json({ error: "id et profileId sont obligatoires." }, { status: 400 })
    }

    const studentSession = await getStudentSession()
    if (studentSession) {
      if (body.profileId !== studentSession.profile_id) {
        return NextResponse.json({ error: "Profil non autorisé." }, { status: 403 })
      }
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from("books")
        .upsert({
          id: body.id,
          title: body.title,
          subtitle: body.subtitle,
          author: body.author,
          child_name: body.childName,
          cover: body.cover,
          palette: body.palette,
          style: body.style,
          frame: body.frame,
          format: body.format,
          orientation: body.orientation,
          pages: body.pages,
          status: body.status,
          pdf_url: body.pdfUrl,
          cover_image_url: body.coverImageUrl,
          profile_id: body.profileId,
          created_at: body.createdAt,
          updated_at: body.updatedAt,
        })
      if (error) {
        console.error("Error saving book (student):", error)
        return NextResponse.json({ error: "Erreur lors de la sauvegarde du livre." }, { status: 500 })
      }
      return NextResponse.json(body)
    }

    const supabase = await getSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    const { error } = await supabase
      .from("books")
      .upsert({
        id: body.id,
        title: body.title,
        subtitle: body.subtitle,
        author: body.author,
        child_name: body.childName,
        cover: body.cover,
        palette: body.palette,
        style: body.style,
        frame: body.frame,
        format: body.format,
        orientation: body.orientation,
        pages: body.pages,
        status: body.status,
        pdf_url: body.pdfUrl,
        cover_image_url: body.coverImageUrl,
        profile_id: body.profileId,
        created_at: body.createdAt,
        updated_at: body.updatedAt,
      })

    if (error) {
      console.error("Error saving book (parent):", error)
      return NextResponse.json({ error: "Erreur lors de la sauvegarde du livre." }, { status: 500 })
    }

    return NextResponse.json(body)
  } catch (err: any) {
    console.error("POST /api/books error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
