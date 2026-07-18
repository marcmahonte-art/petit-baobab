"use client";
import React from "react";
import StarPurchaseModal from "./StarPurchaseModal";

interface StarsBalanceWidgetProps {
  balance: number;
  limit: number;
  renewalDate: string;
}

export default function StarsBalanceWidget({
  balance,
  limit,
  renewalDate,
}: StarsBalanceWidgetProps) {
  const [showPurchase, setShowPurchase] = React.useState(false);
  const percentage = Math.min((balance / limit) * 100, 100);

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(renewalDate);
      return d.toLocaleDateString("fr-FR");
    } catch {
      return renewalDate.split("T")[0];
    }
  }, [renewalDate]);

  return (
    <div className="bg-[#FFFDF8] rounded-2xl p-5 shadow-sm border border-[#F0E7DA]">
      <h3 className="text-sm font-extrabold text-[#3B2416] mb-1">
        Mon solde d'étoiles
      </h3>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-black text-[#3B2416]">{balance}</span>
        <span className="text-sm text-[#7A6A5E] font-bold">/{limit} étoiles</span>
      </div>

      <div className="mt-3 w-full h-3 bg-[#F5F0EB] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FFB300] to-[#FFD95C] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-[#7A6A5E] font-medium">
        <span>Renouvellement : {formattedDate}</span>
      </div>

      <button
        onClick={() => setShowPurchase(true)}
        className="mt-4 w-full h-11 bg-[#7D6AF8] hover:bg-[#6552E8] active:translate-y-0.5 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm shadow-[#7D6AF8]/20"
      >
        Acheter des étoiles
      </button>

      <StarPurchaseModal open={showPurchase} onClose={() => setShowPurchase(false)} />
    </div>
  );
}
