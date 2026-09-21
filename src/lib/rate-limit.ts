// ============================================================
// Petit Baobab — Limiteur de débit en mémoire (best effort)
// ============================================================
//
// Objectif : borner l'abus d'endpoints PUBLICS qui déclenchent une dépense
// externe (ex. /api/help → OpenAI). Ces endpoints ne peuvent pas exiger
// d'authentification — le widget d'aide s'adresse aussi aux visiteurs anonymes
// de la page marketing — donc le débit est le seul garde-fou possible.
//
// ⚠️ LIMITE IMPORTANTE : l'état vit dans la mémoire du processus. En
// serverless (Vercel), chaque instance a son propre compteur et les instances
// sont recyclées. Ce n'est donc PAS une protection distribuée : un attaquant
// réparti sur plusieurs instances obtient plusieurs fois le quota. Cela reste
// néanmoins utile (une boucle sur une instance chaude est freinée, et la
// dépense par instance est bornée). Pour une garantie forte, il faudrait un
// stockage partagé (Redis, ou une table Supabase avec compteur).
//
// À utiliser uniquement là où l'abus coûte de l'argent : pas besoin de limiter
// les routes qui ne font qu'une lecture en base.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Purge opportuniste : sans elle, la Map grossirait sans fin (fuite mémoire),
// puisqu'une clé par IP visitée est créée.
const MAX_BUCKETS = 5000;

function purgeExpired(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Secondes à attendre avant de réessayer (0 si autorisé). */
  retryAfterSeconds: number;
};

/**
 * Fenêtre fixe : `limit` appels autorisés par `windowMs` pour une clé donnée.
 *
 * @example
 *   const rl = rateLimit(`help-ai:${clientIp(request)}`, 12, 5 * 60_000);
 *   if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  purgeExpired(now);

  const bucket = buckets.get(key);

  // Première visite, ou fenêtre expirée : on ouvre une nouvelle fenêtre.
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * IP cliente derrière un proxy. Vercel pose `x-forwarded-for` (liste, l'IP
 * cliente est la première entrée).
 *
 * Si l'en-tête est absent, on renvoie "unknown" : toutes ces requêtes
 * partagent alors un même seau. C'est volontaire — cela reste préférable à
 * aucune limite, et en production l'en-tête est toujours présent.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Réservé aux tests : vide tous les compteurs. */
export function resetRateLimit(): void {
  buckets.clear();
}
