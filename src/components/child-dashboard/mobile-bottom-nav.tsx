"use client"

import { Home, Palette, Sparkles, Gamepad2, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MobileBottomNavProps {
  /** Lien du bouton "Accueil". Défaut : "/dashboard" */
  homeHref?: string
}

export function MobileBottomNav({ homeHref = "/dashboard" }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Accueil", href: homeHref, active: true },
    { icon: Palette, label: "Coloriage", href: "/coloriage" },
    { icon: Sparkles, label: "Magique", href: "/magic-drawing" },
    { icon: Gamepad2, label: "Jeux", href: "#" },
    { icon: Bookmark, label: "Histoires", href: "#" },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 md:h-16 bg-white border-t border-[#F0E7DA] flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-[12px] transition-colors",
              isActive ? "text-[#3B2416]" : "text-[#7A6A5E]"
            )}
          >
            <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5", isActive && "text-[#3B2416]")} />
            <span className={cn("text-[9px] md:text-[10px] font-bold", isActive ? "text-[#3B2416]" : "text-[#7A6A5E]")}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
