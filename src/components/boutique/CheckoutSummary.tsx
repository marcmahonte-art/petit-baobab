import Image from "next/image";
import { CartItem } from "@/lib/mock/types";
import { Price } from "./Price";
import { ShieldCheck, Lock } from "lucide-react";

export const DELIVERY_FEE = 3500; // frais impression+livraison en XOF

interface CheckoutSummaryProps {
  items: CartItem[];
  totalPrice: number;
  deliveryMethod: "download" | "delivery";
}

export function CheckoutSummary({ items, totalPrice, deliveryMethod }: CheckoutSummaryProps) {
  const deliveryFee = deliveryMethod === "delivery" ? DELIVERY_FEE : 0;
  const finalTotal = totalPrice + deliveryFee;
  return (
    <div className="bg-white rounded-[20px] border border-[#E5E0D5] p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-[#3B2416] pb-3 border-b border-[#E5E0D5]">
        Résumé de la commande
      </h3>

      {/* Items list */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FFF9F2] shrink-0 border border-[#E5E0D5]">
              <Image
                src={product.images[0] || "/illustrations/Collection-livres.webp"}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#3B2416] truncate">{product.title}</p>
              <p className="text-[11px] text-[#3B2416]/60">Qté : {quantity}</p>
            </div>
            <Price amount={product.price * quantity} currency={product.currency} size="sm" />
          </div>
        ))}
      </div>

      {/* Calculation */}
      <div className="pt-4 border-t border-[#E5E0D5] space-y-2 text-xs text-[#3B2416]">
        <div className="flex justify-between text-[#3B2416]/70">
          <span>Sous-total</span>
          <Price amount={totalPrice} size="sm" />
        </div>
        <div className="flex justify-between text-[#3B2416]/70">
          <span>{deliveryMethod === "delivery" ? "Impression + Livraison" : "Téléchargement"}</span>
          {deliveryMethod === "delivery" ? (
            <Price amount={deliveryFee} size="sm" />
          ) : (
            <span className="font-bold text-[#1D9E75]">GRATUIT</span>
          )}
        </div>
        <div className="flex justify-between text-base font-extrabold text-[#3B2416] pt-3 border-t border-[#E5E0D5]">
          <span>Total à payer</span>
          <Price amount={finalTotal} size="lg" />
        </div>
      </div>

      {/* Reassurance */}
      <div className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5] space-y-2 text-[11px] text-[#3B2416]/80">
        <div className="flex items-center gap-2 font-bold text-[#1D9E75]">
          <ShieldCheck className="w-4 h-4" />
          <span>Garantie Satisfait ou Remboursé</span>
        </div>
        <div className="flex items-center gap-2 text-[#3B2416]/70">
          <Lock className="w-3.5 h-3.5" />
          <span>Paiement 100% sécurisé et chiffré</span>
        </div>
      </div>
    </div>
  );
}
