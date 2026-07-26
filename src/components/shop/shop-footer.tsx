"use client";

import Link from "next/link";
import Image from "next/image";

// Footer dédié à la boutique PUBLIQUE.
// Indépendant des dashboards. Liens vers la plateforme créative séparés de la boutique.

export function ShopFooter() {
  return (
    <footer className="w-full border-t border-[#F0E7DA] bg-[#FFFDF8]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        {/* Marque */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Image
              src="/illustrations/logo-petit-baobab.png"
              alt="Petit Baobab"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-contain"
            />
            <span className="text-[16px] font-extrabold text-[#3B2416]">Petit Baobab</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[#7A6A5E]">
            Des créations uniques pour apprendre, jouer et grandir. Livres de coloriage,
            activités éducatives et accessoires pour enfants.
          </p>
        </div>

        {/* Boutique */}
        <div>
          <h4 className="text-[14px] font-extrabold text-[#3B2416]">Boutique</h4>
          <ul className="mt-3 space-y-2 text-[13px] text-[#7A6A5E]">
            <li><Link href="/boutique" className="hover:text-[#7D6AF8]">Tous les produits</Link></li>
            <li><Link href="/boutique#produits" className="hover:text-[#7D6AF8]">Livres de coloriage</Link></li>
            <li><Link href="/boutique#produits" className="hover:text-[#7D6AF8]">Color by Number</Link></li>
            <li><Link href="/boutique#produits" className="hover:text-[#7D6AF8]">Color by Code</Link></li>
            <li><Link href="/boutique#produits" className="hover:text-[#7D6AF8]">T-shirts</Link></li>
            <li><Link href="/boutique#produits" className="hover:text-[#7D6AF8]">Stickers</Link></li>
          </ul>
        </div>

        {/* Plateforme */}
        <div>
          <h4 className="text-[14px] font-extrabold text-[#3B2416]">La plateforme</h4>
          <ul className="mt-3 space-y-2 text-[13px] text-[#7A6A5E]">
            <li><Link href="/" className="hover:text-[#7D6AF8]">Accueil</Link></li>
            <li><Link href="/tarification" className="hover:text-[#7D6AF8]">Tarifs</Link></li>
            <li><Link href="/login" className="hover:text-[#7D6AF8]">Se connecter</Link></li>
            <li><Link href="/signup" className="hover:text-[#7D6AF8]">S&apos;inscrire</Link></li>
          </ul>
        </div>

        {/* Contact / réseaux */}
        <div>
          <h4 className="text-[14px] font-extrabold text-[#3B2416]">Contact</h4>
          <ul className="mt-3 space-y-2 text-[13px] text-[#7A6A5E]">
            <li><a href="https://web.facebook.com/profile.php?id=61591574387656" target="_blank" rel="noopener noreferrer" className="hover:text-[#7D6AF8]">Facebook</a></li>
            <li><a href="#" className="hover:text-[#7D6AF8]">WhatsApp Business</a></li>
            <li><a href="mailto:contact@petitbaobab.com" className="hover:text-[#7D6AF8]">contact@petitbaobab.com</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#F0E7DA] py-4 text-center text-[12px] text-[#7A6A5E]">
        © {new Date().getFullYear()} Petit Baobab — Tous droits réservés.
      </div>
    </footer>
  );
}
