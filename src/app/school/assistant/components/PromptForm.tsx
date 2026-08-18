"use client";

import React from "react";
import { PromptTemplate, PromptField } from "@/lib/assistant/prompts";
import { Sparkles, Star } from "lucide-react";

interface PromptFormProps {
  prompt: PromptTemplate;
  formValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  starCost?: number;
}

export default function PromptForm({
  prompt,
  formValues,
  onFieldChange,
  onGenerate,
  isGenerating,
  starCost = 5,
}: PromptFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <div className="space-y-5 bg-white border border-[#EDE3D5] rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="border-b border-[#F0E7DA] pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3ECFF] text-[#6535E8] rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{prompt.label}</span>
        </div>
        <h2 className="text-xl font-extrabold text-[#35180D]">
          3. Personnalisez les paramètres
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6A5E] mt-1">
          Renseignez les critères spécifiques pour un résultat parfaitement adapté à votre classe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {prompt.fields.map((field: PromptField) => {
          const value = formValues[field.key] ?? field.defaultValue ?? "";

          return (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-[#35180D]">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <select
                  value={value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DFC9] bg-[#FFFDF8] text-sm text-[#35180D] font-medium focus:outline-none focus:border-[#6535E8] focus:ring-2 focus:ring-[#6535E8]/20 transition-all cursor-pointer"
                >
                  <option value="" disabled>Sélectionner...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#E8DFC9] bg-[#FFFDF8] text-sm text-[#35180D] font-medium focus:outline-none focus:border-[#6535E8] focus:ring-2 focus:ring-[#6535E8]/20 transition-all resize-none"
                />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  min={field.min}
                  max={field.max}
                  value={value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E8DFC9] bg-[#FFFDF8] text-sm text-[#35180D] font-medium focus:outline-none focus:border-[#6535E8] focus:ring-2 focus:ring-[#6535E8]/20 transition-all"
                />
              )}
            </div>
          );
        })}

        {/* Form Action Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full h-13 bg-gradient-to-r from-[#6535E8] to-[#7D6AF8] hover:from-[#542AC4] hover:to-[#6535E8] text-white font-extrabold text-base rounded-2xl shadow-md shadow-[#6535E8]/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            <span>Générer cette activité</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              {starCost} étoiles
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
