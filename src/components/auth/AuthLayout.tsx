import React from "react";
import Link from "next/link";
import { HeroSection } from "./HeroSection";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n-provider";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen bg-white flex flex-col xl:flex-row relative">
      
      {/* Left Column: Hero branding section (Fixed on desktop, hidden on tablet/mobile) */}
      <div className="hidden xl:block xl:w-[42%] xl:fixed xl:left-0 xl:top-0 xl:bottom-0 h-screen bg-[#FFF9F2] border-r border-gray-100 z-10">
        <HeroSection />
      </div>

      {/* Right Column: Active Card View (scrolls on desktop) */}
      <div className="w-full xl:w-[58%] xl:ml-[42%] min-h-screen flex flex-col justify-between p-6 md:p-12 relative z-20 bg-white">
        
        {/* Top Header of Right Column */}
        <header className="w-full flex items-center justify-between gap-6 mb-12">
          <Link href="/" className="shrink-0">
            <Image
              src="/illustrations/logo-petit-baobab.svg"
              alt="Logo Petit Baobab"
              width={240}
              height={80}
              className="w-auto h-10 md:h-12 lg:h-14 object-contain"
            />
          </Link>

          <div className="flex items-center gap-4 ml-auto shrink-0">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Form content center wrapper */}
        <main className="flex-1 flex items-center justify-center py-6">
          <div className="w-full max-w-[520px]">
            {children}
          </div>
        </main>

        {/* Footer info at the very bottom of form column */}
        <footer className="w-full text-center mt-12 py-4 border-t border-gray-100/50">
          <p className="text-xs text-[#94A3B8] font-semibold">
            © 2025 Petit Baobab. Tous droits réservés.
          </p>
        </footer>

      </div>

    </div>
  );
};
