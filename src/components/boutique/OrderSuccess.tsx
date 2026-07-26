"use client";

import Link from "next/link";
import Image from "next/image";
import { Price } from "./Price";
import { useOrderStore } from "@/stores/order-store";
import { CheckCircle2, Mail, MessageSquare, Download, ArrowLeft, Clock, ShoppingBag } from "lucide-react";

export function OrderSuccess() {
  const { currentOrder } = useOrderStore();

  if (!currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-[24px] border border-[#E5E0D5] max-w-md mx-auto my-8">
        <p className="text-sm font-bold text-[#3B2416]">Aucune commande récente trouvée.</p>
        <Link
          href="/boutique"
          className="mt-4 px-6 py-2.5 rounded-full bg-[#7D6AF8] text-white text-xs font-bold"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 md:p-10 bg-white rounded-[24px] border border-[#E5E0D5] shadow-lg max-w-xl mx-auto my-8">
      {/* Illustration */}
      <div className="relative w-28 h-28 mb-4">
        <Image
          src="/illustrations/Aperçois.webp"
          alt="Commande réussie"
          fill
          className="object-contain"
        />
        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Order Badge & Number */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-extrabold uppercase tracking-wider mb-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Statut : En attente</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-[#3B2416]">
        Merci pour votre commande !
      </h1>

      <div className="mt-2 p-2.5 px-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5] text-xs font-extrabold text-[#7D6AF8]">
        N° de commande : <span className="text-[#3B2416] font-black">{currentOrder.order_number}</span>
      </div>

      {/* Message required by prompt */}
      <div className="my-4 p-4 rounded-xl bg-[#FFD95C]/20 border border-[#FFD95C] text-xs font-bold text-[#3B2416] max-w-md">
        "Votre paiement sera bientôt traité. Téléchargement disponible après confirmation."
      </div>

      {/* Summary Box */}
      <div className="w-full text-left bg-[#FFF9F2] rounded-2xl border border-[#E5E0D5] p-4 md:p-5 space-y-4 my-2">
        <h3 className="text-xs font-bold text-[#3B2416]/70 uppercase tracking-wider pb-2 border-b border-[#E5E0D5] flex items-center justify-between">
          <span>Résumé de vos articles</span>
          <span>{currentOrder.date}</span>
        </h3>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {currentOrder.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#E5E0D5]">
                  <Image
                    src={product.images[0] || "/illustrations/Collection-livres.webp"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="truncate">
                  <p className="font-bold text-[#3B2416] truncate">{product.title}</p>
                  <p className="text-[10px] text-[#3B2416]/60">Qté : {quantity}</p>
                </div>
              </div>
              <Price amount={product.price * quantity} currency={product.currency} size="sm" />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between text-sm font-extrabold text-[#3B2416]">
          <span>Montant Total</span>
          <Price amount={currentOrder.total} size="lg" />
        </div>
      </div>

      {/* Notifications list */}
      <div className="w-full my-4 space-y-2.5 text-left">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/70">
          <div className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3B2416]">Téléchargement bientôt disponible</h4>
            <p className="text-[10px] text-[#3B2416]/70">Vos liens PDF seront débloqués dès confirmation du règlement.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/70">
          <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3B2416]">Email de confirmation</h4>
            <p className="text-[10px] text-[#3B2416]/70">Envoyé à <strong>{currentOrder.email}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/70">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3B2416]">Notification WhatsApp</h4>
            <p className="text-[10px] text-[#3B2416]/70">Envoyée au <strong>{currentOrder.phone}</strong></p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full pt-2">
        <Link
          href="/boutique"
          className="w-full py-3.5 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7D6AF8]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retourner à la boutique</span>
        </Link>
      </div>
    </div>
  );
}
