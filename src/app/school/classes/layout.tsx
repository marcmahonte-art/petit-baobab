// ============================================================
// Garde serveur — /school/classes, /school/classes/create,
//                 /school/classes/[id]
// ============================================================
// Ces trois pages sont des composants CLIENT ("use client") : elles ne peuvent
// pas appeler une garde serveur elles-mêmes. Ce layout les enveloppe et
// vérifie réellement la session enseignant (signature + expiration + plan
// ecole_pro) avant de les rendre.
//
// Sans lui, elles reposaient uniquement sur le proxy, qui ne teste que la
// PRÉSENCE du cookie `sb-access-token` : un cookie forgé ou expiré affichait
// la page (vide) au lieu de rediriger vers /login?space=school.
import { requireTeacherPage } from "@/lib/school-auth";

export default async function SchoolClassesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacherPage();
  return <>{children}</>;
}
