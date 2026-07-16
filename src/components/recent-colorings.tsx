"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pencil, Sparkles } from "lucide-react"
import { drawingService } from "@/features/drawings/DrawingService"
import type { SavedDrawing } from "@/features/drawings/types"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Hier"
  return `Il y a ${days} jours`
}

export function RecentColorings() {
  const [colorings, setColorings] = useState<SavedDrawing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    drawingService
      .list()
      .then((all) => {
        const filtered = all
          .filter((d) => d.origin === "coloriage")
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 4)
        setColorings(filtered)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-[22px] md:rounded-[28px] bg-white p-3 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,.06)]">
      <div className="h-[48px] md:h-[64px] flex items-center justify-between">
        <h3 className="text-sm md:text-xl font-extrabold text-[#3B2416]">Derniers coloriages</h3>
        {colorings.length > 0 && (
          <Link href="/coloriage" className="text-sm font-bold text-[#7A6A5E] hover:text-[#3B2416]">
            Voir tout
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 xs:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[200px] xs:h-[240px] md:h-[280px] rounded-[18px] border border-[#ECECEC] p-2 xs:p-3 flex flex-col bg-white animate-pulse"
            >
              <div className="flex-1 rounded-[12px] bg-[#F0E7DA]" />
              <div className="h-[45px] xs:h-[55px] flex flex-col justify-center gap-1 pt-1 xs:pt-2">
                <div className="h-3 bg-[#F0E7DA] rounded w-3/4" />
                <div className="h-2 bg-[#F0E7DA] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : colorings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF5CC] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#FFB300]" />
          </div>
          <p className="text-sm font-bold text-[#7A6A5E] text-center max-w-xs">
            Aucun coloriage pour le moment
          </p>
          <Link
            href="/coloriage"
            className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-[12px] md:rounded-[14px] bg-[#6D4CFF] text-white font-extrabold text-xs md:text-sm hover:bg-[#5A3DD8] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Commencer un dessin
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 xs:gap-4">
          {colorings.map((c) => (
            <Link
              key={c.id}
              href={`/coloriage?id=${c.id}`}
              className="coloring-item h-[200px] xs:h-[240px] md:h-[280px] rounded-[18px] border border-[#ECECEC] p-2 xs:p-3 flex flex-col bg-white hover:shadow-md transition-shadow"
            >
               <div className="flex-1 min-h-0 rounded-[12px] bg-[#FFF9F2] flex items-center justify-center overflow-hidden relative">
                {c.thumbnail || c.image ? (
                  <img
                    src={c.thumbnail || c.image}
                    alt={c.name}
                    className="w-[80%] h-[80%] object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget
                      el.style.display = "none"
                      el.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                <div className={`${c.thumbnail || c.image ? "hidden" : ""} w-12 h-12 rounded-full bg-[#E8E0F8] flex items-center justify-center`}>
                  <Pencil className="w-6 h-6 text-[#6D4CFF]" />
                </div>
                <div className="absolute bottom-1.5 right-1.5 xs:bottom-2 xs:right-2 w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-[#FFE08A] flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#3B2416]" />
                </div>
              </div>
              <div className="h-[45px] xs:h-[55px] flex flex-col justify-center pt-1 xs:pt-2">
                <span className="text-xs xs:text-sm font-bold text-[#3B2416] leading-tight truncate">
                  {c.name}
                </span>
                <span className="text-[10px] xs:text-xs text-[#7A6A5E] mt-0.5">
                  {timeAgo(c.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
