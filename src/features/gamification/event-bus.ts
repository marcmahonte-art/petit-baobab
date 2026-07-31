import type { GameEventType, EventPayload, DrawingEventPayload, BookEventPayload, GameEventPayload, QuizEventPayload, ShopEventPayload, StarsEventPayload } from "./types"

export type AnyEventPayload =
  | (EventPayload & { type: GameEventType })
  | (DrawingEventPayload & { type: "DRAWING_CREATED" | "DRAWING_COMPLETED" | "MAGIC_DRAWING_CREATED" | "COLORING_COMPLETED" })
  | (BookEventPayload & { type: "BOOK_CREATED" | "BOOK_PRINTED" })
  | (GameEventPayload & { type: "GAME_COMPLETED" })
  | (QuizEventPayload & { type: "QUIZ_COMPLETED" })
  | (BookEventPayload & { type: "STORY_CREATED" })
  | (ShopEventPayload & { type: "SHOP_PURCHASE" | "SHOP_REVIEW" })
  | (StarsEventPayload & { type: "STARS_USED" | "STARS_EARNED" })

export type EmitPayload =
  | EventPayload
  | DrawingEventPayload
  | BookEventPayload
  | GameEventPayload
  | QuizEventPayload
  | ShopEventPayload
  | StarsEventPayload

type EventHandler = (payload: AnyEventPayload) => void | Promise<void>

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>()
  private history: AnyEventPayload[] = []
  private maxHistory = 200

  on(event: GameEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    return () => this.listeners.get(event)?.delete(handler)
  }

  off(event: GameEventType, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler)
  }

  onAny(handler: EventHandler): () => void {
    GAME_EVENTS.forEach((event) => this.on(event, handler))
    return () => GAME_EVENTS.forEach((event) => this.off(event, handler))
  }

  async emit(event: GameEventType, payload: EmitPayload): Promise<void> {
    const fullPayload = { ...payload, type: event } as AnyEventPayload

    this.history.push(fullPayload)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    const handlers = this.listeners.get(event)
    if (!handlers) return

    const promises: Promise<void>[] = []
    for (const handler of handlers) {
      const result = handler(fullPayload)
      if (result instanceof Promise) promises.push(result)
    }

    await Promise.allSettled(promises)
  }

  getHistory(): AnyEventPayload[] {
    return [...this.history]
  }

  getEventCount(event: GameEventType, childId: string): number {
    return this.history.filter((e) => e.type === event && e.childId === childId).length
  }

  clearHistory(): void {
    this.history = []
  }
}

import { GAME_EVENTS } from "./constants"

export const eventBus = new EventBus()

export function emit(event: GameEventType, payload: EmitPayload): Promise<void> {
  return eventBus.emit(event, payload)
}

export function emitGameEvent(event: GameEventType, payload: EmitPayload): Promise<void> {
  return eventBus.emit(event, payload)
}

export function on(event: GameEventType, handler: EventHandler): () => void {
  return eventBus.on(event, handler)
}
