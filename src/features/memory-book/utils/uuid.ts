/**
 * Génération d'identifiants pour `memory_books`.
 *
 * La colonne `memory_books.id` est de type `UUID` (voir
 * `supabase/migrations/24_memory_books.sql`). Le repli historique
 * `mb_${Date.now()}` produisait une chaîne que PostgREST rejette en `22P02`
 * (`invalid input syntax for type uuid`) : l'insertion échouait, l'erreur était
 * tue, et le cahier ne vivait plus que dans le `localStorage`.
 *
 * `crypto.randomUUID()` n'est exposé que dans un contexte sécurisé (HTTPS ou
 * localhost). `crypto.getRandomValues()`, lui, est disponible partout — on
 * compose donc un UUID v4 à la main plutôt que de retomber sur un identifiant
 * maison.
 */
/**
 * Indique si une valeur peut être stockée dans une colonne `UUID`.
 *
 * Sert à détecter les identifiants qui ne viendraient pas de la base :
 * `"default_child"` (valeur de repli utilisée dans les pages quand le profil
 * n'est pas encore chargé) ou un identifiant fabriqué côté client. Envoyés à
 * PostgREST, ils provoquent `22P02 invalid input syntax for type uuid`, ou une
 * violation de clé étrangère.
 */
export function isValidUuid(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    // Dernier recours : environnement sans Web Crypto (très ancien navigateur,
    // exécution de test isolée). Suffisant pour un identifiant, pas pour un
    // usage cryptographique.
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Version 4 et variante RFC 4122, exigées par le format UUID.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}
