"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Users, GraduationCap, School, ShieldCheck, ShoppingBag,
  Package, FolderTree, Receipt, Download, Palette, BookOpen, BookText,
 Activity, Star, Coins, History, TrendingDown,
  CreditCard, Wallet, Smartphone, Building2, Brain, Sparkles, ListChecks,
  Server, BarChart3, LineChart, Users2, Building, ShoppingCart, Flame,
  Headphones, Ticket, MessageSquare, Flag, Settings, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavChild { label: string; href: string; }
interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavChild[];
}

const NAV: NavGroup[] = [
  {
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Utilisateurs",
    icon: Users,
    children: [
      { label: "Familles", href: "/dashboard/users?type=family" },
      { label: "Écoles", href: "/dashboard/schools" },
      { label: "Enseignants", href: "/dashboard/users?type=teacher" },
      { label: "Administrateurs", href: "/dashboard/users?type=admin" },
    ],
  },
  {
    label: "Boutique",
    icon: ShoppingBag,
    children: [
      { label: "Produits", href: "/dashboard/boutique/products" },
      { label: "Catégories", href: "/dashboard/boutique/categories" },
      { label: "Commandes", href: "/dashboard/boutique/orders" },
      { label: "Téléchargements", href: "/dashboard/boutique/downloads" },
    ],
  },
  {
    label: "Contenus",
    icon: Palette,
    children: [
      { label: "Coloriages", href: "/dashboard/content/coloriages" },
      { label: "Livres", href: "/dashboard/content/livres" },
      { label: "Histoires", href: "/dashboard/content/histoires" },
      { label: "Jeux", href: "/dashboard/content/jeux" },
      { label: "Activités", href: "/dashboard/content/activites" },
    ],
  },
  {
    label: "Étoiles",
    icon: Star,
    children: [
      { label: "Soldes", href: "/dashboard/stars" },
      { label: "Historique", href: "/dashboard/stars/history" },
      { label: "Consommation", href: "/dashboard/stars/consumption" },
      { label: "Packs", href: "/dashboard/stars/packs" },
    ],
  },
  {
    label: "Paiements",
    icon: CreditCard,
    children: [
      { label: "Transactions", href: "/dashboard/payments/transactions" },
      { label: "Abonnements", href: "/dashboard/payments/subscriptions" },
      { label: "Orange Money", href: "/dashboard/payments/orange-money" },
      { label: "Moov Money", href: "/dashboard/payments/moov-money" },
      { label: "PayDunya", href: "/dashboard/payments/paydunya" },
    ],
  },
  {
    label: "IA",
    icon: Brain,
    children: [
      { label: "Générations", href: "/dashboard/ai/generations" },
      { label: "Files d'attente", href: "/dashboard/ai/queue" },
      { label: "Consommation API", href: "/dashboard/ai/usage" },
      { label: "OpenAI", href: "/dashboard/ai/openai" },
      { label: "Gemini", href: "/dashboard/ai/gemini" },
      { label: "Mistral", href: "/dashboard/ai/mistral" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "KPI", href: "/dashboard/analytics" },
      { label: "Revenus", href: "/dashboard/analytics/revenus" },
      { label: "Utilisateurs", href: "/dashboard/analytics/users" },
      { label: "Écoles", href: "/dashboard/analytics/schools" },
      { label: "Boutique", href: "/dashboard/analytics/boutique" },
      { label: "Engagement", href: "/dashboard/analytics/engagement" },
    ],
  },
  {
    label: "Support",
    icon: Headphones,
    children: [
      { label: "Tickets", href: "/dashboard/support/tickets" },
      { label: "Messages", href: "/dashboard/support/messages" },
      { label: "Signalements", href: "/dashboard/support/reports" },
    ],
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 hidden lg:flex flex-col bg-white border-r border-[#F1ECE5] overflow-y-auto">
      <Link href="/dashboard" className="h-16 flex items-center px-5 border-b border-[#F1ECE5] gap-2">
        <Image
          src="/illustrations/logo-petit-baobab.webp"
          alt="Petit Baobab"
          width={120}
          height={36}
          className="w-auto h-[32px] object-contain"
        />
        <span className="text-[10px] uppercase tracking-wide font-bold text-white bg-[#7D6AF8] rounded-full px-2 py-0.5">
          Admin
        </span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((group) => {
          const Icon = group.icon;
          const active =
            group.href === "/dashboard"
              ? pathname === "/dashboard"
              : group.href
              ? pathname === group.href
              : group.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

          if (group.children) {
            return (
              <details key={group.label} open={active} className="group">
                <summary className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm font-semibold transition-colors",
                  active ? "bg-[#7D6AF8]/10 text-[#7D6AF8]" : "text-[#3B2416] hover:bg-[#FFF9F2]"
                )}>
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {group.label}
                  </span>
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-3 mt-1 space-y-0.5 border-l border-[#F1ECE5] pl-3">
                  {group.children.map((c) => {
                    const cActive = pathname === c.href;
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={cn(
                          "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                          cActive
                            ? "bg-[#7D6AF8] text-white font-semibold"
                            : "text-[#3B2416]/70 hover:bg-[#FFF9F2] hover:text-[#7D6AF8]"
                        )}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          }

          return (
            <Link
              key={group.href}
              href={group.href!}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
                active ? "bg-[#7D6AF8]/10 text-[#7D6AF8]" : "text-[#3B2416] hover:bg-[#FFF9F2]"
              )}
            >
              <Icon className="w-4 h-4" />
              {group.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#F1ECE5]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#3B2416]/60 hover:bg-[#FFF9F2]"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}
