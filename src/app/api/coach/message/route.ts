import { NextResponse } from "next/server"
import { resolveCoachSession, assertChildAccess, childIdFromBody } from "@/features/adaptive-ai/server/coach-auth"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { generateCoachReply } from "@/lib/ai/learning-coach"
import {
  loadProfileBundle,
  loadPredictions,
  listRecommendations,
} from "@/features/adaptive-ai/server/coach-db"
import type { ChatContext } from "@/features/adaptive-ai/engine/coach-engine"
import type { CoachMessage } from "@/features/adaptive-ai/types/coach"

export async function POST(request: Request) {
  try {
    const session = await resolveCoachSession()
    const body = await request.json().catch(() => null)
    const childId = childIdFromBody(body)
    const content = typeof body?.content === "string" ? body.content.trim() : ""

    if (!content) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 })
    }
    if (content.length > 240) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 })
    }
    if (!(await assertChildAccess(session, childId))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // Sauvegarde du message de l'enfant.
    await supabase.from("coach_messages").insert({
      child_id: childId,
      role: "child",
      content,
      intent: "general",
      filtered: false,
    })

    // Contexte réel pour la réponse.
    const bundle = await loadProfileBundle(supabase, childId!)
    const predictions = await loadPredictions(supabase, childId!)
    const recommendations = await listRecommendations(supabase, childId!)
    const nextRecommendation =
      recommendations.find((r) => r.status === "pending") ?? recommendations[0] ?? null

    const { data: prog } = await supabase
      .from("child_progression")
      .select("level, xp_total")
      .eq("child_id", childId)
      .maybeSingle()
    const { data: childRow } = await supabase
      .from("child_profiles")
      .select("name")
      .eq("id", childId)
      .maybeSingle()
    const level = prog?.level ?? 1
    const totalXp = prog?.xp_total ?? bundle.statistics?.total_xp ?? 0

    const context: ChatContext = {
      childName: childRow?.name ?? "",
      profile: bundle.profile,
      statistics: bundle.statistics,
      predictions,
      recommendations,
      nextRecommendation,
      level,
      totalXp,
    }

    const { reply, intent, filtered } = await generateCoachReply(content, context)

    // Sauvegarde de la réponse du coach.
    await supabase.from("coach_messages").insert({
      child_id: childId,
      role: "coach",
      content: reply,
      intent,
      filtered,
    })

    await supabase.from("coach_history").insert({
      child_id: childId,
      action: "chat",
      title: "Question au coach",
      detail: `L'enfant a demandé : « ${content.slice(0, 80)} »`,
      status: "done",
    })

    const { data: messages } = await supabase
      .from("coach_messages")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: true })
      .limit(30)

    return NextResponse.json({
      reply,
      intent,
      filtered,
      messages: (messages ?? []) as CoachMessage[],
    })
  } catch (err) {
    console.error("Coach message API error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 })
  }
}
