"use client";

import { useState } from "react";
import { X, Check, Loader2, Star } from "lucide-react";
import { PAID_PLANS } from "@/lib/payments/types";

const PLAN_FEATURES: Record<string, string[]> = {
  decouverte: [
    "100 étoiles sans expiration",
    "Dessin magique (contour simple)",
    "Livres de coloriage",
    "Support par email",
  ],
  super_baobab: [
    "250 étoiles / mois",
    "Tous les styles de dessin",
    "Livres et jeux complets",
    "Téléchargement illimité",
    "Meilleur rapport qualité / prix",
  ],
  ecole_pro: [
    "1 000 étoiles / mois",
    "Tous les styles de dessin",
    "Livres et jeux complets",
    "Gestion multi-classes",
    "Support prioritaire",
  ],
};

export default function ChangePlanDialog({
  open,
  onClose,
  currentPlan,
}: {
  open: boolean;
  onClose: () => void;
  currentPlan: string;
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleChoose = async (planId: string) => {
    setLoadingPlan(planId);
    setError(null);
    try {
      const res = await fetch("/api/school/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, months: 9 }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Erreur lors du changement de plan.");
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de paiement non reçue.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-[#F0E7DA] w-full max-w-3xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F0EB] cursor-pointer"
        >
          <X className="w-4 h-4 text-[#7A6A5E]" />
        </button>

        <h3 className="text-lg font-extrabold text-[#3B2416] mb-1">Changer de plan</h3>
        <p className="text-xs font-semibold text-[#7A6A5E] mb-5">
          Comparez et choisissez le plan qui correspond à vos besoins.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAID_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={`rounded-[18px] border p-5 flex flex-col ${
                  plan.id === "ecole_pro"
                    ? "border-[#16A34A] ring-2 ring-[#16A34A]/10"
                    : "border-[#F0E7DA]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-extrabold text-[#3B2416]">{plan.name}</h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Actuel
                    </span>
                  )}
                </div>
                <p className="text-xl font-extrabold text-[#3B2416] mb-1">
                  {plan.price_xof.toLocaleString("fr-FR")} FCFA
                  <span className="text-xs font-semibold text-[#7A6A5E]">
                    {plan.kind === "monthly" ? " / mois" : ""}
                  </span>
                </p>
                <p className="text-xs font-bold text-[#7D6AF8] mb-3">{plan.stars} étoiles</p>
                <ul className="space-y-1.5 flex-1">
                  {(PLAN_FEATURES[plan.id] || []).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs font-semibold text-[#7A6A5E]">
                      <Check className="w-3.5 h-3.5 text-[#1D9E75] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleChoose(plan.id)}
                  disabled={loadingPlan !== null || isCurrent}
                  className={`mt-4 flex items-center justify-center gap-2 h-[42px] rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400"
                      : "bg-[#7D6AF8] text-white hover:bg-[#6552E8]"
                  }`}
                >
                  {loadingPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent ? "Plan actuel" : "Choisir ce plan"}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
