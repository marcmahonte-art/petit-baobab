"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface QuickExamplesProps {
  onSelectExample: (text: string) => void;
}

const EXAMPLES = [
  "Une activité d'éveil sur les couleurs pour des enfants de 3 ans",
  "Une fiche de graphisme sur les lignes et ronds",
  "Une comptine rythmé sur les animaux de la savane",
  "Un message aux parents pour la sortie scolaire au zoo",
];

export default function QuickExamples({ onSelectExample }: QuickExamplesProps) {
  return (
    <div className="bg-[#FFF9E4] border border-[#F7E7B4] rounded-3xl p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-[#B37B00]">
        <Sparkles className="w-4 h-4 fill-[#B37B00]/20" />
        <h4 className="font-extrabold text-sm text-[#35180D] uppercase tracking-wide">
          Exemples rapides
        </h4>
      </div>

      <div className="space-y-2">
        {EXAMPLES.map((example, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectExample(example)}
            className="w-full text-left p-3 rounded-2xl bg-white/90 border border-[#F0E2BA] hover:border-[#FF8A00] text-xs sm:text-sm font-semibold text-[#35180D] hover:text-[#FF8A00] hover:bg-white transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
          >
            <span className="line-clamp-1 mr-2">✦ {example}</span>
            <ArrowRight className="w-4 h-4 text-[#B37B00] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
