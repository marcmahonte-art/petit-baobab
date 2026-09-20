// ============================================================
// Petit Baobab — Validation des redirections internes
// ============================================================

/**
 * N'accepte qu'un **chemin interne**, jamais une URL absolue.
 *
 * Indispensable pour tout paramètre `?next=` : sans validation,
 * `/login?next=https://site-pirate.example` transforme la page de connexion
 * en tremplin de phishing (l'utilisateur se connecte vraiment, puis se
 * retrouve sur le site de l'attaquant). Idem pour `//site-pirate.example`,
 * qui est une URL protocole-relative, et pour `/\site-pirate.example`, que
 * certains navigateurs normalisent en `//`.
 *
 * @returns le chemin s'il est interne et sûr, sinon `null`.
 */
export function safeInternalPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;

  const value = raw.trim();
  if (!value) return null;

  // Doit commencer par un seul « / » : exclut les URL absolues et « //hôte ».
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;

  // Les antislashs sont interprétés comme des « / » par certains navigateurs.
  if (value.includes("\\")) return null;

  // Caractères de contrôle (retours à la ligne, tabulations) : injection d'en-tête.
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;

  return value;
}
