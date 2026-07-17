// ============================================================
// Petit Baobab — Hook client de détection du type de session (Phase 7.1)
// ============================================================

import { useAuthStore } from "@/lib/auth-store";

export type SessionRole = "parent" | "teacher" | "student" | "unknown";

export interface SessionTypeInfo {
  type: SessionRole;
  name: string | null;
  classroomName: string | null;
  isStudent: boolean;
  isTeacher: boolean;
  isParent: boolean;
}

/**
 * Détecte le type de session de l'utilisateur courant pour adapter l'UI.
 *
 * - Élève : lit depuis le store Zustand (posé au moment de la connexion /school).
 * - Adulte : lit depuis la session Supabase (user/account) et le cookie public
 *   'pb-session-type'.
 */
export function useSessionType(): SessionTypeInfo {
  const { account, studentSession } = useAuthStore();

  if (studentSession && studentSession.type === "student") {
    return {
      type: "student",
      name: studentSession.name,
      classroomName: null,
      isStudent: true,
      isTeacher: false,
      isParent: false,
    };
  }

  if (account) {
    const isSchool = account.plan === "ecole_pro";
    const role: SessionRole = isSchool ? "teacher" : "parent";
    return {
      type: role,
      name: null,
      classroomName: null,
      isStudent: false,
      isTeacher: isSchool,
      isParent: !isSchool,
    };
  }

  return {
    type: "unknown",
    name: null,
    classroomName: null,
    isStudent: false,
    isTeacher: false,
    isParent: false,
  };
}
