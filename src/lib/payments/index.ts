// ============================================================
// Petit Baobab — Paiement (PayDunya uniquement)
// ============================================================
// Point d'entrée unique pour la création de paiements. PayDunya
// est le seul prestataire configuré ; les routes d'API n'ont pas
// besoin de résoudre un fournisseur.

import { createCheckout } from "./paydunya";

export { createCheckout };
export * from "./types";
