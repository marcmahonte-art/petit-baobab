"use client"

import { Home, Palette, BookOpen, Gamepad2, Bookmark, Tent, Sparkles, Users, Settings, Star } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: Home, label: "Accueil", href: "/" },
  { icon: Palette, label: "Coloriage", href: "/coloriage" },
  { icon: Sparkles, label: "Dessin magique", href: "/magic-drawing" },
  { icon: BookOpen, label: "Livres de coloriage", href: "/livres-de-coloriage" },
  { icon: Gamepad2, label: "Jeux éducatifs", href: "#" },
  { icon: Bookmark, label: "Histoires", href: "#" },
  { icon: Tent, label: "Activités", href: "#" },
  { icon: Users, label: "Espace parents", href: "/parents" },
  { icon: Settings, label: "Paramètres", href: "#" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[280px] relative flex flex-col h-[calc(100vh-48px)] justify-between shrink-0 select-none pb-2">
      <div>
        {/* Logo Section */}
        <div className="h-[110px] flex items-center px-1">
          <Image
            src="/illustrations/logo-petit-baobab.webp"
            alt="Petit Baobab"
            width={240}
            height={80}
            className="w-auto h-[80px] object-contain"
            style={{ width: "auto", height: "80px" }}
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/" && pathname === null)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "nav-item flex items-center h-[46px] px-4 gap-3 rounded-[18px] cursor-pointer",
                  isActive && "active bg-[#FFE08A]"
                )}
              >
                <item.icon className={cn("w-5.5 h-5.5", isActive ? "text-[#3B2416]" : "text-[#7A6A5E]")} />
                <span
                  className={cn(
                    "text-[15px] font-bold",
                    isActive ? "text-[#3B2416]" : "text-[#7A6A5E]"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Premium Card */}
      <div className="relative w-full h-[200px] rounded-[28px] bg-gradient-to-b from-[#DDF26B] to-[#BCE83E] p-5 overflow-hidden mt-4 shrink-0">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-1.5 text-[#3B2416] mb-1">
              <Star className="w-5 h-5 fill-current" />
              <h3 className="font-extrabold text-lg leading-tight">Passez Premium</h3>
            </div>
            <p className="text-[#3B2416]/80 text-xs font-semibold max-w-[160px] leading-tight">
              Accédez à tout le contenu et fonctionnalités illimitées.
            </p>
          </div>
          <Button variant="premium" className="w-[120px] h-[38px] rounded-full text-xs font-bold bg-white text-[#3B2416] hover:bg-white/90 border-none shadow-sm">
            Découvrir &gt;
          </Button>
        </div>
        <div className="absolute inset-0 z-0">
          <Image
            src="/illustrations/premium-boy.webp"
            alt="Premium"
            fill
            className="object-cover object-bottom"
            priority
          />
        </div>
      </div>
    </aside>
  )
}
