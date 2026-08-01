import { eventBus } from "../../gamification/event-bus"
import type { AnyEventPayload } from "../../gamification/event-bus"
import { getSupabaseClient } from "@/lib/supabase-client"
import { usePortfolioStore } from "../store/portfolio-store"
import { useLearningStore } from "../../learning-paths/store/learning-store"
import { portfolioEngine } from "../engine/portfolio-engine"
import { EVENT_TYPE_META, DEFAULT_PORTFOLIO_THEME } from "../constants"
import type {
  ChildPortfolio,
  LearningCertificateLike,
  PortfolioEvent,
  PortfolioEventType,
  TimeCapsule,
} from "../types"

type Supabase = ReturnType<typeof getSupabaseClient>

/**
 * Portfolio Service — orchestration.
 * - Écoute le bus de gamification (eventBus.onAny) → crée des événements automatiquement.
 * - Écoute le store des parcours (certificats / parcours terminés).
 * - Persiste tout dans Supabase (optimistic, try/catch offline).
 */
export class PortfolioService {
  private childId: string | null = null
  private cleanup: (() => void) | null = null
  private seenCertificates = new Set<string>()
  private initialized = false

  async init(childId: string): Promise<void> {
    if (this.initialized && this.childId === childId) return
    this.childId = childId

    // Sémence de la liste des certificats déjà vus.
    this.seenCertificates = new Set(useLearningStore.getState().certificates.map((c) => c.token))

    const store = usePortfolioStore.getState()
    store.set({ childId, loading: true })

    try {
      const supabase = getSupabaseClient()
      const [portfolio, events, albums, favorites, capsules] = await Promise.all([
        this.ensurePortfolio(supabase, childId),
        this.loadEvents(supabase, childId),
        this.loadAlbums(supabase, childId),
        this.loadFavorites(supabase, childId),
        this.loadCapsules(supabase, childId),
      ])

      store.set({
        portfolio,
        events,
        albums,
        favorites,
        capsules,
        loading: false,
        initialized: true,
      })
    } catch {
      // Offline : le store (persisté) reste la source de vérité.
      store.set({ loading: false, initialized: true })
    }

    if (!this.initialized) {
      this.cleanup = eventBus.onAny((payload) => {
        if (payload.childId === this.childId) {
          void this.handleEvent(payload)
        }
      })
      this.subscribeToLearning()
      this.initialized = true
    }
  }

  dispose(): void {
    this.cleanup?.()
    this.initialized = false
  }

  // -------------------------------------------------------------------------
  // Chargement / seed
  // -------------------------------------------------------------------------

  private async ensurePortfolio(supabase: Supabase, childId: string): Promise<ChildPortfolio | null> {
    const { data, error } = await supabase
      .from("child_portfolio")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle()

    if (error) throw error
    if (data) return data as ChildPortfolio

    const now = new Date().toISOString()
    const row = {
      child_id: childId,
      cover: null,
      theme: DEFAULT_PORTFOLIO_THEME,
      created_at: now,
      updated_at: now,
    }
    const { data: inserted } = await supabase.from("child_portfolio").insert(row).select().single()
    return (inserted ?? { id: crypto.randomUUID(), ...row }) as ChildPortfolio
  }

