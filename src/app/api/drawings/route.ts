import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getStudentSession } from "@/lib/auth/student-session"

async function upsertDrawing(body: any, supabase: any) {
  const { error } = await supabase
    .from("saved_drawings")
    .upsert({
      id: body.id,
      name: body.name,
      model_name: body.modelName,
      category: body.category,
      origin: body.origin,
      status: body.status,
      profile_id: body.profileId,
      created_at: body.createdAt,
      updated_at: body.updatedAt,
      is_colored: body.isColored,
      image: body.image,
      thumbnail: body.thumbnail,
      template: body.template,
      state: body.state,
      progress: body.status || "in_progress",
    })
  if (error) throw error
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

    // Detect auth: student JWT cookie takes priority, then parent session
    const studentSession = await getStudentSession()
    if (studentSession) {
      if (body.profileId !== studentSession.profile_id) {
        return NextResponse.json({ error: "Profil non autorisé." }, { status: 403 })
      }
      const supabase = getSupabaseAdmin()
      await upsertDrawing(body, supabase)
      return NextResponse.json(body)
    }

    const supabase = await getSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }
    await upsertDrawing(body, supabase)
    return NextResponse.json(body)
  } catch (err: any) {
    console.error("POST /api/drawings error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const profileId = searchParams.get("profileId")

    if (!id) {
      return NextResponse.json({ error: "id est requis." }, { status: 400 })
    }

    const studentSession = await getStudentSession()
    if (studentSession) {
      if (profileId !== studentSession.profile_id) {
        return NextResponse.json({ error: "Profil non autorisé." }, { status: 403 })
      }
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from("saved_drawings")
        .delete()
        .eq("id", id)
        .eq("profile_id", studentSession.profile_id)

      if (error) {
        console.error("DELETE /api/drawings error:", error)
        return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    const supabase = await getSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    const { error } = await supabase
      .from("saved_drawings")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("DELETE /api/drawings error:", error)
      return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("DELETE /api/drawings error:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // GET /api/drawings?type=saved → liste des dessins sauvegardés
  if (searchParams.get("type") === "saved") {
    try {
      const studentSession = await getStudentSession()
      if (studentSession) {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from("saved_drawings")
          .select("*")
          .eq("profile_id", studentSession.profile_id)
          .order("updated_at", { ascending: false })

        if (error) {
          console.error("GET /api/drawings?saved error:", error)
          return NextResponse.json({ error: "Erreur de chargement des dessins." }, { status: 500 })
        }
        return NextResponse.json(data || [])
      }

      const supabase = await getSupabaseServer()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
      }

      const { data, error } = await supabase
        .from("saved_drawings")
        .select("*")
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("GET /api/drawings?saved error:", error)
        return NextResponse.json({ error: "Erreur de chargement des dessins." }, { status: 500 })
      }
      return NextResponse.json(data || [])
    } catch (err: any) {
      console.error("GET /api/drawings?saved error:", err)
      return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
    }
  }

  // GET /api/drawings (default) → liste des illustrations disponibles
  const categories = {
    animals: "animals",
    culture: "culture",
    fruits: "fruits",
    alphabet: "alphabet",
    jobs: "jobs",
  }

  const baseDir = path.join(process.cwd(), "public", "illustrations")
  const result: Record<string, { id: string; name: string; image: string; category: string }[]> = {}

  for (const [key, folder] of Object.entries(categories)) {
    const dirPath = path.join(baseDir, folder)
    result[key] = []

    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath)
        const svgFiles = files
          .filter((f) => f.toLowerCase().endsWith(".svg"))
          .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))

        result[key] = svgFiles.map((file) => {
          const nameWithoutExt = path.parse(file).name
          const friendlyName = nameWithoutExt
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          return {
            id: `${key}-${nameWithoutExt}`,
            name: friendlyName,
            image: `/illustrations/${folder}/${file}`,
            category: key,
          }
        })
      } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err)
      }
    }
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
