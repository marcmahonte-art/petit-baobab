import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex items-center gap-2 text-xs md:text-sm text-[#3B2416]/70 py-3 overflow-x-auto"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[#7D6AF8] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Accueil</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 shrink-0">
          <ChevronRight className="w-3.5 h-3.5 text-[#3B2416]/40" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#7D6AF8] transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-[#3B2416] text-ellipsis max-w-[200px] truncate">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
