"use client";
import React from "react";
import { StudentActivityFeed } from "@/types/school";
import { Star } from "lucide-react";

interface RecentActivitiesProps {
  activities: StudentActivityFeed[];
  onViewAll?: () => void;
}

const mascotColors: Record<string, string> = {
  Ali: "bg-[#FFE08A] text-[#3B2416]",
  Awa: "bg-[#D1FAE5] text-[#10B981]",
  Moussa: "bg-[#DBEAFE] text-[#3B82F6]",
  Fatou: "bg-[#FCE7F3] text-[#EC4899]",
  default: "bg-[#EDE9FE] text-[#7D6AF8]",
};

function getMascotColor(name: string) {
  return mascotColors[name] || mascotColors.default;
}

function formatActivityDate(dateStr: string): { time: string; relative: string } {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    const time = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    if (diffHours < 24) {
      return { time, relative: "Aujourd'hui" };
    } else if (diffHours < 48) {
      return { time, relative: "Hier" };
    } else {
      return { time, relative: date.toLocaleDateString("fr-FR") };
    }
  } catch {
    return { time: "", relative: dateStr };
  }
}

export default function RecentActivities({
  activities,
  onViewAll,
}: RecentActivitiesProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E7DA]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-extrabold text-[#3B2416]">
          Activités récentes
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#7D6AF8] hover:text-[#6552E8] bg-[#7D6AF8]/10 hover:bg-[#7D6AF8]/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          Voir tout
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((act) => {
          const { time, relative } = formatActivityDate(act.created_at);
          const isLogin = act.action === "login";

          return (
            <div
              key={act.id}
              className="flex items-start justify-between gap-4 pb-4 border-b border-[#F5F0EB] last:border-0 last:pb-0"
            >
              {/* Avatar column */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 select-none ${getMascotColor(
                    act.student_name
                  )}`}
                >
                  {act.student_name ? act.student_name[0] : "É"}
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-[#3B2416] leading-snug">
                    <span className="font-extrabold">{act.student_name}</span>{" "}
                    <span className="font-medium text-[#5C4A3E]">{act.action_label}</span>
                  </p>
                  {act.action_detail && (
                    <p className="text-xs font-semibold text-[#7A6A5E] mt-0.5">
                      {act.action_detail}
                    </p>
                  )}
                </div>
              </div>

              {/* Time and Stars Column */}
              <div className="flex items-center gap-4 shrink-0 text-right">
                <div className="text-[10px] text-[#7A6A5E] font-medium leading-tight">
                  <p>{time}</p>
                  <p>{relative}</p>
                </div>

                {/* Stars earned badge */}
                {!isLogin && act.stars_earned > 0 ? (
                  <div className="flex items-center gap-1 bg-[#FEF3C7] border border-[#FFE08A] px-2.5 py-1 rounded-lg shrink-0">
                    <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xs font-bold text-[#F59E0B]">
                      +{act.stars_earned}
                    </span>
                  </div>
                ) : (
                  <div className="w-[45px]" /> // Placeholder for alignment
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
