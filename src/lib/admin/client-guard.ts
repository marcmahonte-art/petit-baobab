// Helper client : détermine si l'utilisateur connecté est Super Admin.
// Le cookie de session Supabase (sb-access-token) est httpOnly → non lisible
// en JS. On s'appuie donc sur le cookie PUBLIC "pb-admin" posé côté
// serveur (setAdminCookie) quand l'email ∈ SUPER_ADMIN_EMAILS.
"use client";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** True si l'utilisateur connecté est Super Admin (cookie public pb-admin=1). */
export function isSuperAdminClient(): boolean {
  return getCookie("pb-admin") === "1";
}

/** Redirection espace selon le rôle : admin -> /dashboard, sinon -> /learn/dashboard. */
export function getHomeRedirect(): string {
  return isSuperAdminClient() ? "/dashboard" : "/learn/dashboard";
}
