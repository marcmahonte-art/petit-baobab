import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import MainFooter from "@/components/landing/MainFooter";
import { PricingPageContent } from "@/components/pricing-page-content";
import { PricingHowItWorks } from "@/components/pricing/pricing-how-it-works";
import { PricingFaqSection } from "@/components/pricing/pricing-faq-section";
import { Sparkles, ShieldCheck, HeartHandshake, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs et formules | Petit Baobab",
  description:
    "Découvrez les formules Petit Baobab : Découverte, Super Baobab et Espace École. Des étoiles pour créer sans limites au prix juste, avec paiement Orange Money et Moov Money.",
  alternates: { canonical: "/tarification" },
  openGraph: {
    title: "Tarifs et formules | Petit Baobab",
    description:
      "Découvrez les formules Petit Baobab : Découverte, Super Baobab et Espace École. Des étoiles pour créer sans limites au prix juste.",
    url: "/tarification",
  },
};

export default function TarificationPage() {
  return (
    <div className="bg-gradient-to-b from-[#FFF8F4] via-[#FFFDF8] to-[#FFF1E7] font-sans text-[#26190B] antialiased overflow-x-hidden min-h-screen selection:bg-[#FFAE2E]/20">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative">
        {/* Cercles diffus d'ambiance en arrière-plan */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FFAE2E]/10 via-[#4A4EBE]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Hero En-tête */}
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          {/* Badge officiel de confiance */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0E2] border border-[#FFD9B3] text-[#835400] text-xs sm:text-sm font-black uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#FFAE2E]" />
            <span>Formules & Tarifs Officiels</span>
          </div>

          <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-black text-[#26190B] tracking-tight leading-[1.14]">
            Nos formules
          </h1>

          <p className="text-[17px] sm:text-[20px] md:text-[22px] font-black text-[#D97706] mt-3.5 flex items-center justify-center gap-2">
            <span>Des étoiles pour créer sans limites — au prix juste.</span>
            <Sparkles className="w-5 h-5 text-[#FFAE2E] shrink-0" />
          </p>

          <p className="text-[14px] sm:text-[16px] text-[#736355] leading-relaxed mt-4 max-w-2xl mx-auto font-medium">
            Donnez vie à l'imagination de votre enfant grâce à des coloriages, des livres et des histoires personnalisés.
            <br className="hidden sm:inline" />
            {" "}Que vous soyez un parent souhaitant partager des moments créatifs à la maison ou une école cherchant à enrichir l'apprentissage en classe, Petit Baobab propose une formule adaptée à vos besoins.
          </p>

          {/* Bandeau de réassurance paiement local */}
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-2xl bg-white/90 border border-[#F0E4D4] shadow-xs text-xs sm:text-sm font-bold text-[#26190B]">
            <span className="text-[#008560] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 fill-[#008560]/20" />
              Commencez gratuitement
            </span>
            <span className="text-[#D0C2B4]">·</span>
            <span className="flex items-center gap-1.5 text-[#5A4838]">
              <ShieldCheck className="w-4 h-4 text-[#4A4EBE]" />
              Paiement simple et sécurisé (Orange Money · Moov Money)
            </span>
          </div>
        </div>

        {/* Grille des tarifs avec cartes tactiles et illustration */}
        <PricingPageContent />

        {/* Explication : Comment fonctionnent les étoiles + Plan gratuit */}
        <PricingHowItWorks />

        {/* FAQ interactive rétractable */}
        <PricingFaqSection />
      </main>

      <MainFooter />
    </div>
  );
}
