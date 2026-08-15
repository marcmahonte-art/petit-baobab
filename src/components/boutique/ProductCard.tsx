"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/mock/types";
import { Price } from "./Price";
import { Rating } from "./Rating";
import { useCartStore } from "@/stores/cart-store";
import { ShoppingCart, Eye, Download, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getCategoryButtonClasses } from "@/lib/boutique/categoryColors";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const categoryButtonClasses = getCategoryButtonClasses(product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);

    toast.success(`"${product.title}" ajouté au panier !`, {
      description: `${product.price.toLocaleString("fr-FR")} ${product.currency}`,
      duration: 3000,
    });

    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col bg-white rounded-[20px] border border-[#E5E0D5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image & Badges */}
      <Link href={`/boutique/${product.slug}`} className="relative w-full aspect-[4/3] bg-[#FFF9F2] overflow-hidden block">
        <Image
          src={product.images[0] || "/illustrations/Collection-livres.webp"}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="px-2.5 py-1 rounded-full bg-[#1D9E75] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              Nouveau
            </span>
          )}
          {product.bestSeller && (
            <span className="px-2.5 py-1 rounded-full bg-[#FFD95C] text-[#3B2416] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              Best-seller
            </span>
          )}
          {product.downloadable && (
            <span className="px-2.5 py-1 rounded-full bg-[#7D6AF8] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
              <Download className="w-3 h-3" />
              PDF
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-[#7D6AF8] uppercase tracking-wider">
            {product.category.replace("-", " ")}
          </span>

          <Link href={`/boutique/${product.slug}`}>
            <h3 className="text-base font-bold text-[#3B2416] group-hover:text-[#7D6AF8] transition-colors line-clamp-2 mt-0.5">
              {product.title}
            </h3>
          </Link>

          <div className="mt-2">
            <Rating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
        </div>

        {/* Price & Actions */}
        <div className="pt-2 border-t border-[#E5E0D5]/50 flex items-center justify-between gap-2">
          <Price amount={product.price} currency={product.currency} size="md" />

          <div className="flex items-center gap-1.5">
            <Link
              href={`/boutique/${product.slug}`}
              className="p-2 rounded-full bg-[#FFF9F2] hover:bg-[#E5E0D5]/50 text-[#3B2416] transition-colors"
              aria-label="Voir le produit"
              title="Voir le produit"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs transition-all duration-200 shadow-sm cursor-pointer ${
                added
                  ? "bg-[#1D9E75] text-white"
                  : `text-white ${categoryButtonClasses}`
              }`}
              aria-label="Acheter le produit"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Acheter</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
