"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-provider";
import { PricingPageContent } from "@/components/pricing-page-content";
import { Sparkles } from "lucide-react";

export default function TarificationPage() {
  const router = useRouter();
  const { lang, setLanguage } = useI18n();
  const { user, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleCTA = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  };

  const handleLogin = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="bg-[#fef5e0] font-sans text-[#1F2937] antialiased overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fef5e0]/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
            <div className="h-[90px] md:h-[140px] flex items-center justify-center">
              <img
                alt="Logo"
                className="h-[90px] md:h-[140px] w-auto object-contain"
                src="/illustrations/logo-petit-baobab.svg"
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a className="hover:text-[#6D4CFF] transition-colors" href="/">Accueil</a>
            <a className="text-[#6D4CFF] transition-colors" href="/tarification">Tarifs</a>
            <a className="hover:text-[#6D4CFF] transition-colors" href="/#testimonials">À propos</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold hover:bg-gray-100 rounded-[8px] transition-colors cursor-pointer"
            >
              Se connecter
            </button>
            <button
              onClick={handleCTA}
              className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold bg-[#6D4CFF] text-white rounded-[8px] hover:bg-[#6D4CFF]/90 transition-all shadow-md shadow-[#6D4CFF]/20 cursor-pointer"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </header>

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

      {/* Footer simple */}
      <footer className="border-t border-gray-100 bg-[#fef5e0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Petit Baobab — Le coloriage qui éveille la créativité.</span>
          <div className="flex items-center gap-6 font-semibold">
            <a className="hover:text-[#6D4CFF] transition-colors" href="/">Accueil</a>
            <a className="hover:text-[#6D4CFF] transition-colors" href="/tarification">Tarifs</a>
            <a className="hover:text-[#6D4CFF] transition-colors" href="/signup">S'inscrire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
