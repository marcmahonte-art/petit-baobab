import type { Notification } from "./types"

export class NotificationEngine {
  private notifications = new Map<string, Notification[]>()
  private subscribers = new Set<(childId: string, notifications: Notification[]) => void>()

  add(childId: string, notif: Omit<Notification, "id" | "read" | "createdAt">): Notification {
    const full: Notification = {
      ...notif,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    }

    const list = this.notifications.get(childId) ?? []
    list.unshift(full)
    this.notifications.set(childId, list)

    this.broadcast(childId)
    return full
  }

  get(childId: string): Notification[] {
    return this.notifications.get(childId) ?? []
  }

  getUnreadCount(childId: string): number {
    return this.get(childId).filter((n) => !n.read).length
  }

  markAsRead(childId: string, id: string): void {
    const list = this.notifications.get(childId)
    if (!list) return
    const notif = list.find((n) => n.id === id)
    if (notif) {
      notif.read = true
      this.broadcast(childId)
    }
  }

  markAllAsRead(childId: string): void {
    const list = this.notifications.get(childId)
    if (!list) return
    list.forEach((n) => { n.read = true })
    this.broadcast(childId)
  }

  subscribe(callback: (childId: string, notifications: Notification[]) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private broadcast(childId: string): void {
    const list = this.get(childId)
    this.subscribers.forEach((cb) => cb(childId, list))
  }
}

export const notificationEngine = new NotificationEngine()
