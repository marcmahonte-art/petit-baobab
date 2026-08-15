import { Header } from "@/components/landing/Header";
import MainFooter from "@/components/landing/MainFooter";
import { PricingPageContent } from "@/components/pricing-page-content";
import { Sparkles } from "lucide-react";

export default function TarificationPage() {
  return (
    <div className="bg-[#fef5e0] font-sans text-[#1F2937] antialiased overflow-x-hidden min-h-screen">
      <Header />

      {/* Contenu tarifs */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-[28px] sm:text-[34px] md:text-[44px] font-extrabold text-[#334155] leading-tight">
            Nos formules
          </h1>
          <p className="text-[15px] md:text-[18px] font-bold text-[#F59E0B] mt-3">
            Des étoiles pour créer sans limites — au prix juste. <Sparkles className="w-5 h-5 inline text-[#F59E0B]" />
          </p>
          <p className="text-[14px] md:text-[16px] text-gray-500 leading-relaxed mt-4 max-w-2xl mx-auto">
            Donnez vie à l'imagination de votre enfant grâce à des coloriages, des livres et des histoires personnalisés.
            <br />
            Que vous soyez un parent souhaitant partager des moments créatifs à la maison ou une école cherchant à enrichir l'apprentissage en classe, Petit Baobab propose une formule adaptée à vos besoins.
          </p>
          <p className="text-[13px] md:text-[15px] font-bold text-[#334155] mt-3">
            Commencez gratuitement — Un paiement simple et sécurisé (Orange Money · Moov Money)
          </p>
        </div>

        <PricingPageContent />
      </main>

      <MainFooter />
    </div>
  );
}
