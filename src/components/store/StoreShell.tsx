import Link from "next/link";
import { headers } from "next/headers";
import {
  Bell,
  Download,
  Heart,
  HelpCircle,
  Home,
  MessageSquareText,
  Package,
  Settings,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { StoreMotion } from "@/components/store/StoreMotion";

const nav = [
  { href: "/store", label: "Mon espace", icon: Home },
  { href: "/store/orders", label: "Mes achats", icon: Package },
  { href: "/store/downloads", label: "Téléchargements", icon: Download },
  { href: "/store/favorites", label: "Favoris", icon: Heart },
  { href: "/store/reviews", label: "Avis", icon: MessageSquareText },
  { href: "/store/profile", label: "Profil", icon: UserRound },
  { href: "/store/settings", label: "Paramètres", icon: Settings },
];

export async function StoreShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const pathname = (await headers()).get("x-pathname") || "";

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] font-sans">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 md:px-8 md:py-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-6 rounded-[28px] border border-[#F0E7DA] bg-white p-4 shadow-sm">
            <Link href="/boutique" className="mb-5 flex items-center gap-3 rounded-[20px] bg-[#FFF9F2] p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D6AF8] text-lg font-black text-white">PB</span>
              <span>
                <span className="block text-sm font-black">Petit Baobab</span>
                <span className="text-xs font-bold text-[#7A6A5E]">Espace client</span>
              </span>
            </Link>
            <nav className="space-y-1" aria-label="Navigation espace client">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/store" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition ${
                      active ? "bg-[#7D6AF8] text-white shadow-sm" : "text-[#3B2416]/75 hover:bg-[#FFF3DE] hover:text-[#3B2416]"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link href="mailto:support@petitbaobab.com" className="mt-5 flex items-center gap-3 rounded-2xl border border-[#F0E7DA] p-3 text-sm font-bold text-[#3B2416]/75">
              <HelpCircle className="h-4 w-4 text-[#7D6AF8]" />
              Support
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <StoreMotion>
            <header className="mb-6 rounded-[28px] border border-[#F0E7DA] bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7D6AF8]">Boutique Petit Baobab</p>
                  <h1 className="mt-2 text-2xl font-black md:text-4xl">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold text-[#7A6A5E]">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F2] px-4 py-2 text-xs font-black text-[#3B2416]">
                    <Bell className="h-4 w-4 text-[#FFB300]" />
                    Notifications actives
                  </span>
                </div>
              </div>
            </header>
          </StoreMotion>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black shadow-sm">
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
