"use client";

import Image from "next/image";
import Link from "next/link";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { Breadcrumb } from "@/components/boutique/Breadcrumb";
import { Price } from "@/components/boutique/Price";
import { MiniCart } from "@/components/boutique/MiniCart";
import { useCartStore } from "@/stores/cart-store";
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalTTC,
    getTotalHT,
    getTotalItems,
  } = useCartStore();

  const totalPriceTTC = getTotalTTC();
  const totalPriceHT = getTotalHT();
  const totalItems = getTotalItems();

  const handleRemove = (id: string, title: string) => {
    removeItem(id);
    toast.info(`"${title}" retiré du panier`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
        <Breadcrumb items={[{ label: "Boutique", href: "/boutique" }, { label: "Mon Panier" }]} />

        <div className="my-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
            Mon Panier ({totalItems} article{totalItems > 1 ? "s" : ""})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-[24px] border border-[#E5E0D5] shadow-sm max-w-lg mx-auto my-8 space-y-6">
            <div className="relative w-40 h-40">
              <Image
                src="/illustrations/Aperçois.webp"
                alt="Panier vide"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#3B2416]">Votre panier est vide</h2>
              <p className="text-sm text-[#3B2416]/70 mt-2 max-w-sm">
                Découvrez nos livres éducatifs, coloriages et t-shirts créés spécialement pour vos enfants.
              </p>
            </div>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-extrabold text-sm rounded-full transition-all shadow-md shadow-[#7D6AF8]/20 hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Découvrir les livres</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
            {/* Items Table / List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
                  <span className="text-xs font-bold text-[#3B2416]/60 uppercase">Produits</span>
                  <button
                    onClick={() => {
                      clearCart();
                      toast.info("Panier vidé");
                    }}
                    className="text-xs font-bold text-[#FF5E83] hover:underline"
                  >
                    Vider le panier
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {items.map(({ product, quantity }) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/70"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E5E0D5]">
                          <Image
                            src={product.images[0] || "/illustrations/Collection-livres.webp"}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/boutique/${product.slug}`}
                            className="text-sm font-bold text-[#3B2416] hover:text-[#7D6AF8] transition-colors"
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs text-[#3B2416]/60 mt-0.5">
                            {product.category.replace("-", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E0D5]">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 border border-[#E5E0D5] rounded-full bg-white px-2 py-1">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#3B2416] hover:bg-[#7D6AF8] hover:text-white transition-colors"
                            aria-label="Moins"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <span className="text-xs font-bold w-5 text-center">{quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#3B2416] hover:bg-[#7D6AF8] hover:text-white transition-colors"
                            aria-label="Plus"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>

                        {/* Total price for item */}
                        <Price amount={product.price * quantity} currency={product.currency} size="md" />

                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleRemove(product.id, product.title)}
                          className="text-gray-400 hover:text-[#FF5E83] p-1 transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/boutique"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#7D6AF8] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continuer mes achats</span>
                </Link>
              </div>
            </div>

            {/* Summary & Checkout Sidebar */}
            <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-[#3B2416] pb-3 border-b border-[#E5E0D5]">
                Récapitulatif
              </h3>

              <div className="space-y-3 text-sm text-[#3B2416]">
                <div className="flex justify-between text-[#3B2416]/70 text-xs">
                  <span>Total HT</span>
                  <Price amount={totalPriceHT} size="sm" />
                </div>
                <div className="flex justify-between text-[#3B2416]/70 text-xs">
                  <span>Livraison / Téléchargement</span>
                  <span className="font-bold text-[#1D9E75]">GRATUIT</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-[#3B2416] pt-3 border-t border-[#E5E0D5]">
                  <span>Total TTC</span>
                  <Price amount={totalPriceTTC} size="lg" />
                </div>
              </div>

              <Link
                href="/boutique/checkout"
                className="w-full py-4 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7D6AF8]/20 hover:scale-[1.01]"
              >
                <span>Continuer vers le paiement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
