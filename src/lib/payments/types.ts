// ============================================================
// Petit Baobab — Interface générique de paiement (Agrégateur)
// ============================================================
// Interface minimale que tout fournisseur (PayDunya, FedaPay,
// CinetPay, Stripe, ...) devra implémenter. Permet de brancher
// n'importe quel agrégateur plus tard sans toucher aux routes
// existantes ni à la logique de packs.

export type CheckoutType = "pack" | "plan";

export interface PaymentCheckoutParams {
  accountId: string;
  type: CheckoutType;
  /** Requis si type === "pack". */
  packId?: string;
  /** Requis si type === "plan". */
  planId?: string;
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

// Plans payants (abonnement ou achat unique). Distinct des packs : un achat
// de plan modifie accounts.plan, alors qu'un pack n'ajoute que des étoiles.
export type PlanKind = "one_time" | "monthly";

export interface PaidPlan {
  id: "decouverte" | "super_baobab" | "ecole_pro";
  name: string;
  stars: number;
  price_xof: number;
  kind: PlanKind;
  /** true = réservé aux structures scolaires (enseignants). */
  schoolOnly: boolean;
}

export const PAID_PLANS: PaidPlan[] = [
  { id: "decouverte", name: "Découverte", stars: 100, price_xof: 2000, kind: "one_time", schoolOnly: false },
  { id: "super_baobab", name: "Super Baobab", stars: 250, price_xof: 4500, kind: "monthly", schoolOnly: false },
  { id: "ecole_pro", name: "École / Pro", stars: 1000, price_xof: 25000, kind: "monthly", schoolOnly: true },
];

export function findPlan(planId: string): PaidPlan | undefined {
  return PAID_PLANS.find((p) => p.id === planId);
}
