import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

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

    const { data: account } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!account) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 })
    }

    const { data: profiles } = await supabase
      .from("child_profiles")
      .select("id, name")
      .eq("account_id", account.id)
      .limit(1)

    const profile = profiles?.[0]
    if (!profile) {
      return NextResponse.json({ error: "Aucun profil enfant." }, { status: 404 })
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
          author: (user.email?.split("@")[0]) || "Artiste",
          child_name: profile.name,
          style: "Contour simple",
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
