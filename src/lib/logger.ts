// ============================================================
// Petit Baobab — Logger centralisé (audit auth)
// ============================================================
// Remplace les erreurs silencieuses par des logs explicites.
// Préfixe chaque ligne pour faciliter le débogage futur.

const PREFIX = "[petit-baobab]";

export const logger = {
  error(scope: string, error: unknown, context?: Record<string, unknown>) {
    const msg = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error(PREFIX, `[ERROR] ${scope}:`, msg, context ? context : "");
    if (error instanceof Error && error.stack) {
      // eslint-disable-next-line no-console
      console.error(PREFIX, `[STACK] ${scope}:`, error.stack);
    }
  },
  warn(scope: string, message: string, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.warn(PREFIX, `[WARN] ${scope}:`, message, context ? context : "");
  },
  info(scope: string, message: string, context?: Record<string, unknown>) {
    // eslint-disable-next-line no-console
    console.log(PREFIX, `[INFO] ${scope}:`, message, context ? context : "");
  },
};
