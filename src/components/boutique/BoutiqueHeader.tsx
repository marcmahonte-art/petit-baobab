"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function BoutiqueHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { openCart, getTotalItems } = useCartStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartItems = getTotalItems();

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Fonctionnalités", href: "/#features" },
    { label: "Boutique", href: "/boutique" },
    { label: "Mes achats", href: "/boutique/mes-achats" },
    { label: "Tarifs", href: "/tarification" },
    { label: "À propos", href: "/#testimonials" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/boutique?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fef5e0]/90 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="h-24 md:h-28 flex items-center justify-center">
            <img
              alt="Petit Baobab Logo"
              className="h-20 md:h-24 w-auto object-contain"
              src="/illustrations/logo-petit-baobab.svg"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/boutique"
                ? pathname === "/boutique" || pathname.startsWith("/boutique/")
                : link.href === "/"
                ? pathname === "/"
                : false;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? "text-[#7D6AF8] font-extrabold"
                    : "text-[#3B2416] hover:text-[#7D6AF8]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions Right */}
        <div className="flex items-center gap-3">
          {/* Search Toggle / Input */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-36 sm:w-48 px-3 py-1.5 text-xs rounded-full border border-[#E5E0D5] bg-white text-[#3B2416] focus:outline-none focus:border-[#7D6AF8]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-[#3B2416]/60 hover:text-[#3B2416]"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-[#3B2416]"
                aria-label="Rechercher un produit"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-[#3B2416]"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="w-4 h-4 text-[#7D6AF8]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5E83] text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Connexion / Inscription (Ouvrent la plateforme créative) */}
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold hover:bg-gray-100 rounded-[8px] transition-colors text-[#3B2416]"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold bg-[#7D6AF8] text-white rounded-[8px] hover:bg-[#6552E8] transition-all shadow-md shadow-[#7D6AF8]/20"
          >
            Créer un compte
          </Link>

          {/* Mobile Menu Hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white cursor-pointer">
                <Menu className="w-5 h-5 text-[#3B2416]" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#FFF9F2] pt-16 w-[290px]">
              <nav className="flex flex-col gap-5 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-[#3B2416] hover:text-[#7D6AF8] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full border border-gray-300 text-center text-xs font-semibold text-[#3B2416]"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full bg-[#7D6AF8] text-white text-center text-xs font-semibold shadow-md"
                >
                  Créer un compte
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
