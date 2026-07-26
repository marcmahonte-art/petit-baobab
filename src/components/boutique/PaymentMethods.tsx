"use client";

import { Phone, CreditCard, Smartphone, Shield } from "lucide-react";

export type PaymentMethodType = "orange_money" | "moov_money" | "card" | "paydunya";

interface PaymentMethodsProps {
  selectedMethod: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
}

export function PaymentMethods({ selectedMethod, onSelect }: PaymentMethodsProps) {
  const methods = [
    {
      id: "orange_money" as PaymentMethodType,
      title: "Orange Money",
      subtitle: "Paiement mobile instantané",
      icon: <Smartphone className="w-5 h-5 text-[#FF7900]" />,
      badge: "Recommandé",
    },
    {
      id: "moov_money" as PaymentMethodType,
      title: "Moov Money",
      subtitle: "Paiement mobile rapide",
      icon: <Phone className="w-5 h-5 text-[#008080]" />,
    },
    {
      id: "card" as PaymentMethodType,
      title: "Carte bancaire (Visa / Mastercard)",
      subtitle: "Paiement international sécurisé",
      icon: <CreditCard className="w-5 h-5 text-[#7D6AF8]" />,
    },
    {
      id: "paydunya" as PaymentMethodType,
      title: "PayDunya (Wave / Mobile)",
      subtitle: "Guichet de paiement multi-opérateurs",
      icon: <Shield className="w-5 h-5 text-[#1D9E75]" />,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-[#3B2416]">
        Choisissez votre moyen de paiement
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((m) => {
          const isSelected = selectedMethod === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`relative flex items-start gap-3 p-4 rounded-[16px] border cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#FFF9F2] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/20 shadow-sm"
                  : "bg-white border-[#E5E0D5] hover:border-[#7D6AF8]/50"
              }`}
            >
              <div className="mt-0.5 p-2 rounded-full bg-white border border-[#E5E0D5] shrink-0">
                {m.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#3B2416]">{m.title}</h4>
                  {m.badge && (
                    <span className="text-[9px] font-extrabold text-white bg-[#FF5E83] px-2 py-0.5 rounded-full">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#3B2416]/60 mt-0.5">{m.subtitle}</p>
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                  isSelected ? "border-[#7D6AF8] bg-[#7D6AF8]" : "border-gray-300"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
