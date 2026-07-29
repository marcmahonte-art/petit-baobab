import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E0D5] mt-16 pt-12 pb-8 text-[#3B2416]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-20 flex items-center">
              <img
                alt="Logo"
                className="h-[72px] w-auto object-contain"
                src="/illustrations/logo-petit-baobab.svg"
              />
            </div>
          </Link>
          <p className="text-xs text-[#3B2416]/70 leading-relaxed">
            L'univers créatif qui fait grandir les enfants. Des livres éducatifs, des coloriages et des vêtements uniques.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-[#3B2416] uppercase tracking-wider mb-3">
            Boutique
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-[#3B2416]/70">
            <li>
              <Link href="/boutique" className="hover:text-[#7D6AF8] transition-colors">
                Tous les produits
              </Link>
            </li>
            <li>
              <Link href="/boutique?category=livres-coloriage" className="hover:text-[#7D6AF8] transition-colors">
                Livres de coloriage
              </Link>
            </li>
            <li>
              <Link href="/boutique?category=color-by-number" className="hover:text-[#7D6AF8] transition-colors">
                Color by Number
              </Link>
            </li>
            <li>
              <Link href="/boutique?category=t-shirts" className="hover:text-[#7D6AF8] transition-colors">
                T-shirts
              </Link>
            </li>
            <li>
              <Link href="/boutique?category=stickers" className="hover:text-[#7D6AF8] transition-colors">
                Stickers
              </Link>
            </li>
          </ul>
        </div>

        {/* Informatiom & Support */}
        <div>
          <h4 className="text-sm font-bold text-[#3B2416] uppercase tracking-wider mb-3">
            Informations
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-[#3B2416]/70">
            <li>
              <Link href="/tarification" className="hover:text-[#7D6AF8] transition-colors">
                Tarifs & Formules
              </Link>
            </li>
            <li>
              <Link href="/#testimonials" className="hover:text-[#7D6AF8] transition-colors">
                À propos de nous
              </Link>
            </li>
            <li>
              <Link href="/boutique/panier" className="hover:text-[#7D6AF8] transition-colors">
                Mon Panier
              </Link>
            </li>
            <li>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:text-[#7D6AF8] transition-colors">
                Support WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Payments Accepted */}
        <div>
          <h4 className="text-sm font-bold text-[#3B2416] uppercase tracking-wider mb-3">
            Moyens de paiement
          </h4>
          <p className="text-xs text-[#3B2416]/70 leading-relaxed mb-3">
            Paiements 100% sécurisés adaptés à l'Afrique de l'Ouest et l'international.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-extrabold text-[#3B2416]">
            <span className="px-2.5 py-1 bg-[#FFF9F2] rounded-md border border-[#E5E0D5]">Orange Money</span>
            <span className="px-2.5 py-1 bg-[#FFF9F2] rounded-md border border-[#E5E0D5]">Moov Money</span>
            <span className="px-2.5 py-1 bg-[#FFF9F2] rounded-md border border-[#E5E0D5]">Carte bancaire</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 border-t border-[#E5E0D5]/60 text-center text-xs text-[#3B2416]/60 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} Petit Baobab. Tous droits réservés.</p>
        <p>Conçu pour l'épanouissement créatif des enfants.</p>
      </div>
    </footer>
  );
}
