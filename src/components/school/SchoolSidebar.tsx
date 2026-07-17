"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Star, BarChart2, MessageSquare, Building2, Settings } from 'lucide-react';

const navItems = [
  { href: '/school/dashboard', label: 'Tableau de bord', icon: Home },
  { href: '/school/classes', label: 'Mes classes', icon: Users },
  { href: '/school/etoiles', label: 'Étoiles', icon: Star },
  { href: '/school/stats', label: 'Statistiques', icon: BarChart2 },
  { href: '/school/messages', label: 'Messages', icon: MessageSquare },
  { href: '/school/ecole', label: 'Mon école', icon: Building2 },
  { href: '/school/parametres', label: 'Paramètres', icon: Settings },
];

export default function SchoolSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full p-4 space-y-2">
      {/* Header avec le logo (placeholder) */}
      <div className="flex items-center mb-6">
        <span className="text-xl font-bold text-primary">Petit Baobab</span>
      </div>

      {/* Navigation items */}
      <ul className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors 
                  ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer avec info école et étoiles (placeholders) */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>École Pro</span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>1200</span>
          </span>
        </div>
      </div>
    </nav>
  );
}
