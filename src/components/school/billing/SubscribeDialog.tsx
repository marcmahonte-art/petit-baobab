"use client";

import { useState } from "react";
import { X, Check, Loader2, Star } from "lucide-react";

const SUBSCRIPTION_OPTIONS = [
  { months: 1, priceXof: 25000, label: "1 mois", bonus: "" },
  { months: 3, priceXof: 75000, label: "3 mois", bonus: "Économisez 0 FCFA" },
  { months: 9, priceXof: 225000, label: "9 mois (Année scolaire)", bonus: "Meilleur prix" },
];

export default function SubscribeDialog({
  open,
  onClose,
  currentPlan,
}: {
  open: boolean;
  onClose: () => void;
  currentPlan?: string;
}) {
  const [selectedMonths, setSelectedMonths] = useState<number>(9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const option = SUBSCRIPTION_OPTIONS.find((o) => o.months === selectedMonths) || SUBSCRIPTION_OPTIONS[2];
  const starsEarned = 1000 * selectedMonths;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/school/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "ecole_pro", months: selectedMonths }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Erreur lors de l'abonnement.");
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de paiement non reçue.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-[#F0E7DA] w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F0EB] cursor-pointer"
        >
          <X className="w-4 h-4 text-[#7A6A5E]" />
        </button>

        <h3 className="text-lg font-extrabold text-[#3B2416] mb-1">S&apos;abonner – École / Pro</h3>
        <p className="text-xs font-semibold text-[#7A6A5E] mb-5">
          Choisissez la durée. {starsEarned.toLocaleString("fr-FR")} étoiles sont créditées immédiatement et le
          renouvellement est repoussé de {selectedMonths} mois.
        </p>

        <div className="space-y-2.5">
          {SUBSCRIPTION_OPTIONS.map((o) => {
            const isSelected = o.months === selectedMonths;
            return (
              <button
                key={o.months}
                onClick={() => setSelectedMonths(o.months)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected ? "border-[#7D6AF8] bg-[#7D6AF8]/5" : "border-[#F0E7DA] hover:border-[#FFB300]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-[#7D6AF8]" : "border-[#D8CCC0]"
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#7D6AF8]" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold text-[#3B2416]">{o.label}</p>
                    <p className="text-[11px] font-semibold text-[#7A6A5E]">
                      {o.months > 1 ? `Économisez ` : ""}
                      {(1000 * o.months).toLocaleString("fr-FR")} étoiles
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-[#3B2416]">
                    {o.priceXof.toLocaleString("fr-FR")} FCFA
                  </p>
                  {o.bonus && <p className="text-[10px] font-bold text-[#16A34A]">{o.bonus}</p>}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2 h-[48px] rounded-full bg-[#7D6AF8] text-white text-sm font-bold hover:bg-[#6552E8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Star className="w-4 h-4" />
          S&apos;abonner pour {option.priceXof.toLocaleString("fr-FR")} FCFA
        </button>

        <p className="mt-3 text-[10px] text-[#7A6A5E] text-center font-medium">
          Paiement sécurisé via PayDunya (Orange Money, Wave, Moov Money, carte bancaire)
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
