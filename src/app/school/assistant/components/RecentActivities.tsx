"use client";

import React from "react";
import { Clock, Sparkles, ChevronRight } from "lucide-react";

export interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  date: string;
  stars: number;
}

const MOCK_RECENTS: RecentActivityItem[] = [
  {
    id: "rec_1",
    title: "Séquence d'éveil",
    subtitle: "Activité complète sur la savane",
    tag: "Maternelle",
    date: "Aujourd'hui, 09:40",
    stars: 5,
  },
  {
    id: "rec_2",
    title: "Fiche de graphisme",
    subtitle: "Tracer et manipuler (traits & boucles)",
    tag: "Maternelle",
    date: "Hier",
    stars: 5,
  },
  {
    id: "rec_3",
    title: "Évaluation informelle",
    subtitle: "Observer et suivre le langage",
    tag: "Maternelle",
    date: "14 août",
    stars: 5,
  },
  {
    id: "rec_4",
    title: "Activité d'éveil",
    subtitle: "Pour les tout-petits (tissus & graines)",
    tag: "Crèche",
    date: "12 août",
    stars: 5,
  },
  {
    id: "rec_5",
    title: "Fiche routine",
    subtitle: "Organisation journalière 6 mois - 2 ans",
    tag: "Crèche",
    date: "10 août",
    stars: 5,
  },
];

interface RecentActivitiesProps {
  onSelectRecent?: (item: RecentActivityItem) => void;
}

export default function RecentActivities({ onSelectRecent }: RecentActivitiesProps) {
  return (
    <div className="space-y-3 bg-white border border-[#EDE3D5] rounded-3xl p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-[#35180D] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FF8A00]" />
          <span>Récemment utilisés</span>
        </h3>
        <span className="text-xs font-bold text-[#FF8A00] flex items-center gap-1 cursor-pointer hover:underline">
          Voir tout <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Horizontal Scroll Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {MOCK_RECENTS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectRecent && onSelectRecent(item)}
            className="min-w-[220px] max-w-[240px] p-4 bg-[#FFFDF8] border border-[#E8DFC9] hover:border-[#FF8A00] hover:shadow-xs rounded-2xl transition-all duration-200 cursor-pointer shrink-0 space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F9E8] text-[#65A916]">
                  {item.tag}
                </span>
                <span className="text-[10px] text-[#90847B] font-medium">{item.date}</span>
              </div>
              <h4 className="font-bold text-sm text-[#35180D] line-clamp-1">{item.title}</h4>
              <p className="text-xs text-[#7A6A5E] line-clamp-2 leading-tight">{item.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-[#F0E7DA] flex items-center justify-between text-[11px] font-bold text-[#6535E8]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Revoir
              </span>
              <span className="text-[#35180D]">{item.stars} ✦</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
