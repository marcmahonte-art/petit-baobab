// ============================================================
// Petit Baobab — Paiement (PayDunya uniquement)
// ============================================================
// Point d'entrée unique pour la création de paiements. PayDunya
// est le seul prestataire configuré ; aucune sélection de
// fournisseur n'est nécessaire.

import { PayDunyaProvider, payDunyaProvider } from "./paydunya";

export { PayDunyaProvider, payDunyaProvider };
export * from "./types";
