"use client";

import React from "react";
import { MemoryBookTemplate } from "../../types/memory-book.types";
import { Sparkles, ArrowRight, Check } from "lucide-react";

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
      className={`relative cursor-pointer rounded-[28px] border-3 p-6 transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? "border-purple-600 bg-purple-50/40 shadow-lg scale-[1.02]"
          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
      }`}
    >
      {/* Badge du modèle */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          {template.coverBadge}
        </span>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Titre et description */}
      <div className="mb-6">
        <h3 className="font-black text-gray-900 text-lg md:text-xl mb-1.5">
          {template.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
          {template.description}
        </p>
      </div>

      {/* Aperçu des 9 pages incluses */}
      <div className="bg-gray-50 rounded-2xl p-3.5 mb-6 border border-gray-100">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Pages incluses dans ce modèle :
        </span>
        <div className="flex flex-wrap gap-1.5">
          {template.pages.map((p) => (
            <span
              key={p.id}
              className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md text-purple-900 border border-purple-100 shadow-2xs"
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
            ? "bg-purple-600 text-white shadow-md"
            : "bg-purple-100 text-purple-800 hover:bg-purple-200"
        }`}
      >
        <span>Choisir ce modèle</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
