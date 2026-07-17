"use client";
import React from "react";
import { Palette, UserPlus, Star, BarChart3, ChevronRight } from "lucide-react";

export default function QuickActionsWidget() {
  const actions = [
    { label: "Créer une activité", icon: Palette, color: "#7D6AF8", bg: "#7D6AF8/10" },
    { label: "Ajouter un élève", icon: UserPlus, color: "#EC4899", bg: "#EC4899/10" },
    { label: "Gérer les étoiles", icon: Star, color: "#F59E0B", bg: "#F59E0B/10" },
    { label: "Voir les rapports", icon: BarChart3, color: "#3B82F6", bg: "#3B82F6/10" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E7DA]">
      <h3 className="text-sm font-extrabold text-[#3B2416] mb-4">
        Actions rapides
      </h3>

      <div className="space-y-3">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-[#F5F0EB] transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: act.color + "1a" }} // 10% opacity hex hack
                >
                  <Icon className="w-4 h-4" style={{ color: act.color }} />
                </div>
                <span className="text-sm font-bold text-[#3B2416]">
                  {act.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A6A5E] group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
