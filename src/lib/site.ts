// ============================================================
// Petit Baobab — URL canonique du site (redirections OAuth)
// ============================================================
// Le callback OAuth DOIT rediriger vers une URL exactement enregistrée
// dans Supabase > Authentication > URL Configuration > Redirect URLs.
//
// - En dev (localhost) : on utilise window.location.origin pour rester
//   sur localhost (sinon on redirigerait vers la prod et le callback casse).
// - En prod : on utilise NEXT_PUBLIC_SITE_URL (doit y être enregistré).
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location.origin.includes("localhost")) {
    return window.location.origin;
  }
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
