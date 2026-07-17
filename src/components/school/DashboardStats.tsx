"use client";
import React from "react";
import { motion } from "framer-motion";
import { useSchoolStore } from "@/stores/school-store";
import {
  GraduationCap,
  Users,
  Palette,
  BookOpen,
  Star,
} from "lucide-react";

const statCards = [
  {
    key: "classes",
    icon: GraduationCap,
    bgIcon: "#EDE9FE",
    colorIcon: "#7D6AF8",
    labelFr: "Classes actives",
  },
  {
    key: "students",
    icon: Users,
    bgIcon: "#FCE7F3",
    colorIcon: "#EC4899",
    labelFr: "Élèves inscrits",
  },
  {
    key: "coloriages",
    icon: Palette,
    bgIcon: "#D1FAE5",
    colorIcon: "#10B981",
    labelFr: "Coloriages réalisés",
  },
  {
    key: "books",
    icon: BookOpen,
    bgIcon: "#DBEAFE",
    colorIcon: "#3B82F6",
    labelFr: "Livres créés",
  },
  {
    key: "stars",
    icon: Star,
    bgIcon: "#FEF3C7",
    colorIcon: "#F59E0B",
    labelFr: "Étoiles disponibles",
  },
];

export default function DashboardStats() {
  const { dashboardData, loading } = useSchoolStore();

  if (loading || !dashboardData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#F0E7DA] animate-pulse"
          >
            <div className="w-11 h-11 bg-gray-200 rounded-xl" />
            <div className="space-y-1 flex-1">
              <div className="h-5 w-12 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { summary, stars } = dashboardData;

  const values: Record<string, string | number> = {
    classes: summary.total_classes,
    students: summary.total_students,
    coloriages: summary.total_drawings,
    books: summary.total_books,
    stars: `${stars.balance}`,
  };

  const subValues: Record<string, string> = {
    stars: `/${stars.monthly_limit}`,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#F0E7DA] hover:shadow-md transition-shadow"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: card.bgIcon }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: card.colorIcon }}
                fill={card.key === "stars" ? card.colorIcon : "none"}
              />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#3B2416] leading-tight">
                {values[card.key]}
                {subValues[card.key] && (
                  <span className="text-xs font-medium text-[#7A6A5E]">
                    {subValues[card.key]}
                  </span>
                )}
              </p>
              <p className="text-[11px] font-medium text-[#7A6A5E] leading-tight">
                {card.labelFr}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
