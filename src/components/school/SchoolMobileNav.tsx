"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X, Home, Users, UserPlus, Palette, TrendingUp, Star, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/school/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/school/classes",   label: "Mes classes",      icon: Users },
  { href: "/school/students",  label: "Mes élèves",       icon: UserPlus },
  { href: "/school/activities", label: "Activités",        icon: Palette },
  { href: "/school/progression",label: "Progression",     icon: TrendingUp },
  { href: "/school/etoiles",   label: "Étoiles",          icon: Star },
  { href: "/school/parametres",label: "Paramètres",       icon: Settings },
];

export default function SchoolMobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    router.push("/login?space=school");
  };

  return (
    <div className="md:hidden sticky top-0 z-50 bg-white border-b border-[#F0E7DA]">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/school/dashboard">
          <Image src="/illustrations/logo-petit-baobab.webp" alt="Petit Baobab" width={120} height={36}
                 className="w-auto h-[32px] object-contain" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#F0E7DA] bg-white cursor-pointer"
          aria-label="Menu de navigation"
        >
          {isOpen ? <X className="w-5 h-5 text-[#3B2416]" /> : <Menu className="w-5 h-5 text-[#3B2416]" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-14 z-40 flex">
          <div className="w-[280px] bg-[#FFFDF7] h-full flex flex-col shadow-xl border-r border-[#F0E7DA]">
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-[#7D6AF8]/10 text-[#7D6AF8] font-bold"
                        : "text-[#7A6A5E] hover:bg-[#F5F0EB] font-medium"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pb-6 border-t border-[#F0E7DA] pt-4">
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-all w-full font-medium cursor-pointer"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
