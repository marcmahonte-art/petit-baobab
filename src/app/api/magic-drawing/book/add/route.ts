import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer()

    const sessionType = request.headers.get("x-session-type")
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
    }

    const { imageUrl, idea, style, drawingId: providedDrawingId } = body

    if (!imageUrl || !idea || !style) {
      return NextResponse.json(
        { error: "imageUrl, idea et style sont obligatoires." },
        { status: 400 }
      )
    }

    const STYLE_MAP: Record<string, string> = {
      noir_blanc: "Noir & Blanc détaillé",
      contour_simple: "Contour simple",
      dessin_detaille: "Noir & Blanc détaillé",
      version_couleur: "Version couleur",
    }
    const mappedStyle = STYLE_MAP[style] || "Contour simple"

    let accountId: string
    let profile: { id: string; name: string }

    if (sessionType === "student") {
      // Session élève : identifiants injectés par le middleware
      const profileId = request.headers.get("x-profile-id")
      const classroomId = request.headers.get("x-classroom-id")
      if (!profileId || !classroomId) {
        return NextResponse.json({ error: "Session élève incomplète." }, { status: 401 })
      }

      // Récupérer l'account école via la classe
      const { data: classroom, error: classErr } = await supabase
        .from("classrooms")
        .select("account_id")
        .eq("id", classroomId)
        .is("archived_at", null)
        .single()

      if (classErr || !classroom) {
        return NextResponse.json({ error: "Classe introuvable." }, { status: 404 })
      }
      accountId = classroom.account_id

      // Vérification de sécurité : le dessin référencé appartient bien au profil élève
      if (providedDrawingId) {
        const { data: drawing, error: drawErr } = await supabase
          .from("saved_drawings")
          .select("id")
          .eq("id", providedDrawingId)
          .eq("profile_id", profileId)
          .single()
        if (drawErr || !drawing) {
          return NextResponse.json({ error: "Accès non autorisé au dessin." }, { status: 403 })
        }
      }

      const { data: studentProfile, error: profErr } = await supabase
        .from("child_profiles")
        .select("id, name")
        .eq("id", profileId)
        .single()

      if (profErr || !studentProfile) {
        return NextResponse.json({ error: "Profil introuvable." }, { status: 404 })
      }
      profile = { id: studentProfile.id, name: studentProfile.name }
    } else if (sessionType === "parent" || sessionType === "teacher") {
      // Session parent/teacher : authentification Supabase Auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
      }

      const { data: account } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!account) {
        return NextResponse.json({ error: "Compte introuvable." }, { status: 404 })
      }
      accountId = account.id

      const { data: profiles } = await supabase
        .from("child_profiles")
        .select("id, name")
        .eq("account_id", account.id)
        .limit(1)

      const firstProfile = profiles?.[0]
      if (!firstProfile) {
        return NextResponse.json({ error: "Aucun profil enfant." }, { status: 404 })
      }
      profile = { id: firstProfile.id, name: firstProfile.name }
    } else {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    let finalImageUrl = imageUrl

    if (imageUrl.startsWith("data:")) {
      const base64 = imageUrl.split(",")[1]
      if (base64) {
        const buffer = Buffer.from(base64, "base64")
        const drawingId = crypto.randomUUID()
        const filePath = `ai/${profile.id}/${drawingId}.png`

        const { error: uploadError } = await supabase.storage
          .from("drawings")
          .upload(filePath, buffer, { contentType: "image/png", upsert: true })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("drawings").getPublicUrl(filePath)
          finalImageUrl = publicUrl
        }
      }
    }

    const BOOK_TITLE = "Mes dessins magiques"
    const drawingId = providedDrawingId || `magic-${Date.now()}`

    const { data: existingBooks } = await supabase
      .from("books")
      .select("id, pages")
      .eq("profile_id", profile.id)
      .eq("title", BOOK_TITLE)
      .limit(1)

    let book = existingBooks?.[0]
    const currentPages = (book?.pages as any[]) || []
    const pageNumber = currentPages.length + 1

    const newPage = {
      drawingId,
      pageNumber,
      imageUrl: finalImageUrl,
      idea: idea.slice(0, 200),
      style,
    }

    if (book) {
      const { error: updateErr } = await supabase
        .from("books")
        .update({
          pages: [...currentPages, newPage],
          updated_at: new Date().toISOString(),
        })
        .eq("id", book.id)

      if (updateErr) throw updateErr
    } else {
      const { data: newBook, error: createErr } = await supabase
        .from("books")
        .insert({
          profile_id: profile.id,
          title: BOOK_TITLE,
          author: profile.name || "Artiste",
          child_name: profile.name,
          style: mappedStyle,
          format: "A4",
          orientation: "Portrait",
          frame: "Aucun",
          cover: "petit-baobab",
          palette: "Purple",
          pages: [newPage],
          status: "draft",
        })
        .select()
        .single()

      if (createErr) throw createErr
      book = newBook
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      totalPages: pageNumber,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Impossible d'ajouter le dessin au livre." },
      { status: 500 }
    )
  }
}
