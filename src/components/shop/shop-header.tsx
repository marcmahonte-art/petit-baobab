"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X } from "lucide-react";

// Header dédié à la boutique PUBLIQUE.
// Indépendant des dashboards (/dashboard, /dashboardstudent, /school/*).
// Les liens "Se connecter" / "S'inscrire" pointent vers la plateforme créative,
// pas vers la boutique (checkout invité prévu plus tard).

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Fonctionnalités", href: "/#fonctionnalites" },
  { label: "Créer", href: "/#creer" },
  { label: "Jeux", href: "/#jeux" },
  { label: "Livres", href: "/#livres" },
  { label: "Boutique", href: "/boutique" },
];

export function ShopHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFDF8]/90 backdrop-blur border-b border-[#F0E7DA]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/boutique" className="flex items-center gap-2 shrink-0">
          <Image
            src="/illustrations/logo-petit-baobab.png"
            alt="Petit Baobab"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-contain"
          />
          <span className="text-[17px] font-extrabold text-[#3B2416]">Petit Baobab</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-item rounded-full px-3 py-1.5 text-[14px] font-bold transition-colors ${
                  active ? "bg-[#FFE08A] text-[#3B2416]" : "text-[#7A6A5E] hover:text-[#3B2416]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Rechercher"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-[#7A6A5E] transition-colors hover:bg-[#FBF3E6] md:flex"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            aria-label="Panier"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#7D6AF8] text-white transition-colors hover:bg-[#6552E8]"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5E83] text-[11px] font-extrabold text-white">
              2
            </span>
          </button>

          <Link
            href="/login"
            className="hidden rounded-full border border-[#F0E7DA] px-4 py-1.5 text-[14px] font-bold text-[#3B2416] transition-colors hover:bg-[#FBF3E6] md:block"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-[#7D6AF8] px-4 py-1.5 text-[14px] font-bold text-white transition-colors hover:bg-[#6552E8] md:block"
          >
            S&apos;inscrire
          </Link>

          {/* Burger mobile */}
          <button
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#3B2416] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Nav mobile */}
      {mobileOpen && (
        <div className="border-t border-[#F0E7DA] bg-[#FFFDF8] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-[14px] font-bold text-[#3B2416] hover:bg-[#FBF3E6]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full border border-[#F0E7DA] px-4 py-2 text-center text-[14px] font-bold text-[#3B2416]"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full bg-[#7D6AF8] px-4 py-2 text-center text-[14px] font-bold text-white"
              >
                S&apos;inscrire
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
