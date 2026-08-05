import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F2] to-[#FEF3E2] rounded-[24px] border border-[#E5E0D5] p-6 md:p-12 lg:p-16 my-4 shadow-sm">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#7D6AF8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-[#FFD95C]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7D6AF8]/10 border border-[#7D6AF8]/20 text-[#7D6AF8] text-xs font-bold">
            <Sparkles className="w-4 h-4 text-[#FFD95C]" />
            <span>Nouveautés & Éditions Spéciales</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3B2416] leading-tight tracking-tight">
            La boutique <span className="text-[#7D6AF8]">Petit Baobab</span>
          </h1>

          <p className="text-base md:text-lg text-[#3B2416]/80 leading-relaxed max-w-xl">
            Des livres éducatifs, coloriages, activités et produits créés spécialement pour les enfants africains.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <Link
              href="#produits"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm rounded-full transition-all duration-200 shadow-md shadow-[#7D6AF8]/20 hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Découvrir les livres</span>
            </Link>

            <Link
              href="#nouveautes"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#FFF9F2] text-[#3B2416] font-bold text-sm rounded-full border border-[#E5E0D5] transition-all duration-200 shadow-sm"
            >
              <span>Voir les nouveautés</span>
              <ArrowRight className="w-4 h-4 text-[#7D6AF8]" />
            </Link>
          </div>
        </div>

        {/* Hero Illustration / Banner Image */}
        <div className="relative flex justify-center items-center">
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/illustrations/boutique.png"
              alt="Boutique Petit Baobab"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
