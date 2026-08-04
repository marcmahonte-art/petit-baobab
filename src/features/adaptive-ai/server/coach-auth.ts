// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Résolution de session côté serveur pour les routes /api/coach/*.
// Gère les deux types de sessions :
//  - parent / enseignant  → session Supabase (cookie sb-access-token)
//  - élève               → JWT élève (cookie sb-student-token)
// Vérifie toujours que le child_id demandé appartient bien à la
// session connectée avant toute lecture/écriture (RLS explicite,
// le client admin contourne les politiques SQL).
// ============================================================

import { getServerUser } from "@/lib/auth"
import { getStudentSession } from "@/lib/auth/student-session"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export type CoachSession =
  | { type: "parent"; userId: string }
  | { type: "student"; profileId: string }

/**
 * Résout le type de session : l'élève est vérifié en premier (cookie
 * httpOnly), puis le parent/enseignant via Supabase auth.
 */
export async function resolveCoachSession(): Promise<CoachSession | null> {
  const student = await getStudentSession()
  if (student) return { type: "student", profileId: student.profile_id }

  const user = await getServerUser()
  if (user?.id) return { type: "parent", userId: user.id }

  return null
}

/**
 * Vérifie qu'un child_id appartient bien à la session connectée.
 * Pour un élève : le child_id doit être son propre profil.
 * Pour un parent : child_profiles → accounts.user_id = userId.
 */
export async function assertChildAccess(
  session: CoachSession | null,
  childId: string | null | undefined,
): Promise<boolean> {
  if (!session || !childId) return false

  if (session.type === "student") {
    return session.profileId === childId
  }

  const admin = getSupabaseAdmin()
  const { data: child } = await admin
    .from("child_profiles")
    .select("account_id")
    .eq("id", childId)
    .maybeSingle()
  if (!child) return false

  const { data: account } = await admin
    .from("accounts")
    .select("id")
    .eq("id", child.account_id)
    .eq("user_id", session.userId)
    .maybeSingle()

  return !!account
}

/** Récupère le child_id depuis un objet URL (searchParams) en toute sécurité. */
export function childIdFromUrl(url: string): string | null {
  const value = new URL(url).searchParams.get("childId")
  return typeof value === "string" && value.trim() ? value.trim() : null
}

/** Récupère le child_id depuis un corps JSON en toute sécurité. */
export function childIdFromBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const value = (body as Record<string, unknown>).childId
  return typeof value === "string" && value.trim() ? value.trim() : null
}
