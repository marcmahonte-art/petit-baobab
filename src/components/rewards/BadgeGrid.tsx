"use client";

import { Card } from "@/components/ui/card";
import { BadgeCard } from "./BadgeCard";
import type { Badge } from "@/lib/rewards/mock-rewards";

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned);
  return (
    <Card className="rounded-[22px] md:rounded-[28px] bg-white border border-[#EFE7DB]/60 shadow-[0_4px_12px_rgba(0,0,0,.06)] p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-extrabold text-[#3B2416]">Mes badges</h2>
        <span className="text-sm font-bold text-[#7A6A5E]">
          {earned.length} / {badges.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {badges.map((b) => (
          <BadgeCard key={b.id} badge={b} />
        ))}
      </div>

      {/* Détail du dernier badge obtenu (accessibilité : info texte) */}
      {earned.length > 0 && (
        <p className="mt-4 text-xs text-[#7A6A5E] font-medium">
          Dernier débloqué : <span className="font-bold text-[#3B2416]">{earned[earned.length - 1].name}</span>{" "}
          — {earned[earned.length - 1].description}
          {earned[earned.length - 1].obtainedAt ? ` (${earned[earned.length - 1].obtainedAt})` : ""}
        </p>
      )}
    </Card>
  );
}
