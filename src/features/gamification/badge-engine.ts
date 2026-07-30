import { BADGE_DEFINITIONS, BADGE_THRESHOLDS } from "./constants"
import type { Badge, GameEventType } from "./types"

export class BadgeEngine {
  private eventCounters = new Map<string, Map<string, number>>()

  private getCounter(childId: string, event: string): number {
    const childCounters = this.eventCounters.get(childId) ?? new Map()
    return childCounters.get(event) ?? 0
  }

  private incrementCounter(childId: string, event: string): void {
    let childCounters = this.eventCounters.get(childId)
    if (!childCounters) {
      childCounters = new Map()
      this.eventCounters.set(childId, childCounters)
    }
    childCounters.set(event, (childCounters.get(event) ?? 0) + 1)
  }

  check(childId: string, event: GameEventType, earnedBadges: string[], streakDays: number): Badge[] {
    this.incrementCounter(childId, event)

    const newBadges: Badge[] = []

    for (const badge of BADGE_DEFINITIONS) {
      if (earnedBadges.includes(badge.id)) continue
      if (badge.secret && badge.id !== `level_${this.getLevelForSecret(badge.id)}` && badge.id !== "streak_100") continue

      const thresholds = BADGE_THRESHOLDS[badge.id]
      if (thresholds) {
        let qualified = true
        for (const t of thresholds) {
          const count = this.getCounter(childId, t.event)
          if (count < t.count) {
            qualified = false
            break
          }
        }
        if (qualified) newBadges.push(badge)
      }

      if (badge.id.startsWith("streak_")) {
        const required = parseInt(badge.id.split("_")[1], 10)
        if (streakDays >= required && !earnedBadges.includes(badge.id)) {
          if (!newBadges.find((b) => b.id === badge.id)) newBadges.push(badge)
        }
      }
    }

    return newBadges
  }

  getById(id: string): Badge | undefined {
    return BADGE_DEFINITIONS.find((b) => b.id === id)
  }

  getAll(): Badge[] {
    return [...BADGE_DEFINITIONS]
  }

  setCounters(childId: string, counters: Record<string, number>): void {
    const childCounters = new Map(Object.entries(counters))
    this.eventCounters.set(childId, childCounters)
  }

  private getLevelForSecret(badgeId: string): number {
    return parseInt(badgeId.split("_")[1], 10) || 0
  }
}

export const badgeEngine = new BadgeEngine()
