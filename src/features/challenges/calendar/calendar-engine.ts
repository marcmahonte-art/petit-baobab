import type { CalendarDay, ChestDefinition } from "../types"
import { CHESTS } from "../constants"

const WEEK_REWARDS: { type: "xp" | "stars"; quantity: number }[] = [
  { type: "xp", quantity: 10 },
  { type: "stars", quantity: 2 },
  { type: "xp", quantity: 20 },
  { type: "stars", quantity: 3 },
  { type: "xp", quantity: 30 },
  { type: "stars", quantity: 5 },
]

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"]

export function buildCalendarMonth(
  childId: string,
  claimedDays: number[],
  currentDayOfYear: number,
): CalendarDay[] {
  const monthDays: CalendarDay[] = []

  for (let i = 0; i < 31; i++) {
    const dayNumber = i + 1
    const isClaimed = claimedDays.includes(dayNumber)
    const isAvailable = dayNumber <= currentDayOfYear
    const chest = CHESTS.find((c) => c.day === dayNumber)
    const weeklyReward = WEEK_REWARDS[(dayNumber - 1) % WEEK_REWARDS.length]

    const reward = chest
      ? { xp: chest.contents.reduce((sum, c) => sum + (c.type === "xp" ? c.quantity : 0), 0), stars: chest.contents.reduce((sum, c) => sum + (c.type === "stars" ? c.quantity : 0), 0) }
      : { xp: weeklyReward.type === "xp" ? weeklyReward.quantity : 0, stars: weeklyReward.type === "stars" ? weeklyReward.quantity : 0 }

    monthDays.push({
      day: dayNumber,
      status: isClaimed ? "claimed" : isAvailable ? "available" : "locked",
      reward,
    })
  }

  return monthDays
}

export function isChestDay(day: number): ChestDefinition | null {
  return CHESTS.find((c) => c.day === day) ?? null
}

export function getNextChest(claimedDays: number[]): ChestDefinition | null {
  for (const chest of CHESTS) {
    if (!claimedDays.includes(chest.day)) return chest
  }
  return null
}

export function getChestByDay(day: number): ChestDefinition | null {
  return isChestDay(day)
}

export function getDayLabel(index: number): string {
  return DAY_LABELS[index % DAY_LABELS.length]
}

export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export function isTodayClaimable(day: number, currentDayOfYear: number): boolean {
  return day === currentDayOfYear
}

export function buildDefaultDailyCalendar(): { claimedDays: number[]; lastClaimDay: number } {
  return { claimedDays: [], lastClaimDay: 0 }
}
