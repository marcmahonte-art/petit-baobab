"use client";
import React from "react";
import { useSchoolStore } from "@/stores/school-store";
import { Palette, BookOpen, CheckSquare, Sparkles, HelpCircle } from "lucide-react";

export default function StarsUsage() {
  const { dashboardData, loading } = useSchoolStore();

  if (loading || !dashboardData) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E7DA] animate-pulse space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { stars_usage } = dashboardData;

  const categories = [
    {
      label: "Coloriages",
      value: stars_usage?.coloriages ?? 0,
      icon: Palette,
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      label: "Livres",
      value: stars_usage?.livres ?? 0,
      icon: BookOpen,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    {
      label: "Activités",
      value: stars_usage?.activites ?? 0,
      icon: CheckSquare,
      color: "#7D6AF8",
      bg: "#EDE9FE",
    },
    {
      label: "Bonus d'acquisition",
      value: stars_usage?.bonus ?? 0,
      icon: Sparkles,
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
    {
      label: "Autres",
      value: stars_usage?.autres ?? 0,
      icon: HelpCircle,
      color: "#6B7280",
      bg: "#F3F4F6",
    },
  ];

  const totalUsed = categories.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E7DA]">
      <h3 className="text-sm font-extrabold text-[#3B2416] mb-1">
        Utilisation des étoiles
      </h3>
      <p className="text-[11px] text-[#7A6A5E] font-medium mb-4">
        Répartition de l'utilisation des étoiles de la classe.
      </p>

      {totalUsed === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-[#7A6A5E] font-bold">Aucune étoile dépensée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            const percentage = totalUsed > 0 ? Math.round((cat.value / totalUsed) * 100) : 0;
            return (
              <div key={index} className="flex items-center gap-3">
                {/* Icon box */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>

                {/* Bar details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1 font-bold">
                    <span className="text-[#3B2416] truncate">{cat.label}</span>
                    <span className="text-[#7A6A5E]">{cat.value} ({percentage}%)</span>
                  </div>
                  {/* Slider bar */}
                  <div className="w-full h-2 bg-[#F5F0EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
