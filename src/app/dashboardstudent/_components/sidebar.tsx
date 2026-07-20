"use client"

import { Home, Star } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { commonNavItems, settingsNavItem } from "@/components/child-dashboard"

const navItems = [
  { icon: Home, label: "Accueil", href: "/dashboardstudent" },
  ...commonNavItems,
  settingsNavItem,
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full relative flex flex-col h-full min-h-[calc(100vh-48px)] justify-between shrink-0 select-none pb-2">
      <div>
        {/* Logo Section → lien vers dashboardstudent */}
        <Link href="/dashboardstudent" className="h-[72px] md:h-[96px] flex items-center px-1">
          <Image
            src="/illustrations/logo-petit-baobab.webp"
            alt="Petit Baobab"
            width={168}
            height={56}
            className="w-auto h-[42px] md:h-[56px] object-contain"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/" && pathname === null)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "nav-item flex items-center h-[40px] md:h-[46px] px-3 md:px-4 gap-2 md:gap-3 rounded-[14px] md:rounded-[18px] cursor-pointer",
                  isActive && "active bg-[#FFE08A]"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5", isActive ? "text-[#3B2416]" : "text-[#7A6A5E]")} />
                <span
                  className={cn(
                    "text-[13px] md:text-[15px] font-bold",
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
      <div className="relative w-full h-[160px] md:h-[200px] rounded-[22px] md:rounded-[28px] bg-gradient-to-b from-[#DDF26B] to-[#BCE83E] p-4 md:p-5 overflow-hidden mt-3 md:mt-4 shrink-0">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-1.5 text-[#3B2416] mb-1">
              <Star className="w-5 h-5 fill-current" />
              <h3 className="font-extrabold text-base md:text-lg leading-tight">Passez Premium</h3>
            </div>
            <p className="text-[#3B2416]/80 text-[11px] md:text-xs font-semibold max-w-[140px] md:max-w-[160px] leading-tight">
              Accédez à tout le contenu et fonctionnalités illimitées.
            </p>
          </div>
          <Link href="/signup?space=family">
            <Button variant="premium" className="w-[110px] md:w-[120px] h-[34px] md:h-[38px] rounded-full text-[11px] md:text-xs font-bold bg-white text-[#3B2416] hover:bg-white/90 border-none shadow-sm cursor-pointer">
              Découvrir &gt;
            </Button>
          </Link>
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
