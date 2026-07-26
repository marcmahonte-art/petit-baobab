import { Product } from "@/lib/mock/types";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-[#E5E0D5]">
      <h2 className="text-2xl font-extrabold text-[#3B2416] mb-6">
        Vous aimerez aussi
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
