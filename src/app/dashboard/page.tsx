import { redirect } from "next/navigation"

// Redirection de compatibilité : l'ancien dashboard enfant (parent) est
// fusionné dans le nouvel espace apprenant unifié /learn/dashboard.
export default function DashboardRedirect() {
  redirect("/learn/dashboard")
}
