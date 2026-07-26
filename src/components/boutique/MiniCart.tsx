"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { Price } from "./Price";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function MiniCart() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalTTC,
    getTotalHT,
    getTotalItems,
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPriceTTC = getTotalTTC();
  const totalPriceHT = getTotalHT();

  const handleRemove = (id: string, title: string) => {
    removeItem(id);
    toast.info(`"${title}" retiré du panier`);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#FFF9F2] p-0 flex flex-col">
        {/* Cart Header */}
        <div className="p-4 md:p-6 border-b border-[#E5E0D5] flex flex-row items-center justify-between space-y-0">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#3B2416]">
            <ShoppingBag className="w-5 h-5 text-[#7D6AF8]" />
            <span>Mon Panier</span>
            <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] font-bold">
              {totalItems}
            </span>
          </h3>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#E5E0D5]/50 flex items-center justify-center text-[#3B2416]/40 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-[#3B2416]">Votre panier est vide</p>
              <p className="text-xs text-[#3B2416]/70 mt-1 max-w-xs">
                Ajoutez des livres ou produits pour commencer votre commande.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map(({ product, quantity }) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-[16px] border border-[#E5E0D5] shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FFF9F2] shrink-0 border border-[#E5E0D5]/50">
                    <Image
                      src={product.images[0] || "/illustrations/Collection-livres.webp"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#3B2416] truncate">
                      {product.title}
                    </h4>
                    <div className="mt-1">
                      <Price amount={product.price} currency={product.currency} size="sm" />
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded-full bg-[#FFF9F2] border border-[#E5E0D5] flex items-center justify-center text-[#3B2416] hover:bg-[#7D6AF8] hover:text-white hover:border-[#7D6AF8] transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="text-xs font-bold text-[#3B2416] w-4 text-center">
                        {quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded-full bg-[#FFF9F2] border border-[#E5E0D5] flex items-center justify-center text-[#3B2416] hover:bg-[#7D6AF8] hover:text-white hover:border-[#7D6AF8] transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleRemove(product.id, product.title)}
                    className="text-gray-400 hover:text-[#FF5E83] p-1 transition-colors"
                    aria-label="Supprimer le produit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Cart Footer / Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="p-4 md:p-6 bg-white border-t border-[#E5E0D5] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#3B2416]/70">
              <span>Total HT</span>
              <Price amount={totalPriceHT} size="sm" />
            </div>

            <div className="flex items-center justify-between text-base font-bold text-[#3B2416]">
              <span>Total TTC</span>
              <Price amount={totalPriceTTC} size="lg" />
            </div>

            <p className="text-[11px] text-[#3B2416]/60 text-center">
              Frais de livraison ou de téléchargement calculés à l'étape suivante.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/boutique/checkout"
                onClick={closeCart}
                className="w-full py-3.5 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7D6AF8]/20"
              >
                <span>Continuer vers le paiement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/boutique/panier"
                onClick={closeCart}
                className="w-full py-2.5 px-6 rounded-full bg-transparent border border-[#E5E0D5] hover:bg-[#FFF9F2] text-[#3B2416] font-semibold text-xs text-center transition-colors"
              >
                Voir le détail du panier
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
