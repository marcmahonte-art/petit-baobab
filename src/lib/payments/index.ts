// ============================================================
// Petit Baobab — Résolveur de fournisseur de paiement
// ============================================================
// Retourne un adaptateur PaymentProvider si un agrégateur est
// configuré ET possède un adaptateur implémenté, sinon `null`.
//
// CAS B (actuel) : aucun fournisseur n'est encore choisi. La
// fonction retourne `null` — la route /api/billing/checkout
// renvoie alors un placeholder 503 "bientôt disponible".
//
// Quand le porteur du projet aura choisi l'agrégateur (ex:
// PayDunya, FedaPay), il suffira de :
//   1. créer src/lib/payments/<fournisseur>.ts implémentant
//      PaymentProvider (createCheckout retourne checkoutUrl)
//   2. ajouter ici une branche qui détecte les variables d'env
//      du fournisseur et instancie l'adaptateur.
// Aucune autre partie du code (route frontend, packs) n'est à
// modifier.

import { PaymentProvider } from "./types";

function detectProvider(): PaymentProvider | null {
  // Détection des variables d'environnement d'un agrégateur.
  // Aucun fournisseur configuré pour l'instant → on retourne null.
  const hasPaydunya = !!process.env.PAYDUNYA_API_KEY || !!process.env.PAYDUNYA_MASTER_KEY;
  const hasFedapay = !!process.env.FEDAPAY_API_KEY || !!process.env.FEDAPAY_SECRET_KEY;
  const hasCinetpay = !!process.env.CINETPAY_API_KEY || !!process.env.CINETPAY_SITE_ID;

  if (!hasPaydunya && !hasFedapay && !hasCinetpay) {
    return null;
  }

  // Un fournisseur est configuré mais son adaptateur n'est pas
  // encore implémenté : on retourne null et la route affiche le
  // placeholder. Ne jamais deviner d'intégration ici.
  return null;
}

export function getPaymentProvider(): PaymentProvider | null {
  return detectProvider();
}
