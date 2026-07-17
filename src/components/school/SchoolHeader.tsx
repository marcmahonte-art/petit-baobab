"use client";
import React from "react";
import Image from "next/image";
import { Bell, Star } from "lucide-react";

interface SchoolHeaderProps {
  teacherName: string;
  teacherRole: string;
  starsRemaining: number;
  avatar?: string | null;
}

export default function SchoolHeader({
  teacherName,
  teacherRole,
  starsRemaining,
  avatar,
}: SchoolHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-extrabold text-[#3B2416]">
          Bonjour, {teacherName} ! 👋
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
            {starsRemaining}
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
            {avatar ? (
              <Image
                src={avatar}
                alt={teacherName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              teacherName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
            )}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-[#3B2416]">{teacherName}</p>
            <p className="text-xs text-[#7A6A5E]">{teacherRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
