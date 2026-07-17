export type PlanId = "free" | "decouverte" | "super_baobab" | "ecole_pro"
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "trial"
export type RenewalType = "monthly" | "yearly" | "one_time"
export type PaymentStatus = "success" | "pending" | "failed" | "cancelled"
export type TransactionType = "credit" | "debit"
export type TransactionReason =
  | "generation"
  | "livre"
  | "purchase"
  | "reward"
  | "bonus"
  | "signup_bonus"
  | "refund"
  | "daily_reset"
  | "subscription_renewal"
  | "admin_grant"

export interface Subscription {
  id: string
  user_id: string
  plan: PlanId
  status: SubscriptionStatus
  stars_total: number
  stars_remaining: number
  started_at: string
  expires_at: string | null
  renewal_type: RenewalType
  provider: string
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  provider: string
  transaction_id: string
  amount: number
  currency: string
  status: PaymentStatus
  plan: string
  invoice_number: string
  receipt_url: string | null
  created_at: string
}

export interface StarsTransaction {
  id: string
  account_id: string
  amount: number
  type: TransactionType
  reason: TransactionReason
  reference_id: string | null
  balance_after: number
  created_at: string
}

export interface Plan {
  id: PlanId
  name: string
  price: string
  period: string
  credits: number
  creditsLabel: string
  isPopular?: boolean
  features: string[]
  color: "purple" | "blue" | "green"
}

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Gratuit",
  decouverte: "Découverte",
  super_baobab: "Super Baobab",
  ecole_pro: "École / Pro",
}

export const TRANSACTION_LABELS: Record<TransactionReason, string> = {
  generation: "Dessin magique",
  livre: "Livre personnalisé",
  purchase: "Achat d'étoiles",
  reward: "Récompense quotidienne",
  bonus: "Bonus",
  signup_bonus: "Bonus d'inscription",
  refund: "Remboursement",
  daily_reset: "Réinitialisation quotidienne",
  subscription_renewal: "Renouvellement abonnement",
  admin_grant: "Crédit offert",
}

export const TRANSACTION_ICONS: Record<TransactionReason, string> = {
  generation: "🎨",
  livre: "📚",
  purchase: "💳",
  reward: "🏆",
  bonus: "🎉",
  signup_bonus: "🎁",
  refund: "↩️",
  daily_reset: "🔄",
  subscription_renewal: "⭐",
  admin_grant: "🎁",
}
