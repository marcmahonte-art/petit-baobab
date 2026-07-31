"use client";

import { useSchoolStore } from "@/stores/school-store";

/**
 * Hook unique de lecture du profil de l'administrateur École.
 *
 * Source de vérité : la table `profiles` (id = auth.users.id), exposée via
 * l'API `/api/school/dashboard` puis stockée dans `useSchoolStore().dashboardData.teacher`.
 *
 * Tous les composants affichant le nom/avatar de l'admin (Header, Sidebar, menu
 * utilisateur) doivent passer par ce hook pour éviter toute duplication de source
 * et garantir un rafraîchissement cohérent après une modification dans Paramètres.
 */
export function useCurrentUserProfile() {
  const dashboardData = useSchoolStore((s) => s.dashboardData);
  const fetchDashboard = useSchoolStore((s) => s.fetchDashboard);
  const loading = useSchoolStore((s) => s.loading);

  const teacher = dashboardData?.teacher;

  return {
    name: teacher?.name ?? null,
    avatar: teacher?.avatar ?? null,
    role: teacher?.role ?? null,
    schoolName: teacher?.school_name ?? null,
    loading: loading && !dashboardData,
    /** Recharge les données du dashboard (et donc le profil admin). */
    refresh: () => fetchDashboard(),
  };
}
