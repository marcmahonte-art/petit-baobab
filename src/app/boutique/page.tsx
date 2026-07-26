"use client";

import { useState } from "react";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Hero } from "@/components/boutique/Hero";
import { CategoryCard } from "@/components/boutique/CategoryCard";
import { ProductCard } from "@/components/boutique/ProductCard";
import { FeaturedProducts } from "@/components/boutique/FeaturedProducts";
import { TrustSection } from "@/components/boutique/TrustSection";
import { Newsletter } from "@/components/boutique/Newsletter";
import { Footer } from "@/components/boutique/Footer";
import { MiniCart } from "@/components/boutique/MiniCart";
import { CATEGORIES } from "@/lib/mock/categories";
import { PRODUCTS } from "@/lib/mock/products";
import { FEATURED_PRODUCTS } from "@/lib/mock/featured";
import { CategorySlug } from "@/lib/mock/types";

export default function BoutiquePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | "all">("all");

  const filteredProducts =
    selectedCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <Hero />

        {/* Categories Section */}
        <section className="my-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#3B2416]">
                Parcourir les catégories
              </h2>
              <p className="text-xs md:text-sm text-[#3B2416]/70 mt-1">
                Sélectionnez une catégorie pour filtrer nos produits créatifs.
              </p>
            </div>
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-xs font-bold text-[#7D6AF8] hover:underline"
              >
                Voir tout ({PRODUCTS.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={selectedCategory === cat.slug}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.slug ? "all" : cat.slug
                  )
                }
              />
            ))}
          </div>
        </section>

        {/* Products Grid Section */}
        <section id="produits" className="my-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-[#3B2416]">
              {selectedCategory === "all"
                ? "Tous nos livres & articles"
                : CATEGORIES.find((c) => c.slug === selectedCategory)?.title}
            </h2>
            <span className="text-xs font-bold text-[#3B2416]/60">
              {filteredProducts.length} produit(s) disponible(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section id="nouveautes">
          <FeaturedProducts products={FEATURED_PRODUCTS} />
        </section>

        {/* Reassurance Section */}
        <TrustSection />

        {/* Newsletter Section */}
        <Newsletter />
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
