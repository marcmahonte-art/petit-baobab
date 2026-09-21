// ============================================================
// Garde serveur — /school/students, /school/students/add,
//                 /school/students/bulk
// ============================================================
// `add` et `bulk` sont des composants CLIENT ("use client") : ils ne peuvent
// pas appeler une garde serveur eux-mêmes. Ce layout les enveloppe (ainsi que
// la liste `students/page.tsx`, simple wrapper) et vérifie réellement la
// session enseignant (signature + expiration + plan ecole_pro).
//
// Sans lui, ces pages reposaient uniquement sur le proxy, qui ne teste que la
// PRÉSENCE du cookie `sb-access-token` : un cookie forgé ou expiré affichait
// la page (vide) au lieu de rediriger vers /login?space=school.
import { requireTeacherPage } from "@/lib/school-auth";

export default async function SchoolStudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacherPage();
  return <>{children}</>;
}
