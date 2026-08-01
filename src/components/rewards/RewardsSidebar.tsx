"use client";

import { Card } from "@/components/ui/card";
import { RewardCard } from "./RewardCard";
import type { UpcomingReward } from "@/lib/rewards/mock-rewards";

// Panneau latéral "Prochaines récompenses".
// NB arquitecte : la navigation principale (Sidebar) est réutilisée depuis
// src/app/learn/_components/sidebar — ce composant n'est PAS la sidebar
// globale, il est le panneau de récompenses à venir (cf. brief).
export function RewardsSidebar({ rewards }: { rewards: UpcomingReward[] }) {
  return (
    <Card className="rounded-[22px] md:rounded-[28px] bg-white border border-[#EFE7DB]/60 shadow-[0_4px_12px_rgba(0,0,0,.06)] p-5">
      <h2 className="text-lg font-extrabold text-[#3B2416] mb-4">Prochaines récompenses</h2>
      <div className="flex flex-col gap-3">
        {rewards.map((r, i) => (
          <RewardCard key={r.id} reward={r} delay={i * 0.06} />
        ))}
      </div>
    </Card>
  );
}
