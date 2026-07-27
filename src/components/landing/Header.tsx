"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { getHomeRedirect } from "@/lib/admin/client-guard";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkSession } = useAuthStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleCTA = () => {
    if (user) {
      router.push(getHomeRedirect());
    } else {
      router.push("/signup");
    }
  };

  const handleLogin = () => {
    if (user) {
      router.push(getHomeRedirect());
    } else {
      router.push("/login");
    }
  };

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Tarifs", href: "/tarification" },
    { label: "Boutique", href: "/boutique" },
    { label: "À propos", href: "/#testimonials" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fef5e0]/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="h-[90px] md:h-[130px] flex items-center justify-center">
            <img
              alt="Logo Petit Baobab"
              className="h-[90px] md:h-[130px] w-auto object-contain"
              src="/illustrations/logo-petit-baobab.svg"
            />
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#")
                ? false
                : pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? "text-[#6D4CFF] font-bold"
                    : "text-[#1F2937] hover:text-[#6D4CFF]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => router.push(getHomeRedirect())}
              className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold bg-[#6D4CFF] text-white rounded-[8px] hover:bg-[#6D4CFF]/90 transition-all shadow-md shadow-[#6D4CFF]/20 cursor-pointer"
            >
              Mon Espace
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold hover:bg-gray-100 rounded-[8px] transition-colors cursor-pointer"
              >
                Se connecter
              </button>
              <button
                onClick={handleCTA}
                className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold bg-[#6D4CFF] text-white rounded-[8px] hover:bg-[#6D4CFF]/90 transition-all shadow-md shadow-[#6D4CFF]/20 cursor-pointer"
              >
                Créer un compte
              </button>
            </>
          )}

          {/* Menu Mobile Hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white cursor-pointer">
                <Menu className="w-5 h-5 text-[#1A1A2E]" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background pt-16 w-[290px]">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : link.href.startsWith("/#")
                      ? false
                      : pathname === link.href;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      className={`text-[15px] font-semibold transition-colors ${
                        isActive
                          ? "text-[#6D4CFF] font-bold"
                          : "text-[#1A1A2E] hover:text-[#6D4CFF]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-3">
                {user ? (
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      router.push(getHomeRedirect());
                    }}
                    className="w-full h-11 rounded-full bg-[#6D4CFF] text-white text-sm font-semibold hover:bg-[#6D4CFF]/90 cursor-pointer"
                  >
                    Mon Espace
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSheetOpen(false);
                        handleLogin();
                      }}
                      className="w-full h-11 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={() => {
                        setSheetOpen(false);
                        handleCTA();
                      }}
                      className="w-full h-11 rounded-full bg-[#6D4CFF] text-white text-sm font-semibold hover:bg-[#6D4CFF]/90 cursor-pointer"
                    >
                      Créer un compte
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Header;
