"use client";

import Image from "next/image";
import Link from "next/link";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { Breadcrumb } from "@/components/boutique/Breadcrumb";
import { Price } from "@/components/boutique/Price";
import { EmptyState } from "@/components/boutique/EmptyState";
import { MiniCart } from "@/components/boutique/MiniCart";
import { useCartStore } from "@/lib/cart-store";
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
        <Breadcrumb items={[{ label: "Boutique", href: "/boutique" }, { label: "Mon Panier" }]} />

        <div className="my-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
            Mon Panier ({totalItems})
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items Table / List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-[24px] border border-[#E5E0D5] p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
                  <span className="text-xs font-bold text-[#3B2416]/60 uppercase">Produits</span>
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-[#FF5E83] hover:underline"
                  >
                    Vider le panier
                  </button>
                </div>

                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
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
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#3B2416] hover:bg-[#7D6AF8] hover:text-white transition-colors"
                          aria-label="Moins"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#3B2416] hover:bg-[#7D6AF8] hover:text-white transition-colors"
                          aria-label="Plus"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total price for item */}
                      <Price amount={product.price * quantity} currency={product.currency} size="md" />

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-gray-400 hover:text-[#FF5E83] p-1 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
                <div className="flex justify-between text-[#3B2416]/70">
                  <span>Articles ({totalItems})</span>
                  <Price amount={totalPrice} size="sm" />
                </div>
                <div className="flex justify-between text-[#3B2416]/70">
                  <span>Frais de dossier / Téléchargement</span>
                  <span className="font-bold text-[#1D9E75]">GRATUIT</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-[#3B2416] pt-3 border-t border-[#E5E0D5]">
                  <span>Total</span>
                  <Price amount={totalPrice} size="lg" />
                </div>
              </div>

              <Link
                href="/boutique/checkout"
                className="w-full py-4 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7D6AF8]/20 hover:scale-[1.01]"
              >
                <span>Passer la commande</span>
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
