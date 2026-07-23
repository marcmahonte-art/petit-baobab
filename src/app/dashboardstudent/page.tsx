import { redirect } from "next/navigation"

// Redirection de compatibilité : l'ancien dashboard élève est fusionné dans
// le nouvel espace apprenant unifié /learn/dashboard.
export default function DashboardStudentRedirect() {
  redirect("/learn/dashboard")
}
