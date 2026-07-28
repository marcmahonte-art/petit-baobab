"use client";

import React, { useState } from "react";
import { X, Star, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface SuperBaobabModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SuperBaobabModal({ open, onClose }: SuperBaobabModalProps) {
  const [months, setMonths] = useState<3 | 9>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const monthlyPrice = 4500;
  const starsPerMonth = 250;
  const totalPrice = monthlyPrice * months;
  const totalStars = starsPerMonth * months;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "super_baobab", months }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Erreur lors de la préparation du paiement.");
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de paiement non reçue.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-[#F0E7DA] w-full max-w-md p-6 md:p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F0EB] hover:bg-[#EBE2D8] text-[#7A6A5E] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#6D4CFF] text-xs font-extrabold mb-3">
            <Sparkles className="w-4 h-4 text-[#6D4CFF]" />
            Plan Super Baobab
          </div>
          <h3 className="text-2xl font-extrabold text-[#1C1C3A]">Choisissez la durée</h3>
          <p className="text-xs font-semibold text-[#64748B] mt-1">
            Sélectionnez la période d'abonnement souhaitée
          </p>
        </div>

        {/* Duration Options */}
        <div className="space-y-3.5 mb-6">
          {/* Option 1: 3 Mois */}
          <div
            onClick={() => setMonths(3)}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              months === 3
                ? "border-[#6D4CFF] bg-[#F8F5FF] shadow-sm"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  months === 3 ? "border-[#6D4CFF] bg-[#6D4CFF]" : "border-[#94A3B8]"
                }`}
              >
                {months === 3 && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#1C1C3A]">3 Mois</p>
                <p className="text-xs font-semibold text-[#64748B]">750 étoiles incluses</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-[#1C1C3A]">13 500 FCFA</p>
              <p className="text-[10px] font-bold text-[#64748B]">4 500 FCFA × 3 mois</p>
            </div>
          </div>

          {/* Option 2: 9 Mois (Année Scolaire) */}
          <div
            onClick={() => setMonths(9)}
            className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              months === 9
                ? "border-[#6D4CFF] bg-[#F8F5FF] shadow-sm"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            {/* Badge Recommandé */}
            <div className="absolute -top-3 right-4 bg-[#FFB300] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Année Scolaire (9 mois)
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  months === 9 ? "border-[#6D4CFF] bg-[#6D4CFF]" : "border-[#94A3B8]"
                }`}
              >
                {months === 9 && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#1C1C3A]">9 Mois</p>
                <p className="text-xs font-semibold text-[#64748B]">2 250 étoiles au total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-[#6D4CFF]">40 500 FCFA</p>
              <p className="text-[10px] font-bold text-[#64748B]">4 500 FCFA × 9 mois</p>
            </div>
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#64748B]">Total à régler :</p>
            <p className="text-xl font-extrabold text-[#1C1C3A]">
              {totalPrice.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#64748B]">Étoiles incluses :</p>
            <p className="text-sm font-extrabold text-[#FFB300] flex items-center justify-end gap-1">
              <Star className="w-4 h-4 fill-[#FFB300]" />
              {totalStars.toLocaleString("fr-FR")} étoiles
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
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

        {/* Validation Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-[#6D4CFF] hover:bg-[#5A3EE0] text-white text-base font-extrabold shadow-lg shadow-[#6D4CFF]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement du paiement...</span>
            </>
          ) : (
            <span>Payer {totalPrice.toLocaleString("fr-FR")} FCFA</span>
          )}
        </button>

        <p className="mt-4 text-[11px] text-[#94A3B8] text-center font-semibold">
          Paiement 100% sécurisé (Orange Money, Moov Money, Carte)
        </p>
      </div>
    </div>
  );
}
