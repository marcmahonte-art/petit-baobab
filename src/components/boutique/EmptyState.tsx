import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Votre panier est vide",
  description = "Découvrez nos magnifiques livres de coloriage, t-shirts et stickers pour enfants !",
  actionText = "Explorer la boutique",
  actionHref = "/boutique",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-[20px] border border-[#E5E0D5] shadow-sm max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center mb-4">
        {icon || <ShoppingBag className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-[#3B2416] mb-2">{title}</h3>
      <p className="text-sm text-[#3B2416]/70 mb-6 leading-relaxed">
        {description}
      </p>
      <Link
        href={actionHref}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-md shadow-[#7D6AF8]/20"
      >
        <ArrowLeft className="w-4 h-4" />
        {actionText}
      </Link>
    </div>
  );
}
