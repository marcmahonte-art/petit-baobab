import { generateAllMissions } from "./mission-service"
import { getSeasonForDate } from "./season-service"

export type SchedulerTask =
  | { kind: "daily_reset"; at: string }
  | { kind: "weekly_reset"; at: string }
  | { kind: "monthly_reset"; at: string }
  | { kind: "season_tick"; at: string }

export interface SchedulerSnapshot {
  dailySeed: string
  weeklySeed: string
  monthlySeed: string
  seasonId: string
}

function seedOfDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function weekSeedOf(date: Date): string {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function monthSeedOf(date: Date): string {
  return date.toISOString().slice(0, 7)
}

export function currentSnapshot(date = new Date()): SchedulerSnapshot {
  return {
    dailySeed: seedOfDate(date),
    weeklySeed: weekSeedOf(date),
    monthlySeed: monthSeedOf(date),
    seasonId: getSeasonForDate(date).id,
  }
}

export function shouldRegenerateMissions(previous: SchedulerSnapshot | null, now = new Date()): {
  daily: boolean
  weekly: boolean
  monthly: boolean
} {
  const current = currentSnapshot(now)
  if (!previous) return { daily: true, weekly: true, monthly: true }
  return {
    daily: previous.dailySeed !== current.dailySeed,
    weekly: previous.weeklySeed !== current.weeklySeed,
    monthly: previous.monthlySeed !== current.monthlySeed,
  }
}

export function buildTasks(date = new Date()): SchedulerTask[] {
  const tasks: SchedulerTask[] = []

  const midnight = new Date(date)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  tasks.push({ kind: "daily_reset", at: midnight.toISOString() })

  const nextMonday = new Date(date)
  const dayToMonday = (nextMonday.getDay() + 6) % 7
  nextMonday.setDate(nextMonday.getDate() + (7 - dayToMonday))
  nextMonday.setHours(0, 0, 0, 0)
  tasks.push({ kind: "weekly_reset", at: nextMonday.toISOString() })

  const firstOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  tasks.push({ kind: "monthly_reset", at: firstOfMonth.toISOString() })

  const season = getSeasonForDate(date)
  tasks.push({ kind: "season_tick", at: new Date(season.ends_at).toISOString() })

  return tasks
}

export function tasksDueSince(tasks: SchedulerTask[], since: Date, now = new Date()): SchedulerTask[] {
  return tasks.filter((t) => new Date(t.at) > since && new Date(t.at) <= now)
}

export function runSchedulerTick(lastSnapshot: SchedulerSnapshot | null, onReset: (kind: "daily" | "weekly" | "monthly") => void): void {
  const changes = shouldRegenerateMissions(lastSnapshot)
  if (changes.daily) onReset("daily")
  if (changes.weekly) onReset("weekly")
  if (changes.monthly) onReset("monthly")
}

export { generateAllMissions, getSeasonForDate }
