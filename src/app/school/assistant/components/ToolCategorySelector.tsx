"use client";

import React, { useState } from "react";
import { ASSISTANT_PROMPTS, Persona, PromptTemplate } from "@/lib/assistant/prompts";
import { Sparkles, Palette, BookOpen, Dices, Lightbulb, FileText, Music, ClipboardList, Check } from "lucide-react";

interface ToolCategorySelectorProps {
  selectedPersona: Persona;
  selectedPromptId: string | null;
  onSelectPrompt: (prompt: PromptTemplate) => void;
}

export default function ToolCategorySelector({
  selectedPersona,
  selectedPromptId,
  onSelectPrompt,
}: ToolCategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filter prompts for selected persona and priority v1
  const availablePrompts = ASSISTANT_PROMPTS.filter(
    (p) => p.persona === selectedPersona && p.priority === "v1"
  );

  const categories = [
    { id: "all", label: "Tous les outils", icon: Sparkles },
    { id: "pedagogie", label: "Pédagogie & Séquences", icon: Lightbulb },
    { id: "activites", label: "Activités & Graphisme", icon: Palette },
    { id: "communication", label: "Communication parents", icon: BookOpen },
    { id: "administration", label: "Administration & Routines", icon: ClipboardList },
  ];

  const filteredPrompts = activeCategory === "all"
    ? availablePrompts
    : availablePrompts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-[#35180D] flex items-center gap-2">
          <span>2. Choix de l'outil</span>
        </h2>
        <p className="text-sm text-[#7A6A5E] font-medium mt-1">
          Que souhaitez-vous générer aujourd'hui pour vos enfants ?
        </p>
      </div>

      {/* Category Tabs / Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#FF8A00] text-white shadow-xs"
                  : "bg-white border border-[#E8DFC9] text-[#7A6A5E] hover:bg-[#FFF8EE]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredPrompts.length > 0 ? (
          filteredPrompts.map((prompt) => {
            const isSelected = selectedPromptId === prompt.id;
            return (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                  isSelected
                    ? "bg-[#FFF3E3] border-2 border-[#FF8A00] shadow-sm scale-[1.01]"
                    : "bg-white border border-[#E8DFC9] hover:border-[#FF8A00]/60 hover:shadow-xs"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="space-y-1.5 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
                    <h3 className="font-extrabold text-sm sm:text-base text-[#35180D] group-hover:text-[#FF8A00] transition-colors">
                      {prompt.label}
                    </h3>
                  </div>
                  <p className="text-xs text-[#7A6A5E] line-clamp-2 leading-relaxed">
                    {prompt.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F0E7DA] flex items-center justify-between text-[11px] text-[#90847B] font-medium">
                  <span>{prompt.fields.length} paramètre{prompt.fields.length > 1 ? "s" : ""}</span>
                  <span className="font-bold text-[#FF8A00] group-hover:translate-x-0.5 transition-transform">
                    Sélectionner →
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center bg-white border border-dashed border-[#E8DFC9] rounded-2xl">
            <p className="text-sm text-[#7A6A5E] font-medium">
              Aucun outil trouvé dans cette catégorie pour ce profil.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
