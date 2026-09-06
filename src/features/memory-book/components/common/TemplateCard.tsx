"use client";

import React from "react";
import { MemoryBookTemplate } from "../../types/memory-book.types";
import { Sparkles, ArrowRight, Check, Layers3 } from "lucide-react";

interface TemplateCardProps {
  template: MemoryBookTemplate;
  isSelected?: boolean;
  onSelect: (template: MemoryBookTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(template)}
      className={`relative cursor-pointer rounded-[28px] border p-6 transition-all duration-200 flex flex-col justify-between shadow-[0_2px_10px_rgba(59,36,22,0.06)] ${
        isSelected
          ? "border-[#7D6AF8] bg-[#FFF9F2] shadow-[0_10px_30px_-14px_rgba(59,36,22,0.18)] scale-[1.02]"
          : "border-[#F0E7DA] bg-white hover:border-[#7D6AF8] hover:shadow-[0_10px_30px_-14px_rgba(59,36,22,0.18)]"
      }`}
    >
      {/* Badge du modèle */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-[#FFF9F2] text-[#7A3B1D] border border-[#F0E7DA] font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#7D6AF8]" />
          {template.coverBadge}
        </span>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-[#7D6AF8] text-white flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Titre et description */}
      <div className="mb-6">
        <h3 className="caveat-font font-bold text-[#3B2416] text-3xl mb-1.5">
          {template.title}
        </h3>
        <p className="text-xs md:text-sm text-[#6F604F] leading-relaxed font-semibold">
          {template.description}
        </p>
      </div>

      {/* Aperçu des 9 pages incluses */}
      <div className="bg-[#FFF9F2] rounded-2xl p-3.5 mb-6 border border-[#F0E7DA]">
        <span className="text-[11px] font-bold text-[#8a7f66] uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Layers3 className="h-3.5 w-3.5 text-[#13C6A2]" />
          Pages incluses dans ce modèle
        </span>
        <div className="flex flex-wrap gap-1.5">
          {template.pages.map((p) => (
            <span
              key={p.id}
              className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-full text-[#3B2416] border border-[#F0E7DA] shadow-2xs"
            >
              {p.pageNumber}. {p.categoryTag}
            </span>
          ))}
        </div>
      </div>

      {/* Bouton de sélection */}
      <button
        type="button"
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
          isSelected
            ? "bg-[#7D6AF8] text-white shadow-md"
            : "bg-[#F3EDE4] text-[#3B2416] hover:bg-[#EAE1D3]"
        }`}
      >
        <span>Choisir ce modèle</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
