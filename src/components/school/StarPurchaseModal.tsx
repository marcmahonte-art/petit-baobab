"use client";
import React, { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";

const PACKS = [
  { id: "pack_100", stars: 100, price: 2000, label: "100 étoiles" },
  { id: "pack_250", stars: 250, price: 4500, label: "250 étoiles" },
  { id: "pack_500", stars: 500, price: 8000, label: "500 étoiles" },
];

interface StarPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  preselectedPackId?: string;
}

export default function StarPurchaseModal({ open, onClose, preselectedPackId }: StarPurchaseModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setLoading(packId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Erreur lors de la création du paiement.");
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de paiement non reçue.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  if (!open) return null;

  const packs = preselectedPackId
    ? PACKS.filter((p) => p.id === preselectedPackId)
    : PACKS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-[#F0E7DA] w-full max-w-sm p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F0EB] cursor-pointer"
        >
          <X className="w-4 h-4 text-[#7A6A5E]" />
        </button>

        <h3 className="text-lg font-extrabold text-[#3B2416] mb-1">Acheter des étoiles</h3>
        <p className="text-xs font-semibold text-[#7A6A5E] mb-5">
          Choisissez un pack. Vous serez redirigé vers PayDunya pour le paiement (Wave, Orange Money, carte).
        </p>

        <div className="space-y-3">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handlePurchase(pack.id)}
              disabled={loading !== null}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[#F0E7DA] bg-white hover:bg-[#FFF9F2] hover:border-[#FFB300] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF5CC] flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#FFB300] fill-[#FFB300]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold text-[#3B2416]">{pack.label}</p>
                  <p className="text-[11px] font-semibold text-[#7A6A5E]">
                    {pack.stars} étoiles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#3B2416]">
                  {pack.price.toLocaleString("fr-FR")} FCFA
                </span>
                {loading === pack.id && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#7D6AF8]" />
                )}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="text-xs font-bold text-red-600 mb-2">{error}</p>
            {error.includes("connecté") && (
              <a
                href="/login?redirect=/parents"
                className="inline-block px-4 py-2 bg-[#6D4CFF] text-white text-xs font-bold rounded-lg hover:bg-[#5A3EE0] transition-colors"
              >
                Se connecter maintenant
              </a>
            )}
          </div>
        )}

        <p className="mt-4 text-[10px] text-[#7A6A5E] text-center font-medium">
          Paiement sécurisé via PayDunya (Orange Money, Wave, Moov Money, carte bancaire)
        </p>
      </div>
    </div>
  );
}
