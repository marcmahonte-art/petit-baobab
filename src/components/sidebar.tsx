"use client"

import { Home, Users, Star, CreditCard } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { commonNavItems, settingsNavItem } from "@/components/child-dashboard";
import { isSuperAdminClient } from "@/lib/admin/client-guard";
import { ShieldCheck } from "lucide-react";
import { useLearnSession } from "@/app/learn/_components/learn-session"

const navItemsBase = [
  { icon: Home, label: "Accueil", href: "/learn/dashboard" },
  ...commonNavItems,
  { icon: Users, label: "Espace parents", href: "/parents" },
  { icon: CreditCard, label: "Facturation", href: "/parents/billing" },
  // settingsNavItem est ajouté dynamiquement plus bas (href dépend du rôle)
]

interface SidebarProps {
  compact?: boolean
  className?: string
}

export function Sidebar({ compact = false, className }: SidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  // Source de vérité = cookie sb-student-token résolu côté serveur (learn/layout).
  // Hors de /learn (ex: /parents), role = "unknown" → on garde le menu complet
  // (espace parent). Sous /learn avec un élève, role = "student" → on masque
  // les liens réservés au parent. Jamais déterminé par un état Zustand volatile.
  const { role } = useLearnSession()
  const isStudent = role === "student"

  // Lien Paramètres : en espace apprenant → /learn/parametres (sous learn/layout,
  // donc sidebar élève). Hors espace apprenant (parent/école) → /parametres.
  const settingsItem = { ...settingsNavItem, href: isStudent ? "/learn/parametres" : "/parametres" }

  const navItems = isStudent
    ? navItemsBase
        .filter((i) => i.label !== "Espace parents" && i.label !== "Facturation")
        .concat(settingsItem)
    : navItemsBase.concat(settingsItem)

  if (compact) {
    return (
      <aside
        className={cn(
          "w-full relative flex flex-col h-full justify-between shrink-0 select-none pb-1",
          className
        )}
      >
        <div>
          {/* Logo Section → compact: 105px on desktop, icon only on tablet */}
          <Link
            href="/learn/dashboard"
            className="h-[52px] xl:h-[56px] flex items-center justify-center xl:justify-start px-1"
          >
            <Image
              src="/illustrations/logo-petit-baobab.webp"
              alt="Petit Baobab"
              width={110}
              height={38}
              className="w-auto h-[32px] xl:h-[36px] object-contain hidden xl:block"
              priority
            />
            {/* Tablet icon-only logo */}
            <Image
              src="/illustrations/Baobab.webp"
              alt="Petit Baobab"
              width={34}
              height={34}
              className="w-8 h-8 object-contain xl:hidden"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 mt-1.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/" && pathname === null) ||
                (item.label === "Histoires" &&
                  (pathname === "/histoires" || pathname?.startsWith("/learn/histoires")))
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "nav-item flex items-center h-[36px] xl:h-[38px] px-2.5 xl:px-3 rounded-[12px] cursor-pointer transition-colors justify-center xl:justify-start gap-2.5",
                    isActive
                      ? "active bg-[#E8F4EA] text-[#1D9E75] font-extrabold"
                      : "text-[#5A4535] hover:bg-[#F5EDE1]/60"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-[16px] h-[16px] shrink-0",
                      isActive ? "text-[#1D9E75]" : "text-[#7A6A5E]"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[13px] font-bold truncate hidden xl:inline",
                      isActive ? "text-[#1D9E75]" : "text-[#5A4535]"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Compact Premium Card (≈ 185 × 125px on desktop, mini button on tablet) */}
        <div className="mt-2 shrink-0">
          {/* Desktop Compact Card */}
          <div className="hidden xl:block relative w-[185px] h-[125px] rounded-[18px] bg-gradient-to-b from-[#E7F67B] to-[#C9EE45] p-3 overflow-hidden shadow-2xs">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-1 text-[#3B2416] mb-0.5">
                  <Star className="w-3.5 h-3.5 fill-current text-[#3B2416]" />
                  <h3 className="font-extrabold text-[12px] leading-tight">Passez Premium</h3>
                </div>
                <p className="text-[#3B2416]/80 text-[10px] font-medium max-w-[105px] leading-[1.2]">
                  Accédez à toutes les fonctionnalités illimitées.
                </p>
              </div>
              <Link href="/parents">
                <Button
                  variant="premium"
                  className="w-[92px] h-[26px] rounded-full text-[10px] font-bold bg-white text-[#3B2416] hover:bg-white/90 border-none shadow-xs px-2 cursor-pointer"
                >
                  Découvrir &gt;
                </Button>
              </Link>
            </div>
            <div className="absolute right-[-8px] bottom-[-4px] w-[88px] h-[92px] z-0 pointer-events-none">
              <Image
                src="/illustrations/premium-boy.webp"
                alt="Premium"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Tablet Mini Premium Star */}
          <Link
            href="/parents"
            title="Passez Premium"
            className="xl:hidden flex items-center justify-center w-10 h-10 mx-auto rounded-xl bg-gradient-to-b from-[#E7F67B] to-[#C9EE45] text-[#3B2416] shadow-xs hover:scale-105 transition-transform"
          >
            <Star className="w-5 h-5 fill-current" />
          </Link>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-full relative flex flex-col h-full min-h-[calc(100vh-48px)] justify-between shrink-0 select-none pb-2">
      <div>
        {/* Logo Section → lien vers dashboard */}
        <Link href="/learn/dashboard" className="h-[72px] md:h-[96px] flex items-center px-1">
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
            const isActive =
              pathname === item.href ||
              (item.href === "/" && pathname === null) ||
              (item.label === "Histoires" && (pathname === "/histoires" || pathname?.startsWith("/learn/histoires")))
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
          <Link href="/parents">
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

      {/* Bouton Super Admin — visible UNIQUEMENT si le compte connecté
          est un Super Admin (email dans NEXT_PUBLIC_SUPER_ADMIN_EMAILS).
          Redirige vers le back-office /dashboard. */}
      {isSuperAdminClient() && (
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] bg-[#7D6AF8] text-white text-sm font-extrabold shadow-md hover:bg-[#6552E8] transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          Super Admin
        </button>
      )}
    </aside>
  )
}
