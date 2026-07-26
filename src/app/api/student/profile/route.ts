import { NextRequest, NextResponse } from "next/server"
import { getStudentSession } from "@/lib/auth/student-session"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getSupabaseSsrClient } from "@/lib/supabase-server"

// Résout le profile_id cible :
//  - mode élève : depuis le cookie sb-student-token
//  - mode famille : depuis ?profileId= (GET) ou body.profileId (PATCH),
//    à condition que le profil appartienne bien au compte parent connecté
async function resolveProfileId(request: NextRequest): Promise<string | null> {
  const session = await getStudentSession()
  if (session?.profile_id) return session.profile_id

  // Mode famille : parent authentifié
  let profileId: string | null = null
  if (request.method === "PATCH") {
    try {
      const b = await request.clone().json()
      profileId = b?.profileId ?? null
    } catch {
      profileId = null
    }
  } else {
    profileId = request.nextUrl.searchParams.get("profileId")
  }
  if (!profileId) return null

  // Mode famille : parent authentifié via cookie de session Supabase (ssr client)
  const ssrClient = await getSupabaseSsrClient()
  const { data: userData } = await ssrClient.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return null

  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from("child_profiles")
    .select("id, account_id")
    .eq("id", profileId)
    .single()

  if (!profile || profile.account_id !== userId) return null
  return profileId
}

export async function GET(request: NextRequest) {
  try {
    const profileId = await resolveProfileId(request)
    if (!profileId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("child_profiles")
      .select("name, mascot, age")
      .eq("id", profileId)
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
    const profileId = await resolveProfileId(request)
    if (!profileId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 })
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
      .eq("id", profileId)
      .select("name, mascot, age")
      .single()

    if (error) {
      // La colonne age peut ne pas exister encore (migration DB à appliquer).
      console.warn("PATCH /api/student/profile warn:", error.message)
      return NextResponse.json({ warning: error.message, applied: Object.keys(update) })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("PATCH /api/student/profile exception:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
