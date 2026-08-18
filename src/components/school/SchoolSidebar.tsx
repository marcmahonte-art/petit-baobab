"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/auth-store";
import {
  Home,
  Users,
  UserPlus,
  Palette,
  TrendingUp,
  Star,
  Receipt,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/school/dashboard", label: "Tableau de bord", icon: Home, isMain: true, exact: true },
  { href: "/school/classes", label: "Mes classes", icon: Users },
  { href: "/school/students", label: "Mes élèves", icon: UserPlus },
  { href: "/school/activities", label: "Activités", icon: Palette },
  { href: "/school/progression", label: "Progression", icon: TrendingUp },
  { href: "/school/etoiles", label: "Étoiles", icon: Star },
  { href: "/school/dashboard/billing", label: "Facturation", icon: Receipt },
  { href: "/school/parametres", label: "Paramètres", icon: Settings },
  { href: "/school/assistant", label: "✦ Assistant", icon: Sparkles },
];

export default function SchoolSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/login?space=school");
  };

  return (
    <nav className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Logo → lien vers tableau de bord */}
      <Link href="/school/dashboard" className="flex items-center gap-2 px-5 pt-6 pb-4">
        <Image
          src="/illustrations/logo-petit-baobab.webp"
          alt="Petit Baobab"
          width={150}
          height={45}
          className="w-auto h-[40px] object-contain"
        />
      </Link>

      {/* Navigation items */}
      <ul className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          if (item.isMain) {
            return (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                    ${
                      isActive
                        ? "bg-[#FF9500] text-white shadow-md shadow-[#FF9500]/30"
                        : "bg-[#F5F0EB] text-[#7A6A5E] hover:bg-[#FFE8CC] hover:text-[#FF9500]"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          }

          const isAssistant = item.href === "/school/assistant";

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all
                  ${
                    isActive
                      ? isAssistant
                        ? "bg-[#F2E9FF] text-[#3D1CCB] rounded-[14px] font-bold"
                        : "bg-[#7D6AF8]/10 text-[#7D6AF8] rounded-xl font-bold"
                      : "text-[#7A6A5E] hover:bg-[#F5F0EB] rounded-xl font-medium"
                  }
                `}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Déconnexion */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-all w-full font-medium cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Illustration en bas */}
      <div className="px-2 pb-2 pointer-events-none select-none">
        <Image
          src="/illustrations/awa.webp"
          alt="Illustration Petit Baobab"
          width={200}
          height={200}
          className="w-full h-auto object-contain opacity-90"
        />
      </div>
    </nav>
  );
}
