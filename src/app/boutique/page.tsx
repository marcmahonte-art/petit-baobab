import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { Hero } from "@/components/boutique/Hero";
import { CategoryCard } from "@/components/boutique/CategoryCard";
import { FeaturedProducts } from "@/components/boutique/FeaturedProducts";
import { TrustSection } from "@/components/boutique/TrustSection";
import { MiniCart } from "@/components/boutique/MiniCart";
import { CATEGORIES } from "@/lib/mock/categories";
import { PRODUCTS } from "@/lib/mock/products";

// Page publique de la boutique — 100% statique côté données (mock),
// panier géré via Zustand + LocalStorage (stores/cart-store.ts).
// Aucune authentification, aucun paiement réel (checkout invité prévu).
export default function BoutiquePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Hero />

        {/* Catégories */}
        <section id="categories" className="py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
                Nos catégories
              </h2>
              <p className="text-sm text-[#3B2416]/70 mt-1">
                Explorez nos univers créatifs pour les enfants.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Produits populaires */}
        <section id="produits">
          <FeaturedProducts
            products={PRODUCTS}
            title="Produits populaires"
            subtitle="Les livres et produits préférés des enfants et des parents."
          />
        </section>

        {/* Bandeau de réassurance */}
        <TrustSection />
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
