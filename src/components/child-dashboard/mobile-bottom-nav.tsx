"use client"

import { useState } from "react"
import {
  Home,
  Palette,
  Sparkles,
  BookOpen,
  MoreHorizontal,
  Bookmark,
  Tent,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MobileBottomNavProps {
  /** Lien du bouton "Accueil". Défaut : "/learn/dashboard" */
  homeHref?: string
}

export function MobileBottomNav({ homeHref = "/learn/dashboard" }: MobileBottomNavProps) {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  // Onglets principaux toujours visibles (espace apprenant unifié)
  const primaryItems = [
    { icon: Home, label: "Accueil", href: homeHref },
    { icon: Palette, label: "Coloriage", href: "/learn/coloriage" },
    { icon: Sparkles, label: "Magique", href: "/learn/magic-drawing" },
    { icon: BookOpen, label: "Livres", href: "/learn/livres-de-coloriage" },
  ]

  // Onglets secondaires accessibles via le bouton "Plus"
  const moreItems = [
    { icon: Bookmark, label: "Mes livres", href: "/learn/mes-livres" },
    { icon: Tent, label: "Activités", href: "#" },
    { icon: Settings, label: "Paramètres", href: "/learn/parametres" },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== homeHref && pathname.startsWith(href))

  return (
    <>
      {/* Panneau "Plus" au-dessus du bottom nav */}
      {showMore && (
        <div className="lg:hidden fixed bottom-[56px] md:bottom-[64px] left-0 right-0 z-50 px-3">
          <div className="mx-auto max-w-md bg-white rounded-2xl border border-[#F0E7DA] shadow-lg p-2 flex flex-col gap-1">
            {moreItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    active ? "bg-[#FFF9F2] text-[#3B2416]" : "text-[#7A6A5E] hover:bg-[#FFF9F2]"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 md:h-16 bg-white border-t border-[#F0E7DA] flex items-center justify-around px-2 z-50">
        {primaryItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-[12px] transition-colors",
                active ? "text-[#3B2416]" : "text-[#7A6A5E]"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5", active && "text-[#3B2416]")} />
              <span className={cn("text-[9px] md:text-[10px] font-bold", active ? "text-[#3B2416]" : "text-[#7A6A5E]")}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Bouton Plus */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-[12px] transition-colors",
            showMore ? "text-[#3B2416]" : "text-[#7A6A5E]"
          )}
        >
          <MoreHorizontal className="w-[18px] h-[18px] md:w-5 md:h-5" />
          <span className="text-[9px] md:text-[10px] font-bold">Plus</span>
        </button>
      </nav>
    </>
  )
}
