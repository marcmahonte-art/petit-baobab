"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  UserPlus,
  Palette,
  TrendingUp,
  BookOpen,
  Star,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/school/dashboard", label: "Tableau de bord", icon: Home, isMain: true },
  { href: "/school/classes", label: "Mes classes", icon: Users },
  { href: "/school/students", label: "Mes élèves", icon: UserPlus },
  { href: "/school/activities", label: "Activités", icon: Palette },
  { href: "/school/progression", label: "Progression", icon: TrendingUp },
  { href: "/school/livres", label: "Livres", icon: BookOpen },
  { href: "/school/etoiles", label: "Étoiles", icon: Star },
  { href: "/school/messages", label: "Messages", icon: MessageSquare },
  { href: "/school/parametres", label: "Paramètres", icon: Settings },
];

export default function SchoolSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <Image
          src="/illustrations/logo-petit-baobab.webp"
          alt="Petit Baobab"
          width={150}
          height={45}
          className="w-auto h-[40px] object-contain"
        />
      </div>

      {/* Navigation items */}
      <ul className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

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

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                  ${
                    isActive
                      ? "bg-[#7D6AF8]/10 text-[#7D6AF8] font-bold"
                      : "text-[#7A6A5E] hover:bg-[#F5F0EB] font-medium"
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
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-all w-full font-medium cursor-pointer">
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
