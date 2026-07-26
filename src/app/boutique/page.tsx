import { ShopHeader } from "@/components/shop/shop-header";
import { ShopFooter } from "@/components/shop/shop-footer";
import {
  ShopHero,
  ShopCategories,
  ShopPopularProducts,
  ShopReassurance,
} from "@/components/shop/shop-sections";

// Page publique 100% statique — aucune authentification.
// Indépendante des dashboards (/dashboard, /dashboardstudent, /school/*).
// Le futur parcours d'achat (checkout invité + facture + téléchargement
// par email/WhatsApp) viendra se brancher sur les boutons "Acheter".
export default function BoutiquePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF8]">
      <ShopHeader />
      <main className="flex-1">
        <ShopHero />
        <ShopCategories />
        <ShopPopularProducts />
        <ShopReassurance />
      </main>
      <ShopFooter />
    </div>
  );
}
