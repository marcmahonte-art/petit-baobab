"use client"

import { useMemo } from "react"
import { useWorldStore } from "../store/world-store"

export interface TimelineGroup {
  label: string
  entries: { id: string; event: string; label: string; icon: string; createdAt: string }[]
}

export function useWorldTimeline() {
  const history = useWorldStore((s) => s.history)

  return useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const map = (entry: TimelineGroup["entries"][number]): TimelineGroup["entries"][number] => entry

    const groups: TimelineGroup[] = [
      { label: "Aujourd'hui", entries: [] },
      { label: "Hier", entries: [] },
      { label: "Cette semaine", entries: [] },
      { label: "Ce mois", entries: [] },
      { label: "Depuis le début", entries: [] },
    ]

    for (const entry of history) {
      const date = new Date(entry.created_at)
      const meta = entry.metadata as Record<string, unknown>
      const item = {
        id: entry.id,
        event: entry.event,
        label: String(meta.label ?? entry.event),
        icon: String(meta.icon ?? "📌"),
        createdAt: entry.created_at,
      }

      if (date >= today) groups[0].entries.push(map(item))
      else if (date >= yesterday) groups[1].entries.push(map(item))
      else if (date >= weekStart) groups[2].entries.push(map(item))
      else if (date >= monthStart) groups[3].entries.push(map(item))
      else groups[4].entries.push(map(item))
    }

    return groups
  }, [history])
}