  private async loadEvents(supabase: Supabase, childId: string): Promise<PortfolioEvent[]> {
    const { data } = await supabase
      .from("portfolio_events")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: true })
    return (data ?? []) as PortfolioEvent[]
  }

  private async loadAlbums(supabase: Supabase, childId: string): Promise<import("../types").PortfolioAlbum[]> {
    const { data } = await supabase.from("portfolio_albums").select("*").eq("child_id", childId)
    return (data ?? []) as import("../types").PortfolioAlbum[]
  }

  private async loadFavorites(supabase: Supabase, childId: string): Promise<import("../types").PortfolioFavorite[]> {
    const { data } = await supabase.from("portfolio_favorites").select("*").eq("child_id", childId)
    return (data ?? []) as import("../types").PortfolioFavorite[]
  }

  private async loadCapsules(supabase: Supabase, childId: string): Promise<TimeCapsule[]> {
    const { data } = await supabase.from("portfolio_time_capsules").select("*").eq("child_id", childId)
    return (data ?? []) as TimeCapsule[]
  }

  // -------------------------------------------------------------------------
  // Moteur automatique (eventBus)
  // -------------------------------------------------------------------------

  async handleEvent(payload: AnyEventPayload): Promise<void> {
    if (!this.childId || payload.childId !== this.childId) return
    if (portfolioEngine.isNoisyEvent(payload.type)) return

    const meta = EVENT_TYPE_META[payload.type as PortfolioEventType]
    if (!meta) return

    const event: PortfolioEvent = {
      id: crypto.randomUUID(),
      child_id: this.childId,
      event_type: payload.type as PortfolioEventType,
      title: meta.title,
      description: this.describe(payload.type, payload.metadata),
      image: (payload.metadata?.image as string | undefined) ?? null,
      metadata: payload.metadata ?? {},
      created_at: new Date().toISOString(),
    }

    usePortfolioStore.getState().addEvent(event)
    await this.persistEvent(event)
  }

  /** Ajout manuel d'un souvenir (photos souvenirs / famille). */
  async addMemory(data: { title: string; description?: string; image?: string }): Promise<void> {
    if (!this.childId) return
    const event: PortfolioEvent = {
      id: crypto.randomUUID(),
      child_id: this.childId,
      event_type: "PORTFOLIO_MEMORY",
      title: data.title,
      description: data.description ?? null,
      image: data.image ?? null,
      metadata: { kind: "memory" },
      created_at: new Date().toISOString(),
    }
    usePortfolioStore.getState().addEvent(event)
    await this.persistEvent(event)
  }

  // -------------------------------------------------------------------------
  // Parcours pédagogiques (learning store)
  // -------------------------------------------------------------------------

  private subscribeToLearning(): void {
    useLearningStore.subscribe((state, prev) => {
      if (state.childId !== this.childId) return

      // Un certificat est émis uniquement quand un parcours est entièrement terminé.
      for (const certificate of state.certificates) {
        if (!certificate.token || this.seenCertificates.has(certificate.token)) continue
        this.seenCertificates.add(certificate.token)
        void this.recordCertificate(certificate)
        void this.recordPathCompleted(certificate.path_id)
      }

      // Prévoit le cas où le certificat est déjà présent avant l'init (rétro-compat).
      if (!prev.initialized && state.initialized) {
        for (const certificate of state.certificates) {
          if (!this.seenCertificates.has(certificate.token)) {
            this.seenCertificates.add(certificate.token)
            void this.recordCertificate(certificate)
            void this.recordPathCompleted(certificate.path_id)
          }
        }
      }
    })
  }

  private async recordCertificate(certificate: LearningCertificateLike): Promise<void> {
    if (!this.childId) return
    const event: PortfolioEvent = {
      id: crypto.randomUUID(),
      child_id: this.childId,
      event_type: "CERTIFICATE_ISSUED",
      title: `Certificat : ${certificate.path_title}`,
      description: "Un parcours pédagogique réussi !",
      image: null,
      metadata: { path_id: certificate.path_id, token: certificate.token },
      created_at: certificate.issued_at ?? new Date().toISOString(),
    }
    usePortfolioStore.getState().addEvent(event)
    await this.persistEvent(event)
  }

  private async recordPathCompleted(pathId: string): Promise<void> {
    if (!this.childId) return
    const paths = useLearningStore.getState().paths
    const path = paths.find((p) => p.id === pathId)
    const event: PortfolioEvent = {
      id: crypto.randomUUID(),
      child_id: this.childId,
      event_type: "PATH_COMPLETED",
      title: path ? `Parcours terminé : ${path.title}` : "Parcours terminé",
      description: path?.description ?? null,
      image: path?.cover ?? null,
      metadata: { path_id: pathId },
      created_at: new Date().toISOString(),
    }
    usePortfolioStore.getState().addEvent(event)
    await this.persistEvent(event)
  }

  // -------------------------------------------------------------------------
  // Favoris / capsule temporelle
  // -------------------------------------------------------------------------

  async toggleFavorite(resourceType: string, resourceId: string): Promise<void> {
    if (!this.childId) return
    const store = usePortfolioStore.getState()
    const existing = store.favorites.find((f) => f.resource_type === resourceType && f.resource_id === resourceId)

    if (existing) {
      store.toggleFavorite(resourceType, resourceId, this.childId)
      try {
        const supabase = getSupabaseClient()
        await supabase.from("portfolio_favorites").delete().eq("id", existing.id)
      } catch {
        // Offline
      }
      return
    }

    store.toggleFavorite(resourceType, resourceId, this.childId)
    const favorite = store.favorites.find((f) => f.resource_type === resourceType && f.resource_id === resourceId)
    if (!favorite) return
    try {
      const supabase = getSupabaseClient()
      await supabase.from("portfolio_favorites").insert({
        child_id: this.childId,
        resource_type: resourceType,
        resource_id: resourceId,
      })
    } catch {
      // Offline
    }
  }

  async saveTimeCapsule(message: string, years: 1 | 3 | 5, author?: string): Promise<void> {
    if (!this.childId) return
    const now = new Date()
    const lockedUntil = new Date(now.getFullYear() + years, now.getMonth(), now.getDate())
    const capsule: TimeCapsule = {
      id: crypto.randomUUID(),
      child_id: this.childId,
      message,
      author: author ?? null,
      unlock_after_years: years,
      locked_until: lockedUntil.toISOString(),
      opened: false,
      created_at: now.toISOString(),
    }
    usePortfolioStore.getState().addCapsule(capsule)
    try {
      const supabase = getSupabaseClient()
      await supabase.from("portfolio_time_capsules").insert({
        child_id: this.childId,
        message,
        author: author ?? null,
        unlock_after_years: years,
        locked_until: capsule.locked_until,
      })
    } catch {
      // Offline
    }
  }

  markCapsuleOpened(capsuleId: string): void {
    usePortfolioStore.getState().markCapsuleOpened(capsuleId)
  }

  // -------------------------------------------------------------------------
  // Persistance
  // -------------------------------------------------------------------------

  private async persistEvent(event: PortfolioEvent): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      await supabase.from("portfolio_events").upsert(
        {
          id: event.id,
          child_id: event.child_id,
          event_type: event.event_type,
          title: event.title,
          description: event.description,
          image: event.image,
          metadata: (event.metadata ?? {}) as Record<string, unknown>,
          created_at: event.created_at,
        },
        { onConflict: "id" },
      )
    } catch {
      // Offline : Zustand reste la source de vérité.
    }
  }

  private describe(type: string, metadata?: Record<string, unknown>): string | null {
    const parts: string[] = []
    if (type === "BADGE_UNLOCKED" && typeof metadata?.badgeName === "string") parts.push(metadata.badgeName)
    if (typeof metadata?.style === "string") parts.push(`Style ${metadata.style}`)
    if (typeof metadata?.pages === "number") parts.push(`${metadata.pages} pages`)
    if (typeof metadata?.score === "number") parts.push(`Score ${metadata.score}`)
    if (typeof metadata?.objectKey === "string") parts.push(metadata.objectKey)
    return parts.length > 0 ? parts.join(" · ") : null
  }
}

export const portfolioService = new PortfolioService()
