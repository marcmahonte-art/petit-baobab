import { Suspense } from "react";
import Link from "next/link";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { MiniCart } from "@/components/boutique/MiniCart";
import { XCircle, RefreshCcw, ShoppingBag } from "lucide-react";

// Page d'échec / annulation de paiement (cancel_url PayDunya).
export default function PaiementEchouePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex items-center justify-center">
        <Suspense fallback={null}>
          <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-8 md:p-10 max-w-lg mx-auto text-center space-y-5 shadow-sm">
            <XCircle className="w-16 h-16 text-[#FF5E83] mx-auto" />
            <div>
              <h1 className="text-2xl font-extrabold text-[#3B2416]">
                Paiement annulé
              </h1>
              <p className="text-sm text-[#3B2416]/70 mt-2">
                Votre paiement n'a pas abouti. Aucun montant n'a été débité.
                Votre panier est peut-être encore disponible — vous pouvez
                réessayer à tout moment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/boutique/panier"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-extrabold text-sm rounded-full transition-all shadow-md shadow-[#7D6AF8]/20"
              >
                <RefreshCcw className="w-4 h-4" />
                Réessayer
              </Link>
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E5E0D5] hover:bg-[#FFF9F2] text-[#3B2416] font-bold text-sm rounded-full transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Retour au panier / boutique
              </Link>
            </div>

            <p className="text-[11px] text-[#3B2416]/50">
              Un problème persiste ? Contactez notre support — nous sommes là pour vous aider.
            </p>
          </div>
        </Suspense>
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
