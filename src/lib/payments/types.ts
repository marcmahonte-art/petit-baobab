// ============================================================
// Petit Baobab — Interface générique de paiement (Agrégateur)
// ============================================================
// Interface minimale que tout fournisseur (PayDunya, FedaPay,
// CinetPay, Stripe, ...) devra implémenter. Permet de brancher
// n'importe quel agrégateur plus tard sans toucher aux routes
// existantes ni à la logique de packs.

export interface PaymentCheckoutParams {
  accountId: string;
  packId: string;
  amountXof: number;
  stars: number;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentCheckoutResult {
  checkoutUrl: string;
}

export interface PaymentProvider {
  createCheckout(params: PaymentCheckoutParams): Promise<PaymentCheckoutResult>;
}

// Packs d'étoiles disponibles (indépendants du fournisseur).
export interface StarsPack {
  id: string;
  stars: number;
  price_xof: number;
  label: string;
}

export const STARS_PACKS: StarsPack[] = [
  { id: "pack_100", stars: 100, price_xof: 2000, label: "100 étoiles" },
  { id: "pack_250", stars: 250, price_xof: 4500, label: "250 étoiles" },
  { id: "pack_500", stars: 500, price_xof: 8000, label: "500 étoiles" },
];

export function findPack(packId: string): StarsPack | undefined {
  return STARS_PACKS.find((p) => p.id === packId);
}
