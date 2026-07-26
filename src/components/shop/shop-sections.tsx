"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, Download, ShieldCheck, Printer, Heart } from "lucide-react";
import {
  shopCategories,
  popularProducts,
  formatPriceFCFA,
  type CategoryCard,
  type Product,
} from "@/data/mock-products";

// Couleurs d'accent mappées sur la palette du site
const ACCENT: Record<CategoryCard["accent"], { bg: string; text: string; btn: string }> = {
  purple: { bg: "bg-[#7D6AF8]/10", text: "text-[#7D6AF8]", btn: "bg-[#7D6AF8] hover:bg-[#6552E8] text-white" },
  green: { bg: "bg-[#20C997]/10", text: "text-[#20C997]", btn: "bg-[#20C997] hover:bg-[#17a589] text-white" },
  orange: { bg: "bg-[#FFB300]/15", text: "text-[#E69500]", btn: "bg-[#FFB300] hover:bg-[#E69500] text-white" },
  pink: { bg: "bg-[#FF5E83]/10", text: "text-[#FF5E83]", btn: "bg-[#FF5E83] hover:bg-[#e64d70] text-white" },
  blue: { bg: "bg-[#1194FF]/10", text: "text-[#1194FF]", btn: "bg-[#1194FF] hover:bg-[#0d7dd6] text-white" },
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function ShopHero() {
  return (
    <section className="relative overflow-hidden bg-[#FFFDF8]">
      {/* Décor feuilles */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#20C997]/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#7D6AF8]/10 blur-2xl" />

      <div className="mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-[#FFE08A]/40 px-4 py-1.5 text-[14px] font-bold text-[#B45309]"
        >
          🛍️ La boutique Petit Baobab
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto mt-4 max-w-3xl text-[34px] font-extrabold leading-tight text-[#3B2416] md:text-[48px]"
        >
          La boutique Petit Baobab
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-2xl text-[16px] font-semibold text-[#7A6A5E] md:text-[18px]"
        >
          Des créations uniques pour apprendre, jouer et grandir. Livres de coloriage,
          activités éducatives et accessoires pour enfants.
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cartes catégories                                                  */
/* ------------------------------------------------------------------ */
export function CategoryCardItem({ card }: { card: CategoryCard }) {
  const a = ACCENT[card.accent];
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="feature-card flex flex-col overflow-hidden rounded-[24px] border border-[#F0E7DA] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    >
      <div className={`relative h-40 w-full ${a.bg} flex items-center justify-center overflow-hidden`}>
        <Image
          src={card.image}
          alt={card.title}
          width={140}
          height={140}
          className="h-28 w-28 object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] font-extrabold text-[#3B2416]">{card.title}</h3>
        <p className="mt-1 flex-1 text-[13px] font-medium text-[#7A6A5E]">{card.description}</p>
        <Link
          href={card.href}
          className={`mt-3 inline-flex items-center justify-center gap-1 rounded-full px-4 py-2 text-[14px] font-bold transition-colors ${a.btn}`}
        >
          {card.cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

export function ShopCategories() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {shopCategories.map((card) => (
          <CategoryCardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Carte produit                                                      */
/* ------------------------------------------------------------------ */
export function ProductCardItem({ product }: { product: Product }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="coloring-item group flex flex-col overflow-hidden rounded-[20px] border border-[#F0E7DA] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="relative h-44 w-full bg-[#FBF3E6] flex items-center justify-center overflow-hidden">
        <button
          aria-label="Ajouter aux favoris"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#FF5E83] shadow-sm transition-transform hover:scale-110"
        >
          <Heart className="h-4 w-4" />
        </button>
        <Image
          src={product.image}
          alt={product.title}
          width={150}
          height={150}
          className="h-32 w-32 object-contain transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[11px] font-bold text-[#B45309]">
          {product.categoryLabel}
        </span>
        <h3 className="mt-2 text-[16px] font-extrabold text-[#3B2416]">{product.title}</h3>

        <div className="mt-1 flex items-center gap-1 text-[13px] font-bold text-[#FFB300]">
          <Star className="h-4 w-4 fill-[#FFB300] text-[#FFB300]" />
          {product.rating.toFixed(1)}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[16px] font-extrabold text-[#3B2416]">
            {formatPriceFCFA(product.price)}
          </span>
          <button className="rounded-full bg-[#7D6AF8] px-4 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-[#6552E8]">
            Acheter
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ShopPopularProducts() {
  return (
    <section id="produits" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[24px] font-extrabold text-[#3B2416] md:text-[28px]">Produits populaires</h2>
        <Link
          href="/boutique#produits"
          className="inline-flex items-center gap-1 text-[14px] font-bold text-[#7D6AF8] hover:underline"
        >
          Voir toute la boutique <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {popularProducts.map((product) => (
          <ProductCardItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau de réassurance                                             */
/* ------------------------------------------------------------------ */
const REASSURANCE = [
  {
    icon: Download,
    title: "Téléchargement instantané",
    text: "Recevez vos produits immédiatement après le paiement.",
    color: "text-[#7D6AF8]",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    text: "Payez facilement avec Orange Money ou Moov Money.",
    color: "text-[#20C997]",
  },
  {
    icon: Printer,
    title: "Prêt à imprimer",
    text: "Fichiers PDF haute qualité compatibles avec toutes les imprimantes.",
    color: "text-[#FFB300]",
  },
  {
    icon: Heart,
    title: "Pensé pour les enfants",
    text: "Des activités éducatives adaptées aux enfants de 3 à 10 ans.",
    color: "text-[#FF5E83]",
  },
];

export function ShopReassurance() {
  return (
    <section className="bg-[#FFF9E6]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-4 md:px-6">
        {REASSURANCE.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h4 className="mt-3 text-[15px] font-extrabold text-[#3B2416]">{item.title}</h4>
              <p className="mt-1 text-[13px] font-medium text-[#7A6A5E]">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
