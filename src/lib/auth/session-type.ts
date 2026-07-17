// ============================================================
// Petit Baobab — Détection du type de session côté serveur (Phase 7.1)
// ============================================================

export type ServerSessionType = "parent" | "teacher" | "student" | null;

/**
 * Lit x-session-type depuis les headers de la request.
 * Utilisé dans les Server Components pour adapter le rendu.
 */
export function getSessionTypeFromHeaders(headers: Headers): ServerSessionType {
  const type = headers.get("x-session-type");
  if (type === "parent" || type === "teacher" || type === "student") {
    return type;
  }
  return null;
}
