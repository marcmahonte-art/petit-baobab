// ============================================================
// Petit Baobab — Résolution de session pour les routes API
// ============================================================
//
// Pourquoi ce module existe
// -------------------------
// Trois routes (`/api/magic-drawing`, `.../book/add`, `.../download`) exigeaient
// l'en-tête `x-session-type`, que seul le proxy peut poser. Or le `matcher` du
// proxy ne couvre **aucune** route `/api/*` : ces routes ne recevaient donc
// jamais l'en-tête et répondaient `401 unauthorized` même à un utilisateur
// connecté. La détection doit être autonome, à partir des cookies.

import { getStudentSession } from "@/lib/auth/student-session";

export type ApiSessionType = "student" | "parent";

export interface ApiSession {
  type: ApiSessionType;
  /** Renseignés uniquement pour une session élève (JWT vérifié). */
  profileId: string | null;
  classroomId: string | null;
  studentName: string | null;
}

const PARENT_SESSION: ApiSession = {
  type: "parent",
  profileId: null,
  classroomId: null,
  studentName: null,
};

/**
 * Détermine la session d'une requête API.
 *
 * ⚠️ `type: "parent"` ne signifie **pas** « authentifié » mais « non-élève » :
 * c'est un simple aiguillage. La route DOIT ensuite vérifier elle-même la
 * session adulte (`getServerUser()` ou `supabase.auth.getUser()`) avant
 * d'accorder le moindre accès.
 *
 * L'ordre est volontaire : le JWT élève est **vérifié** (signature +
 * expiration), c'est une preuve ; l'en-tête du proxy n'est qu'un indice, et la
 * simple présence d'un cookie adulte n'est pas une preuve non plus.
 */
export async function resolveApiSession(request: Request): Promise<ApiSession> {
  // 1. Cookie élève httpOnly → JWT vérifié. Source la plus fiable.
  const student = await getStudentSession();
  if (student) {
    return {
      type: "student",
      profileId: student.profile_id ?? null,
      classroomId: student.classroom_id ?? null,
      studentName: student.name ?? null,
    };
  }

  // 2. Repli : en-têtes posés par le proxy, s'il venait à couvrir /api/*.
  const header = request.headers.get("x-session-type");
  if (header === "student") {
    return {
      type: "student",
      profileId: request.headers.get("x-profile-id"),
      classroomId: request.headers.get("x-classroom-id"),
      studentName: request.headers.get("x-student-name"),
    };
  }

  // 3. Non-élève : la route vérifie elle-même la session adulte.
  return PARENT_SESSION;
}
