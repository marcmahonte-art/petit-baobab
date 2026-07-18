import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || "png"
    const filename = `class-${crypto.randomUUID()}.${ext}`

    const admin = getSupabaseAdmin()
    const { error: uploadError } = await admin.storage
      .from("class-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Erreur lors de l'upload." }, { status: 500 })
    }

    const { data: urlData } = admin.storage.from("class-images").getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    console.error("POST /api/school/upload error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
