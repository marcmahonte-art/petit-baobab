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
    <div
      className="flex min-h-screen flex-col bg-[#fef5e0] font-sans text-[#1F2937] antialiased overflow-x-hidden"
    >
      <ShopHeader />
      <main
        className="flex-1"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
          paddingTop: 32,
          paddingBottom: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <ShopHero />
          <ShopCategories />
          <ShopPopularProducts />
          <ShopReassurance />
        </div>
      </main>
      <ShopFooter />
    </div>
  );
}
