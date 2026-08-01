"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BadgeGrid } from "./BadgeGrid";
import { CollectionCard } from "./CollectionCard";
import type { Badge, CollectionItem } from "@/lib/rewards/mock-rewards";

type TabKey = "badges" | "trophees" | "collections" | "defis" | "historique";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "badges", label: "Badges", icon: "🏅" },
  { key: "trophees", label: "Trophées", icon: "🏆" },
  { key: "collections", label: "Collections", icon: "🎒" },
  { key: "defis", label: "Défis", icon: "⚡" },
  { key: "historique", label: "Historique", icon: "📜" },
];

function Placeholder({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <p className="text-sm font-semibold text-[#7A6A5E] max-w-sm">{text}</p>
    </div>
  );
}

export function Tabs({
  badges,
  collection,
}: {
  badges: Badge[];
  collection: CollectionItem[];
}) {
  const [active, setActive] = useState<TabKey>("badges");

  return (
    <Card className="rounded-[22px] md:rounded-[28px] bg-white border border-[#EFE7DB]/60 shadow-[0_4px_12px_rgba(0,0,0,.06)] p-4 md:p-6">
      {/* Barre d'onglets */}
      <div
        role="tablist"
        aria-label="Sections des récompenses"
        className="flex flex-wrap gap-2 mb-5"
      >
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-[#7D6AF8] text-white border-[#7D6AF8] shadow-sm"
                  : "bg-[#FFF9F2] text-[#7A6A5E] border-[#F0E7DA] hover:bg-[#F3ECE2]"
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenu animé */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {active === "badges" && <BadgeGrid badges={badges} />}
          {active === "collections" && <CollectionCard items={collection} />}
          {active === "trophees" && (
            <Placeholder emoji="🏆" text="Tes trophées apparaîtront ici au fil de tes victoires !" />
          )}
          {active === "defis" && (
            <Placeholder emoji="⚡" text="Reviens chaque jour pour relever de nouveaux défis et gagner des récompenses." />
          )}
          {active === "historique" && (
            <Placeholder emoji="📜" text="Ton historique de récompenses sera bientôt disponible." />
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
