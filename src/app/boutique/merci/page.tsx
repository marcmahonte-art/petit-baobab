import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { OrderSuccess } from "@/components/boutique/OrderSuccess";
import { MiniCart } from "@/components/boutique/MiniCart";

export default function MerciPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex items-center justify-center">
        <OrderSuccess />
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
