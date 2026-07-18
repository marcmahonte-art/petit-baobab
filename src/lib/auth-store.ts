import { create } from "zustand"
import { useProfileStore } from "./profile-store"
import { useCreditStore } from "./credit-store"
import { supabase } from "@/lib/supabaseClient"

export interface UserSession {
  id: string
  email: string
}

export interface AccountSession {
  id: string
  stars_balance: number
  plan: "free" | "decouverte" | "super_baobab" | "ecole_pro"
}

export interface ChildProfileSession {
  id: string
  name: string
  mascot: "awa" | "lion" | "robot"
  pin_required: boolean
}

export interface StudentSessionState {
  type: "student"
  name: string
  mascot: "awa" | "lion" | "robot"
  profileId: string
  classroomId: string
  accountId: string
  starsBalance: number
}

interface AuthState {
  user: UserSession | null
  account: AccountSession | null
  profiles: ChildProfileSession[]
  activeProfileId: string | null
  studentSession: StudentSessionState | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; multipleProfiles?: boolean }>
  signup: (email: string, password: string, ageConsent: boolean) => Promise<{ success: boolean; message?: string; error?: string }>
  logout: () => Promise<void>
  selectProfile: (profileId: string) => void
  setStarsBalance: (balance: number) => void
  setStudentSession: (session: StudentSessionState) => void
  clearStudentSession: () => void
  checkSession: () => Promise<void>
}

// Map db plan values to frontend values
function normalizePlan(plan: string): any {
  if (plan === "super_baobab") return "super-baobab"
  if (plan === "ecole_pro") return "ecole-pro"
  return plan
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  account: null,
  profiles: [],
  activeProfileId: null,
  studentSession: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Identifiants incorrects.")
      }

      if (data.accessToken && data.refreshToken) {
        await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
        })
      }

      const activeId = data.profiles && data.profiles.length > 0 ? data.profiles[0].id : null

      set({
        user: data.user,
        account: data.account,
        profiles: data.profiles || [],
        activeProfileId: activeId,
        isLoading: false,
      })

      // Sync the other Zustand stores
      if (data.account) {
        const creditStore = useCreditStore.getState()
        useCreditStore.setState({
          plan: normalizePlan(data.account.plan),
          // We set local credit store to match stars balance
          monthlyCredits: data.account.stars_balance,
          monthlyUsed: 0,
        })
      }

      if (data.profiles) {
        const profileStore = useProfileStore.getState()
        const mappedProfiles = data.profiles.map((p: any) => ({
          id: p.id,
          name: p.name,
          mascot: p.mascot,
          language: "fr",
          points: 0,
          badges: [],
          createdAt: Date.now(),
        }))

        useProfileStore.setState({
          profiles: mappedProfiles,
          activeProfileId: activeId,
          plan: normalizePlan(data.account?.plan || "free"),
        })
      }

      return {
        success: true,
        multipleProfiles: data.profiles && data.profiles.length > 1,
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  signup: async (email, password, ageConsent) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ageConsent }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'inscription.")
      }

      set({ isLoading: false })
      return { success: true, message: data.message }
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      return { success: false, error: err.message }
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (e) {
      console.error("Logout request failed:", e)
    }

    set({
      user: null,
      account: null,
      profiles: [],
      activeProfileId: null,
      studentSession: null,
    })

    // Clear local stores
    useProfileStore.setState({ profiles: [], activeProfileId: null, plan: "free" })
    useCreditStore.setState({ plan: "free", creditsUsedToday: 0, monthlyCredits: 0 })
  },

  selectProfile: (profileId) => {
    const { profiles } = get()
    if (profiles.some((p) => p.id === profileId)) {
      set({ activeProfileId: profileId })
      useProfileStore.setState({ activeProfileId: profileId })
    }
  },

  setStudentSession: (session) => {
    set({ studentSession: session })
    // Sync crédit store pour afficher le solde d'étoiles élève
    useCreditStore.setState({
      plan: "ecole-pro",
      monthlyCredits: session.starsBalance,
      monthlyUsed: 0,
    })
    // Sync profile store pour que le header élève et les pages
    // coloriage/livre puissent lire le nom et mascot de l'élève
    useProfileStore.setState({
      profiles: [
        {
          id: session.profileId,
          name: session.name,
          mascot: session.mascot,
          language: "fr",
          points: 0,
          badges: [],
          createdAt: Date.now(),
        },
      ],
      activeProfileId: session.profileId,
      plan: "ecole-pro",
    })
  },

  clearStudentSession: () => {
    set({ studentSession: null })
  },

  setStarsBalance: (balance) => {
    set((state) => {
      const next: Partial<AuthState> = {}
      // Parent / compte familial
      if (state.account) {
        next.account = { ...state.account, stars_balance: balance }
      }
      // Élève : mettre à jour le solde de la session élève pour que le Header
      // affiche immédiatement le bon nombre d'étoiles après génération.
      if (state.studentSession) {
        next.studentSession = { ...state.studentSession, starsBalance: balance }
      }
      if (Object.keys(next).length === 0) return state
      return next
    })
    // Sync to credit store
    useCreditStore.setState({
      monthlyCredits: balance,
      monthlyUsed: 0,
    })
  },

  checkSession: async () => {
    try {
      const res = await fetch("/api/auth/session")
      if (!res.ok) {
        set({ isInitialized: true })
        return
      }

      const data = await res.json()
      if (data.authenticated && data.user) {
        if (data.accessToken && data.refreshToken) {
          // Silently set session; ignore errors (token might be expired, will redirect to login)
          await supabase.auth.setSession({
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
          }).catch(() => {})
        }
        set({
          user: data.user,
          account: data.account,
          profiles: data.profiles || [],
          activeProfileId: data.activeProfileId || (data.profiles && data.profiles[0]?.id) || null,
          isInitialized: true,
        })

        // Sync stores
        if (data.account) {
          useCreditStore.setState({
            plan: normalizePlan(data.account.plan),
            monthlyCredits: data.account.stars_balance,
            monthlyUsed: 0,
          })
        }
        if (data.profiles) {
          useProfileStore.setState({
            profiles: data.profiles.map((p: any) => ({
              id: p.id,
              name: p.name,
              mascot: p.mascot,
              language: "fr",
              points: 0,
              badges: [],
              createdAt: Date.now(),
            })),
            activeProfileId: data.activeProfileId || data.profiles[0]?.id || null,
            plan: normalizePlan(data.account?.plan || "free"),
          })
        }
      } else {
        set({ isInitialized: true })
      }
    } catch (e) {
      console.error("Check session failed:", e)
      set({ isInitialized: true })
    }
  },
}))
