"use client";
import React from "react";
import { useSchoolStore } from "@/stores/school-store";
import { Award, Target, Trophy } from "lucide-react";

export default function ProgressChart() {
  const { dashboardData, loading } = useSchoolStore();

  if (loading || !dashboardData) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E7DA] animate-pulse space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const { classrooms } = dashboardData;

  if (classrooms.length === 0) {
    return null;
  }

  // Calculate average progression
  const totalProgression = classrooms.reduce((sum, cls) => sum + cls.completion_percentage, 0);
  const averageProgression = Math.round(totalProgression / classrooms.length);

  const isExcellent = averageProgression >= 80;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0E7DA] space-y-5">
      <div>
        <h3 className="text-sm font-extrabold text-[#3B2416] mb-1">
          Progression globale
        </h3>
        <p className="text-[11px] text-[#7A6A5E] font-medium">
          Moyenne de complétion des activités par classe.
        </p>
      </div>

      {/* Average score circle card */}
      <div className="flex items-center gap-4 bg-[#FFFDF8] border border-[#F0E7DA] p-4 rounded-xl">
        <div className="w-14 h-14 rounded-full border-4 border-[#7D6AF8] flex items-center justify-center font-black text-lg text-[#7D6AF8] bg-white shrink-0">
          {averageProgression}%
        </div>
        <div>
          <h4 className="text-xs font-black text-[#3B2416]">
            Moyenne des classes
          </h4>
          <p className="text-[11px] text-[#7A6A5E] font-medium leading-normal mt-0.5">
            Vos élèves ont validé en moyenne {averageProgression}% de leurs activités.
          </p>
        </div>
      </div>

      {/* List of classes progress */}
      <div className="space-y-3">
        {classrooms.slice(0, 4).map((cls) => (
          <div key={cls.id} className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#3B2416]">
              <span>{cls.name}</span>
              <span>{cls.completion_percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F5F0EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cls.completion_percentage}%`,
                  backgroundColor: cls.color_badge,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement Card (Bravo / Continue) */}
      <div
        className={`p-4 rounded-xl flex items-center gap-3 border ${
          isExcellent
            ? "bg-[#E8F8F0] border-[#A7F3D0] text-[#065F46]"
            : "bg-[#FFF8E1] border-[#FFE08A] text-[#92400E]"
        }`}
      >
        {isExcellent ? (
          <Trophy className="w-5 h-5 text-[#047857] shrink-0" />
        ) : (
          <Target className="w-5 h-5 text-[#B45309] shrink-0" />
        )}
        <div className="text-xs leading-normal">
          <p className="font-extrabold">
            {isExcellent ? "Bravo !" : "Continue !"}
          </p>
          <p className="font-semibold text-opacity-80">
            {isExcellent
              ? "Vos classes avancent à un rythme exceptionnel."
              : "Encouragez vos élèves à terminer leurs coloriages et livres pour augmenter le score."}
          </p>
        </div>
      </div>
    </div>
  );
}
