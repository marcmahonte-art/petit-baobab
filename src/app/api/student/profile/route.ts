import { NextRequest, NextResponse } from "next/server"
import { getStudentSession, signStudentToken } from "@/lib/auth/student-session"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { getServerUser } from "@/lib/auth"

// Résout le profile_id cible :
//  - mode élève : depuis le cookie sb-student-token
//  - mode famille : depuis ?profileId= (GET) ou body.profileId (PATCH),
//    à condition que le profil appartienne bien au compte parent connecté
async function resolveProfileId(request: NextRequest): Promise<string | null> {
  const session = await getStudentSession()
  if (session?.profile_id) return session.profile_id

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

  // Mode famille : récupère l'utilisateur connecté via sb-access-token (avec refresh si expiré)
  const user = await getServerUser()
  if (!user) return null

  const supabase = getSupabaseAdmin()
  const { data: profile } = await supabase
    .from("child_profiles")
    .select("id, account_id")
    .eq("id", profileId)
    .single()

  if (!profile || profile.account_id !== user.id) return null
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
    if (typeof body.age === "number" && !Number.isNaN(body.age)) update.age = body.age
    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim()
    if (typeof body.mascot === "string" && body.mascot.trim()) update.mascot = body.mascot.trim()

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("child_profiles")
      .update(update)
      .eq("id", profileId)
      .select("id, name, mascot, age")
      .single()

    const resultPayload = data || { id: profileId, ...update }

    // Si une session élève est active (cookie sb-student-token), mettre à jour le JWT cookie
    const studentSession = await getStudentSession()
    const response = NextResponse.json(resultPayload)

    if (studentSession && studentSession.profile_id === profileId) {
      const updatedSession = {
        ...studentSession,
        name: (update.name ?? studentSession.name) as string,
        mascot: (update.mascot ?? studentSession.mascot) as any,
      }
      const token = await signStudentToken(updatedSession)
      response.cookies.set("sb-student-token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    }

    return response
  } catch (err: any) {
    console.error("PATCH /api/student/profile exception:", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
