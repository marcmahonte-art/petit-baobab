import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PlanType = "free" | "decouverte" | "super-baobab" | "ecole-pro"

export type StyleType = "noir_blanc" | "contour_simple" | "dessin_detaille" | "version_couleur"

export const CREDIT_COST: Record<StyleType, number> = {
  contour_simple: 1,
  noir_blanc: 3,
  dessin_detaille: 3,
  version_couleur: 6,
}

export const DAILY_FREE_LIMIT = 3

const MONTHLY_PLAN_CREDITS: Record<PlanType, number> = {
  free: 0,
  decouverte: 100,
  "super-baobab": 250,
  "ecole-pro": 1000,
}

function getTodayDate(): string {
  const d = new Date()
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isNewDay(lastReset: string): boolean {
  return getTodayDate() !== lastReset
}

function isNewMonthlyPeriod(subscriptionDate: string, lastReset: string): boolean {
  const now = new Date()
  const sub = new Date(subscriptionDate)
  const last = new Date(lastReset)

  const annivDay = sub.getUTCDate()
  const anniv = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), annivDay))

  if (anniv.getUTCMonth() !== now.getUTCMonth()) {
    anniv.setUTCDate(0)
  }

  return now >= anniv && last < anniv
}

export function getCreditCost(style: StyleType): number {
  return CREDIT_COST[style]
}

export function canGenerate(style: StyleType): { allowed: boolean; reason?: string; cost: number } {
  const state = useCreditStore.getState()
  const cost = CREDIT_COST[style]

  if (state.plan === "free") {
    if (style !== "contour_simple") {
      return { allowed: false, reason: "Réservé aux abonnés", cost }
    }
    const remaining = DAILY_FREE_LIMIT - state.creditsUsedToday
    if (remaining < cost) {
      return { allowed: false, reason: "Limite quotidienne atteinte", cost }
    }
    return { allowed: true, cost }
  }

  const remaining = state.monthlyCredits - state.monthlyUsed
  if (remaining < cost) {
    return { allowed: false, reason: "Crédits insuffisants", cost }
  }
  return { allowed: true, cost }
}

export interface CreditInfo {
  remaining: number
  used: number
  total: number
  plan: PlanType
}

export interface CreditState {
  plan: PlanType
  creditsUsedToday: number
  dailyResetDate: string
  monthlyCredits: number
  monthlyUsed: number
  subscriptionDate: string | null
  lastMonthlyReset: string | null

  useCredits: () => CreditInfo
  consume: (style: StyleType) => { success: boolean; reason?: string }
  refund: (style: StyleType) => void
  resetDaily: () => void
  resetMonthly: () => void
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => {
      const today = getTodayDate()

      return {
        plan: "free",
        creditsUsedToday: 0,
        dailyResetDate: today,
        monthlyCredits: 0,
        monthlyUsed: 0,
        subscriptionDate: null,
        lastMonthlyReset: null,

        useCredits: () => {
          const s = get()

          if (s.plan === "free") {
            if (isNewDay(s.dailyResetDate)) {
              s.resetDaily()
              return { remaining: DAILY_FREE_LIMIT, used: 0, total: DAILY_FREE_LIMIT, plan: "free" }
            }
            return {
              remaining: DAILY_FREE_LIMIT - s.creditsUsedToday,
              used: s.creditsUsedToday,
              total: DAILY_FREE_LIMIT,
              plan: s.plan,
            }
          }

          if (s.subscriptionDate && s.lastMonthlyReset && isNewMonthlyPeriod(s.subscriptionDate, s.lastMonthlyReset)) {
            s.resetMonthly()
          }

          const updated = get()
          return {
            remaining: updated.monthlyCredits - updated.monthlyUsed,
            used: updated.monthlyUsed,
            total: updated.monthlyCredits,
            plan: updated.plan,
          }
        },

        consume: (style) => {
          const check = canGenerate(style)
          if (!check.allowed) {
            return { success: false, reason: check.reason }
          }

          const state = get()
          const cost = check.cost

          if (state.plan === "free") {
            set({ creditsUsedToday: state.creditsUsedToday + cost })
          } else {
            set({ monthlyUsed: state.monthlyUsed + cost })
          }

          return { success: true }
        },

        refund: (style) => {
          const cost = CREDIT_COST[style]
          const state = get()

          if (state.plan === "free") {
            set({ creditsUsedToday: Math.max(0, state.creditsUsedToday - cost) })
          } else {
            set({ monthlyUsed: Math.max(0, state.monthlyUsed - cost) })
          }
        },

        resetDaily: () => {
          set({ creditsUsedToday: 0, dailyResetDate: getTodayDate() })
        },

        resetMonthly: () => {
          const state = get()
          set({
            monthlyUsed: 0,
            monthlyCredits: MONTHLY_PLAN_CREDITS[state.plan],
            lastMonthlyReset: new Date().toISOString(),
          })
        },
      }
    },
    { name: "petit-baobab-credits" },
  ),
)
