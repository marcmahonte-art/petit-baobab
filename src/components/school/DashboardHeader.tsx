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
    <header className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm border border-[#F0E7DA]">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-extrabold text-[#3B2416]">
          Bonjour, {teacher.name} ! 👋
        </h1>
        <p className="text-sm text-[#7A6A5E] font-medium">
          Bienvenue dans votre espace enseignant.
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Stars remaining badge */}
        <div className="flex items-center gap-1.5 bg-[#FFF8E1] border border-[#FFE08A] px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
          <span className="text-sm font-bold text-[#3B2416]">
            {stars.remaining}
          </span>
          <span className="text-xs font-medium text-[#7A6A5E]">
            étoiles restantes
          </span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-[#F5F0EB] transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-[#7A6A5E]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7D6AF8] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
