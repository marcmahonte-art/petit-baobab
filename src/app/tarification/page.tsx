import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/landing/Header";
import MainFooter from "@/components/landing/MainFooter";
import { PricingPageContent } from "@/components/pricing-page-content";
import { PricingHowItWorks } from "@/components/pricing/pricing-how-it-works";
import { PricingFaqSection } from "@/components/pricing/pricing-faq-section";
import { Sparkles, ShieldCheck, HeartHandshake, CheckCircle, MessageCircle } from "lucide-react";

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

          {/* Bandeau de réassurance paiement local & WhatsApp */}
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 px-4 sm:px-6 py-2.5 rounded-2xl bg-white/95 border border-[#F0E4D4] shadow-xs text-xs sm:text-sm font-bold text-[#26190B]">
            <span className="text-[#008560] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 fill-[#008560]/20" />
              Commencez gratuitement
            </span>
            <span className="text-[#D0C2B4]">·</span>
            <span className="flex items-center gap-1.5 text-[#5A4838]">
              <ShieldCheck className="w-4 h-4 text-[#4A4EBE]" />
              Paiement sécurisé par
            </span>
            <div className="inline-flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#FFE2BE] shadow-2xs">
                <Image
                  src="/payments/orange-money.png"
                  alt="Orange Money"
                  width={24}
                  height={18}
                  className="h-4 sm:h-4.5 w-auto object-contain"
                />
                <span className="text-[11px] sm:text-xs font-black text-[#D97706]">Orange Money</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F0F8FD] px-2.5 py-1 rounded-lg border border-[#D0E6F8] shadow-2xs">
                <Image
                  src="/payments/moov-money.png"
                  alt="Moov Money"
                  width={24}
                  height={18}
                  className="h-4 sm:h-4.5 w-auto object-contain"
                />
                <span className="text-[11px] sm:text-xs font-black text-[#0C447C]">Moov Money</span>
              </div>
            </div>
            <span className="text-[#D0C2B4] hidden md:inline">·</span>
            <a
              href="https://wa.me/22664556565?text=Bonjour%20Petit%20Baobab%2C%20j%27ai%20une%20question%20sur%20vos%20tarifs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E7F6ED] hover:bg-[#D3EFE0] text-[#00694B] font-extrabold text-xs transition-colors border border-[#C5E8D3] shadow-2xs"
              title="Assistance WhatsApp"
            >
              <Image
                src="/whatsapp.svg"
                alt="Logo WhatsApp"
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
              />
              <span>Assistance WhatsApp</span>
            </a>
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
