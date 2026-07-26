"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, Download, ShieldCheck, Printer, Heart, Store } from "lucide-react";
import {
  shopCategories,
  popularProducts,
  formatPriceFCFA,
  type CategoryCard,
  type Product,
} from "@/data/mock-products";

// Largeur max du design system v2
const MAXW = "max-w-[1440px] mx-auto";

// Couleurs de fond + bouton par catégorie (spec exacte)
const ACCENT: Record<
  CategoryCard["accent"],
  { bg: string; btn: string }
> = {
  purple: { bg: "bg-[#F4E8FF]", btn: "bg-[#7D6AF8] hover:bg-[#6552E8] text-white" },
  green: { bg: "bg-[#EAF8EE]", btn: "bg-[#20C997] hover:bg-[#17a589] text-white" },
  orange: { bg: "bg-[#FFF4CF]", btn: "bg-[#FFB300] hover:bg-[#E69500] text-white" },
  pink: { bg: "bg-[#FFE8EF]", btn: "bg-[#FF5E83] hover:bg-[#e64d70] text-white" },
  blue: { bg: "bg-[#E8F5FF]", btn: "bg-[#1194FF] hover:bg-[#0d7dd6] text-white" },
};

/* ------------------------------------------------------------------ */
/* SECTION 1 — Hero Boutique                                          */
/* ------------------------------------------------------------------ */
export function ShopHero() {
  return (
    <section className="w-full">
      <div
        className={`${MAXW} my-8 px-10 pt-8 pb-12`}
        style={{
          minHeight: 320,
          background: "linear-gradient(180deg, #FFFDF9, #FFF8EC)",
          borderRadius: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: 48,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <Store className="h-12 w-12 text-[#7D6AF8]" />
          <h1
            className="text-center font-extrabold text-[#3A1F12]"
            style={{ fontSize: 64, lineHeight: "72px" }}
          >
            <span className="text-[#3A1F12]">La boutique </span>
            <span className="text-[#7D6AF8]">Petit Baobab</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center font-semibold text-[#5B5563]"
          style={{ fontSize: 28, maxWidth: 760, lineHeight: 1.4 }}
        >
          Des créations uniques pour apprendre, jouer et grandir.
          <br />
          Livres de coloriage, activités éducatives et accessoires.
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 2 — Cartes Catégories                                       */
/* ------------------------------------------------------------------ */
export function CategoryCardItem({ card }: { card: CategoryCard }) {
  const a = ACCENT[card.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6 }}
      className={`flex flex-col overflow-hidden rounded-[28px] ${a.bg} shadow-xl`}
      style={{ width: 248, height: 280, padding: 28 }}
    >
      <div className="flex h-40 w-full items-center justify-center overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          width={160}
          height={160}
          className="h-40 w-40 object-contain"
        />
      </div>
      <h3 className="mt-2 text-center text-[30px] font-extrabold text-[#3A1F12]">
        {card.title}
      </h3>
      <Link
        href={card.href}
        className={`mt-auto inline-flex items-center justify-center gap-1 rounded-full px-4 py-2 text-[14px] font-bold transition-transform duration-200 hover:scale-105 ${a.btn}`}
      >
        {card.cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}

export function ShopCategories() {
  return (
    <section className={`${MAXW} px-10 py-6`}>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {shopCategories.map((card) => (
          <div key={card.id} className="flex justify-center">
            <CategoryCardItem card={card} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 3 — Produits populaires                                     */
/* ------------------------------------------------------------------ */
export function ProductCardItem({ product }: { product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="flex flex-col overflow-hidden rounded-[24px] bg-white shadow-sm transition-transform duration-200"
      style={{ width: 220, height: 390, border: "1px solid #F1ECE5", padding: 18 }}
    >
      <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden bg-[#FBF3E6]">
        <button
          aria-label="Ajouter aux favoris"
          className="absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#FF5E83] shadow-sm transition-transform hover:scale-110"
        >
          <Heart className="h-4 w-4" />
        </button>
        <Image
          src={product.image}
          alt={product.title}
          width={180}
          height={220}
          className="h-[180px] w-[180px] object-contain transition-transform duration-200 group-hover:scale-[1.04]"
        />
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <span
          className="inline-flex w-fit items-center rounded-full bg-[#FFF3E0] text-[#B45309]"
          style={{ height: 28, padding: "0 14px", fontSize: 11, fontWeight: 700 }}
        >
          {product.categoryLabel}
        </span>
        <h3 className="mt-2 font-bold text-[#3A1F12]" style={{ fontSize: 24 }}>
          {product.title}
        </h3>
        {product.description && (
          <p className="mt-1 text-[18px] text-[#666] leading-tight">{product.description}</p>
        )}

        <div className="mt-auto flex items-center gap-1 text-[#FFB300]">
          <Star className="h-[18px] w-[18px] fill-[#FFB300] text-[#FFB300]" />
          <span className="text-[14px] font-bold">{product.rating.toFixed(1)}</span>
        </div>

        <div
          className="mt-2 font-bold text-[#3A1F12]"
          style={{ fontSize: 38, lineHeight: 1 }}
        >
          {formatPriceFCFA(product.price)}
        </div>

        <button
          className="mt-3 w-full rounded-[14px] bg-[#7D6AF8] text-white font-bold transition-transform duration-200 hover:scale-[1.05]"
          style={{ height: 46 }}
        >
          Acheter
        </button>
      </div>
    </motion.div>
  );
}

export function ShopPopularProducts() {
  return (
    <section id="produits" className={`${MAXW} scroll-mt-24 px-10 py-6`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-[#3A1F12]" style={{ fontSize: 40 }}>
          Produits populaires
        </h2>
        <Link
          href="/boutique#produits"
          className="inline-flex items-center gap-1 text-[16px] font-bold text-[#7D6AF8] hover:underline"
        >
          Voir toute la boutique <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {popularProducts.map((product) => (
          <div key={product.id} className="flex justify-center">
            <ProductCardItem product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECTION 4 — Bande Avantages                                        */
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
    <section className={`${MAXW} px-10 py-12`}>
      <div
        className="grid grid-cols-1 gap-8 bg-[#FFF7E9] md:grid-cols-2 lg:grid-cols-4"
        style={{ borderRadius: 30, padding: 36, minHeight: 170 }}
      >
        {REASSURANCE.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex flex-col items-center text-center">
              <Icon className={`h-[72px] w-[72px] ${item.color}`} />
              <h4 className="mt-2 font-bold text-[#3A1F12]" style={{ fontSize: 26 }}>
                {item.title}
              </h4>
              <p className="mt-1 text-[18px] text-[#5B5563]">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
