"use client";
import React from "react";
import Image from "next/image";
import { Bell, Star } from "lucide-react";
import { useSchoolStore } from "@/stores/school-store";

export default function DashboardHeader() {
  const { dashboardData, loading } = useSchoolStore();

  if (loading || !dashboardData) {
    return (
      <header className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm animate-pulse border border-[#F0E7DA]">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-32 bg-gray-200 rounded-full" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
      </header>
    );
  }

  const { teacher, stars } = dashboardData;

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 bg-white rounded-2xl shadow-sm border border-[#F0E7DA]">
      {/* Greeting */}
       <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-extrabold text-[#3B2416] truncate">
          Bonjour, {teacher.name} ! 👋
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6A5E] font-medium">
          {teacher.school_name
            ? teacher.school_name
            : "Bienvenue dans votre espace enseignant."}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 self-end sm:self-auto">
        {/* Stars remaining badge */}
        <div className="flex items-center gap-1 bg-[#FFF8E1] border border-[#FFE08A] px-2 sm:px-3 py-1.5 rounded-full shrink-0">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB300] fill-[#FFB300]" />
          <span className="text-sm font-bold text-[#3B2416] leading-none">
            {stars.remaining}
          </span>
          <span className="hidden sm:inline text-xs font-medium text-[#7A6A5E] leading-none">
            étoiles restantes
          </span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-[#F5F0EB] transition-colors cursor-pointer shrink-0">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#7A6A5E]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#7D6AF8] flex items-center justify-center text-white font-bold text-xs sm:text-sm overflow-hidden">
            {teacher.avatar ? (
              <Image
                src={teacher.avatar}
                alt={teacher.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              teacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-[#3B2416]">{teacher.name}</p>
            <p className="text-xs text-[#7A6A5E]">{teacher.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
