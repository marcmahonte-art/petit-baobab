"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Plus, School } from "lucide-react";
import { useSchoolStore } from "@/stores/school-store";
import ClassCard from "./ClassCard";

interface ClassesGridProps {
  onShareClass?: (cls: any) => void;
}

export default function ClassesGrid({ onShareClass }: ClassesGridProps) {
  const { dashboardData, loading } = useSchoolStore();
  const router = useRouter();

  if (loading || !dashboardData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E7DA] h-[320px] animate-pulse space-y-4"
          >
            <div className="h-[130px] bg-gray-200 rounded-xl w-full" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { classrooms } = dashboardData;

  if (classrooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-dashed border-[#F0E7DA] text-center min-h-[300px]">
        <School className="w-10 h-10 mb-3 text-[#7A6A5E]" />
        <h3 className="text-base font-extrabold text-[#3B2416]">
          Aucune classe active
        </h3>
        <p className="text-xs text-[#7A6A5E] max-w-sm mt-1 mb-6 font-medium leading-normal">
          Vous n'avez pas encore créé de classe. Créez votre première classe pour commencer à suivre vos élèves.
        </p>
        <button
          onClick={() => router.push("/school/classes/create")}
          className="flex items-center gap-1.5 px-5 py-3 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-xs rounded-xl shadow-md shadow-[#7D6AF8]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer ma première classe</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {classrooms.map((cls, idx) => (
        <ClassCard
          key={cls.id}
          cls={cls}
          index={idx}
          onClick={() => router.push(`/school/classes/${cls.id}`)}
          onShare={() => onShareClass?.(cls)}
        />
      ))}
    </div>
  );
}
