/**
 * Composants d'affichage partagés entre /dashboard (espace enfant parent)
 * et /dashboardstudent (espace élève école).
 *
 * Ces composants sont purement présentationnels : ils reçoivent leurs données
 * via le store de profil (useProfileStore) ou via des appels API internes,
 * mais ne contiennent AUCUNE logique de session, cookie, ou vérification de rôle.
 */

export { HeroBanner } from "./hero-banner"
export { FeatureCard } from "./feature-card"
export { FeatureModules } from "./feature-modules"
export { RecentColorings } from "./recent-colorings"
export { ActivityPanel } from "./activity-panel"
export { RewardsCard } from "./rewards-card"
export { MobileBottomNav } from "./mobile-bottom-nav"
export { commonNavItems, settingsNavItem } from "./nav-items"
export type { NavItem } from "./nav-items"
