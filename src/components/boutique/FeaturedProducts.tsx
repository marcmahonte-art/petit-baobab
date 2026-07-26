import { Product } from "@/lib/mock/types";
import { ProductCard } from "./ProductCard";
import { Sparkles } from "lucide-react";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function FeaturedProducts({
  products,
  title = "Coups de cœur Petit Baobab",
  subtitle = "Les livres et produits préférés des enfants et des parents.",
}: FeaturedProductsProps) {
  return (
    <section className="py-8 my-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD95C]/20 text-[#3B2416] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Sélection Spéciale</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
            {title}
          </h2>
          <p className="text-sm text-[#3B2416]/70 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
