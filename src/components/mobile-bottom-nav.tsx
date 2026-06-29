"use client"

import { Home, Palette, Sparkles, Gamepad2, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Accueil", active: true },
  { icon: Palette, label: "Coloriage" },
  { icon: Sparkles, label: "Magique" },
  { icon: Gamepad2, label: "Jeux" },
  { icon: Bookmark, label: "Histoires" },
]

export function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#F0E7DA] flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <a
          key={item.label}
          href="#"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-[12px] transition-colors",
            item.active ? "text-[#3B2416]" : "text-[#7A6A5E]"
          )}
        >
          <item.icon className={cn("w-5 h-5", item.active && "text-[#3B2416]")} />
          <span className={cn("text-[10px] font-bold", item.active ? "text-[#3B2416]" : "text-[#7A6A5E]")}>
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  )
}
