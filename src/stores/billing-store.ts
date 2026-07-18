"use client"

import { create } from "zustand"
import type { Subscription, Payment, Plan } from "@/lib/billing"

interface BillingState {
  subscription: Subscription | null
  accountPlan: string
  starsBalance: number
  payments: Payment[]
  paymentsPagination: { page: number; pages: number; total: number }
  paymentsStatus: string
  paymentsSearch: string
  plans: Plan[]
  isLoadingSubscription: boolean
  isLoadingPayments: boolean
  isLoadingPlans: boolean
  error: string | null

  fetchSubscription: () => Promise<void>
  fetchPayments: (page?: number) => Promise<void>
  fetchPlans: (scope?: "parent" | "school") => Promise<void>
  setPaymentsStatus: (status: string) => void
  setPaymentsSearch: (search: string) => void
}

export const useBillingStore = create<BillingState>((set, get) => ({
  subscription: null,
  accountPlan: "free",
  starsBalance: 0,
  payments: [],
  paymentsPagination: { page: 1, pages: 1, total: 0 },
  paymentsStatus: "all",
  paymentsSearch: "",
  plans: [],
  isLoadingSubscription: false,
  isLoadingPayments: false,
  isLoadingPlans: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoadingSubscription: true, error: null })
    try {
      const res = await fetch("/api/billing/subscription")
      if (!res.ok) throw new Error("Erreur lors du chargement de l'abonnement")
      const data = await res.json()
      set({
        subscription: data.subscription,
        accountPlan: data.account?.plan || "free",
        starsBalance: data.account?.stars_balance || 0,
      })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoadingSubscription: false })
    }
  },

  fetchPayments: async (page?: number) => {
    set({ isLoadingPayments: true, error: null })
    try {
      const { paymentsStatus, paymentsSearch, paymentsPagination } = get()
      const p = page || paymentsPagination.page
      const params = new URLSearchParams()
      if (paymentsStatus && paymentsStatus !== "all") params.set("status", paymentsStatus)
      if (paymentsSearch) params.set("search", paymentsSearch)
      params.set("page", String(p))

      const res = await fetch(`/api/billing/payments?${params}`)
      if (!res.ok) throw new Error("Erreur lors du chargement des paiements")
      const data = await res.json()
      set({
        payments: data.payments,
        paymentsPagination: data.pagination,
      })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoadingPayments: false })
    }
  },

  fetchPlans: async (scope?: "parent" | "school") => {
    set({ isLoadingPlans: true, error: null })
    try {
      const query = scope ? `?scope=${scope}` : ""
      const res = await fetch(`/api/billing/plans${query}`)
      if (!res.ok) throw new Error("Erreur lors du chargement des plans")
      const data = await res.json()
      set({ plans: data.plans })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoadingPlans: false })
    }
  },

  setPaymentsStatus: (status) => {
    set({ paymentsStatus: status })
    get().fetchPayments(1)
  },

  setPaymentsSearch: (search) => {
    set({ paymentsSearch: search })
    get().fetchPayments(1)
  },
}))
