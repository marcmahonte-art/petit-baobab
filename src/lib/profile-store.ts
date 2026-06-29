import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type PlanType = "free" | "decouverte" | "super-baobab" | "ecole-pro"

export interface ChildProfile {
  id: string
  name: string
  mascot: "awa" | "lion" | "robot"
  language: "fr" | "en"
  points: number
  badges: string[]
  createdAt: number
}

export interface ProfileState {
  profiles: ChildProfile[]
  activeProfileId: string | null
  plan: PlanType

  addProfile: (data: Omit<ChildProfile, "id" | "points" | "badges" | "createdAt">) => void
  removeProfile: (id: string) => void
  setActiveProfile: (id: string) => void
  switchProfile: (id: string) => void
  addPoints: (id: string, points: number) => void
  addBadge: (id: string, badge: string) => void
  canAddProfile: () => boolean
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      plan: "free",

      addProfile: (data) => {
        const { profiles, plan } = get()
        const max = maxProfilesForPlan(plan)
        if (profiles.length >= max) return

        const newProfile: ChildProfile = {
          ...data,
          id: crypto.randomUUID(),
          points: 0,
          badges: [],
          createdAt: Date.now(),
        }

        set({
          profiles: [...profiles, newProfile],
          activeProfileId: newProfile.id,
        })
      },

      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id
              ? state.profiles.find((p) => p.id !== id)?.id ?? null
              : state.activeProfileId,
        })),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      switchProfile: (id) => {
        const { profiles } = get()
        if (profiles.some((p) => p.id === id)) {
          set({ activeProfileId: id })
        }
      },

      addPoints: (id, points) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, points: p.points + points } : p,
          ),
        })),

      addBadge: (id, badge) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id && !p.badges.includes(badge)
              ? { ...p, badges: [...p.badges, badge] }
              : p,
          ),
        })),

      canAddProfile: () => {
        const { profiles, plan } = get()
        return profiles.length < maxProfilesForPlan(plan)
      },
    }),
    {
      name: "petit-baobab-profiles",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export function getActiveProfile(): ChildProfile | undefined {
  const { profiles, activeProfileId } = useProfileStore.getState()
  return profiles.find((p) => p.id === activeProfileId)
}

export function maxProfilesForPlan(plan: PlanType): number {
  switch (plan) {
    case "free":
    case "decouverte":
      return 1
    case "super-baobab":
      return 3
    case "ecole-pro":
      return Infinity
  }
}

export function getBadges(
  points: number,
  drawingsCount: number,
  iaCount: number,
  booksCount: number,
): string[] {
  const badges: string[] = []

  if (drawingsCount >= 1) badges.push("Super Artiste")
  if (drawingsCount >= 5) badges.push("Explorateur")
  if (iaCount >= 3) badges.push("Créatif")
  if (booksCount >= 1) badges.push("Lecteur")

  return badges
}
