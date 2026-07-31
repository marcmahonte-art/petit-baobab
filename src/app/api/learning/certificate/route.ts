import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getServerUser } from "@/lib/auth"
import { seedLearningPaths } from "@/features/learning-paths/services/seed"
import { getPathById, flattenLessons } from "@/features/learning-paths/constants"
import { pathEngine } from "@/features/learning-paths/engine/path-engine"
import type { ChildLearningProgress, LearningCertificate } from "@/features/learning-paths/types"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")
    const token = searchParams.get("token")

    const supabase = await getSupabaseServer()

    // Vérification publique d'un certificat par token
    if (token) {
      const { data } = await supabase
        .from("learning_certificates")
        .select("*")
        .eq("token", token)
        .maybeSingle()
      if (!data) {
        return NextResponse.json({ valid: false, error: "Certificat introuvable" }, { status: 404 })
      }
      return NextResponse.json({ valid: true, certificate: data })
    }

    if (!childId) {
      return NextResponse.json({ error: "Paramètre childId manquant" }, { status: 400 })
    }

    const { data } = await supabase
      .from("learning_certificates")
      .select("*")
      .eq("child_id", childId)
      .order("issued_at", { ascending: false })

    return NextResponse.json({ certificates: (data ?? []) as LearningCertificate[] })
  } catch (err) {
    console.error("Learning certificate API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { childId, pathId } = body as { childId?: string; pathId?: string }
    if (!childId || !pathId) {
      return NextResponse.json({ error: "Paramètres childId et pathId requis" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    await seedLearningPaths(supabase)

    const path = getPathById(pathId)
    if (!path) {
      return NextResponse.json({ error: "Parcours introuvable" }, { status: 404 })
    }

    // Le parcours doit être terminé pour délivrer un certificat.
    const { data: rows } = await supabase
      .from("child_learning_progress")
      .select("*")
      .eq("child_id", childId)
      .eq("path_id", pathId)
    const progress = (rows ?? []) as ChildLearningProgress[]
    const lessonCount = flattenLessons(path).length
    const completedCount = pathEngine.getCompletedLessonIds(progress).size
    if (completedCount < lessonCount) {
      return NextResponse.json({ error: "Parcours non terminé" }, { status: 409 })
    }

    const { data: profile } = await supabase
      .from("child_profiles")
      .select("name, mascot")
      .eq("id", childId)
      .single()

    const { data: existing } = await supabase
      .from("learning_certificates")
      .select("id")
      .eq("child_id", childId)
      .eq("path_id", pathId)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ alreadyIssued: true })
    }

    const certificate: Omit<LearningCertificate, "id" | "pdf_url"> = {
      child_id: childId,
      path_id: path.id,
      path_title: path.title,
      child_name: profile?.name ?? "",
      mascot: profile?.mascot ?? path.mascot,
      issued_at: new Date().toISOString(),
      token: `${path.slug}_${crypto.randomUUID()}`,
    }

    const { data, error } = await supabase
      .from("learning_certificates")
      .insert(certificate)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ certificate: data })
  } catch (err) {
    console.error("Learning certificate API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
