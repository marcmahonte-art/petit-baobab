import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { PORTFOLIO_STORAGE_KEY } from "../constants"
import type {
  ChildPortfolio,
  PortfolioAlbum,
  PortfolioEvent,
  PortfolioFavorite,
  TimeCapsule,
} from "../types"

interface PortfolioState {
  childId: string | null
  portfolio: ChildPortfolio | null
  events: PortfolioEvent[]
  albums: PortfolioAlbum[]
  favorites: PortfolioFavorite[]
  capsules: TimeCapsule[]
  loading: boolean
  initialized: boolean
}

interface PortfolioActions {
  set: (partial: Partial<PortfolioState>) => void
  setPortfolio: (portfolio: ChildPortfolio | null) => void
  setEvents: (events: PortfolioEvent[]) => void
  addEvent: (event: PortfolioEvent) => void
  addAlbum: (album: PortfolioAlbum) => void
  toggleFavorite: (resourceType: string, resourceId: string, childId: string) => void
  addCapsule: (capsule: TimeCapsule) => void
  markCapsuleOpened: (capsuleId: string) => void
  reset: () => void
}

const initialState: PortfolioState = {
  childId: null,
  portfolio: null,
  events: [],
  albums: [],
  favorites: [],
  capsules: [],
  loading: false,
  initialized: false,
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set) => ({
      ...initialState,

      set: (partial) => set(partial),

      setPortfolio: (portfolio) => set({ portfolio }),

      setEvents: (events) => set({ events }),

      addEvent: (event) =>
        set((state) => ({
          events: state.events.some((e) => e.id === event.id)
            ? state.events.map((e) => (e.id === event.id ? event : e))
            : [...state.events, event],
        })),

      addAlbum: (album) =>
        set((state) => ({
          albums: state.albums.some((a) => a.id === album.id)
            ? state.albums.map((a) => (a.id === album.id ? album : a))
            : [...state.albums, album],
        })),

      toggleFavorite: (resourceType, resourceId, childId) =>
        set((state) => {
          const existing = state.favorites.find(
            (f) => f.resource_type === resourceType && f.resource_id === resourceId,
          )
          if (existing) {
            return { favorites: state.favorites.filter((f) => f.id !== existing.id) }
          }
          return {
            favorites: [
              ...state.favorites,
              {
                id: crypto.randomUUID(),
                child_id: childId,
                resource_type: resourceType,
                resource_id: resourceId,
                created_at: new Date().toISOString(),
              },
            ],
          }
        }),

      addCapsule: (capsule) =>
        set((state) => ({
          capsules: state.capsules.some((c) => c.id === capsule.id)
            ? state.capsules.map((c) => (c.id === capsule.id ? capsule : c))
            : [...state.capsules, capsule],
        })),

      markCapsuleOpened: (capsuleId) =>
        set((state) => ({
          capsules: state.capsules.map((c) => (c.id === capsuleId ? { ...c, opened: true } : c)),
        })),

      reset: () => set({ ...initialState }),
    }),
    {
      name: PORTFOLIO_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        childId: state.childId,
        events: state.events,
        albums: state.albums,
        favorites: state.favorites,
        capsules: state.capsules,
      }),
    },
  ),
)
