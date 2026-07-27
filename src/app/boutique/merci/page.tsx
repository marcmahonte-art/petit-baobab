import { Suspense } from "react";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { MiniCart } from "@/components/boutique/MiniCart";
import { OrderConfirmation } from "@/components/boutique/OrderConfirmation";

// Page merci — reflète le statut RÉEL de la commande (Supabase + PayDunya).
export default function MerciPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        <Suspense fallback={null}>
          <OrderConfirmation />
        </Suspense>
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
