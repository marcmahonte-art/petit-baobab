import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getTeacherSession } from "@/lib/school-auth"

export const runtime = "nodejs";

const BUCKET = "school-files";

export async function POST(request: Request) {
  try {
    const { errorResponse, supabase, account } = await getTeacherSession();
    if (errorResponse) return errorResponse;
    if (!supabase || !account) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Le fichier ne doit pas dépasser 2 Mo." }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "png"
    const filename = `logo-${account.id}-${Date.now()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const admin = getSupabaseAdmin()

    const { data: existing } = await admin.storage
      .from(BUCKET)
      .list("", { search: `logo-${account.id}` })

    if (existing && existing.length > 0) {
      await admin.storage.from(BUCKET).remove(existing.map((f) => f.name))
    }

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      if (uploadError.message?.includes("bucket") || uploadError.message?.includes("not found")) {
        return NextResponse.json({ error: "Le stockage n'est pas configuré. Contactez l'administrateur." }, { status: 500 })
      }
      return NextResponse.json({ error: "Erreur lors de l'upload." }, { status: 500 })
    }

    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    console.error("POST /api/school/upload error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
