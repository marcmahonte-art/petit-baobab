import type { CalendarDay, RewardChest } from "../types"
import { CHESTS } from "../constants"
import { buildCalendarMonth, dayOfYear } from "../calendar/calendar-engine"

type Supabase = ReturnType<typeof import("@/lib/supabase-client").getSupabaseClient>

export interface CalendarState {
  claimedDays: number[]
  chests: RewardChest[]
  currentDay: number
  lastClaimAt: string | null
}

export function getCurrentCalendarDay(): number {
  return dayOfYear(new Date())
}

export async function loadCalendarState(supabase: Supabase, childId: string): Promise<CalendarState> {
  const today = getCurrentCalendarDay()

  const { data: chestRows } = await supabase
    .from("calendar_chests")
    .select("*")
    .eq("child_id", childId)
    .gte("day", 1)
    .lte("day", today)

  const chests = (chestRows ?? []).map((row) => ({
    id: row.id,
    child_id: childId,
    chest_id: row.chest_id as RewardChest["chest_id"],
    day: row.day,
    claimed: row.claimed,
    claimed_at: row.claimed_at,
  }))

  const claimedDays = chests.filter((c) => c.claimed).map((c) => c.day)

  return { claimedDays, chests, currentDay: today, lastClaimAt: chests.length > 0 ? (chests[chests.length - 1].claimed_at ?? null) : null }
}

export async function claimCalendarDay(supabase: Supabase, childId: string, day: number): Promise<CalendarDay | null> {
  const today = getCurrentCalendarDay()
  if (day < 1 || day > today) return null

  const chest = CHESTS.find((c) => c.day === day)
  const calendar = buildCalendarMonth(childId, [], today)
  const calendarDay = calendar[day - 1]
  if (!calendarDay || calendarDay.status === "claimed") return null

  const chestId = chest ? chest.id : "none"
  await supabase.from("calendar_chests").insert({
    child_id: childId,
    chest_id: chestId,
    day,
    claimed: true,
    claimed_at: new Date().toISOString(),
  })

  return { ...calendarDay, status: "claimed" }
}

export function getChestForDay(day: number) {
  return CHESTS.find((c) => c.day === day) ?? null
}
