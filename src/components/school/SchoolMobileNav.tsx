"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Home, Users, UserPlus, Palette, TrendingUp, Star, Settings, LogOut } from "lucide-react";

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
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    router.push("/login");
  };

  return (
    <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#F0E7DA]">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/school/dashboard">
          <Image src="/illustrations/logo-petit-baobab.webp" alt="Petit Baobab" width={120} height={36}
                 className="w-auto h-[32px] object-contain" />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#F0E7DA] bg-white cursor-pointer">
              <Menu className="w-5 h-5 text-[#3B2416]" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#FFFDF7] p-0 w-[280px]">
            <div className="flex flex-col h-full">
              <div className="px-5 pt-6 pb-4 border-b border-[#F0E7DA]">
                <Image src="/illustrations/logo-petit-baobab.webp" alt="Petit Baobab" width={150} height={45}
                       className="w-auto h-[36px] object-contain" />
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <SheetClose key={item.href} asChild>
                      <Link href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                          isActive
                            ? "bg-[#7D6AF8]/10 text-[#7D6AF8] font-bold"
                            : "text-[#7A6A5E] hover:bg-[#F5F0EB] font-medium"
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    </SheetClose>
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
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
