import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth/student-session";
import { LearnSessionProvider, type LearnSessionRole } from "@/app/learn/_components/learn-session";

/**
 * Layout serveur de l'espace apprenant unifié (/learn/*).
 *
 * Résout le type de session CÔTÉ SERVEUR à partir du cookie httpOnly
 * 'sb-student-token' (JWT élève vérifié). C'est la SEULE source de vérité
 * pour la navigation : un élève a toujours sa sidebar, même après refresh,
 * retour navigateur ou ouverture d'un nouvel onglet. Aucun état React/Zustand
 * volatile n'est utilisé pour décider du menu.
 *
 * Les routes hors /learn (ex: /parents, /school/*) ne passent pas par ce
 * layout et gardent leur comportement propre — aucun risque de régression.
 */
export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const studentToken = cookieStore.get("sb-student-token")?.value;
  const role: LearnSessionRole = studentToken && (await verifyStudentToken(studentToken))
    ? "student"
    : "parent";

  return <LearnSessionProvider role={role}>{children}</LearnSessionProvider>;
}
