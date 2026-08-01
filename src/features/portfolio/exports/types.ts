import type { PortfolioEvent, PortfolioStats } from "../types"

export interface SouvenirBookData {
  childName: string
  mascotUrl?: string
  year: number
  accent?: string
  events: PortfolioEvent[]
  stats: PortfolioStats
  certificates: { title: string; date: string }[]
  messages: { message: string; author?: string | null; years: number }[]
  timelineLabel: string
}

export interface ShareItem {
  title: string
  subtitle?: string | null
  image?: string | null
  event?: PortfolioEvent | null
}
