import type { XpMultiplier } from "../types"
import type { GameEventType } from "../../gamification/types"
import { DEFAULT_MULTIPLIERS } from "../constants"

export interface ActiveMultipliers {
  xp: number
  stars: number
  eventMultipliers: XpMultiplier[]
}

const HOLIDAYS_FR = [
  "01-01",
  "03-21",
  "04-04",
  "05-01",
  "05-08",
  "07-14",
  "08-15",
  "11-01",
  "11-11",
  "12-25",
]

function isWeekend(date = new Date()): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isHoliday(date = new Date()): boolean {
  const key = `${date.getMonth() + 1}-${date.getDate()}`
  return HOLIDAYS_FR.includes(key)
}

function buildMultiplier(
  base: XpMultiplier,
  startsAt: string,
  endsAt: string,
  multiplier: number,
): XpMultiplier {
  return { ...base, multiplier, starts_at: startsAt, ends_at: endsAt }
}

export function getActiveMultipliers(date = new Date()): ActiveMultipliers {
  const active: XpMultiplier[] = []
  let xp = 1
  let stars = 1

  const weekend = DEFAULT_MULTIPLIERS.find((m) => m.id === "weekend")
  if (weekend && isWeekend(date)) {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    active.push(buildMultiplier(weekend, start.toISOString(), end.toISOString(), weekend.multiplier))
    if (weekend.xpOnly) xp *= weekend.multiplier
    else if (!weekend.starsOnly) {
      xp *= weekend.multiplier
      stars *= weekend.multiplier
    }
  }

  const holidays = DEFAULT_MULTIPLIERS.find((m) => m.id === "vacances")
  if (holidays && isHoliday(date)) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    active.push(buildMultiplier(holidays, start.toISOString(), end.toISOString(), holidays.multiplier))
    if (holidays.starsOnly) stars *= holidays.multiplier
  }

  const eventBooks = DEFAULT_MULTIPLIERS.find((m) => m.id === "event_livres")
  if (eventBooks && isEventLivresActive(date)) {
    const start = new Date(date.getFullYear(), 10, 20)
    const end = new Date(date.getFullYear(), 10, 27, 23, 59, 59)
    active.push(buildMultiplier(eventBooks, start.toISOString(), end.toISOString(), eventBooks.multiplier))
  }

  return { xp, stars, eventMultipliers: active }
}

function isEventLivresActive(date = new Date()): boolean {
  const m = date.getMonth()
  const d = date.getDate()
  return (m === 10 && d >= 20) || (m === 10 && d <= 27)
}

export function applyMultiplier(event: GameEventType, xp: number, stars: number, date = new Date()): { xp: number; stars: number } {
  const { xp: xpMult, stars: starsMult, eventMultipliers } = getActiveMultipliers(date)
  const bookEvent = eventMultipliers.find((m) => m.id === "event_livres")
  const isBook = event === "BOOK_CREATED" || event === "BOOK_PRINTED"

  return {
    xp: Math.round(xp * xpMult),
    stars: Math.round(stars * starsMult * (bookEvent && isBook ? bookEvent.multiplier : 1)),
  }
}
