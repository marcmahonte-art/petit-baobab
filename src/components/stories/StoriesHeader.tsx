"use client"

import { Search, Bell, ChevronDown, Sparkles, X } from "lucide-react"
import Image from "next/image"

interface StoriesHeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  userName?: string
  avatarUrl?: string
}

export function StoriesHeader({
  searchQuery,
  onSearchChange,
  userName = "Moussa",
  avatarUrl = "/illustrations/histoires/avatar-moussa.webp",
}: StoriesHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 select-none">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9C8E82]">
          <Search className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une histoire..."
          className="w-full h-11 md:h-12 pl-11 md:pl-12 pr-4 bg-[#F5EFEB]/90 hover:bg-[#F5EFEB] focus:bg-white text-[#3B2416] placeholder-[#A49488] text-sm md:text-base font-semibold rounded-full border border-transparent focus:border-[#7D6AF8]/40 focus:outline-none transition-all duration-200 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-[#A49488] hover:text-[#3B2416]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right controls: Notification & Profile */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#EFE7DB] flex items-center justify-center text-[#5A4538] hover:text-[#7D6AF8] hover:border-[#7D6AF8]/30 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5E83] ring-2 ring-white animate-pulse" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 md:gap-3 pl-1.5 pr-3 py-1 bg-white rounded-full border border-[#EFE7DB] shadow-2xs cursor-pointer hover:border-[#7D6AF8]/30 transition-all">
          <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-[#FFD95C] bg-[#FFF4D6] shrink-0">
            <Image
              src={avatarUrl}
              alt={userName}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <span className="text-sm font-bold text-[#3B2416] hidden sm:inline">
            {userName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A796E]" />
        </div>
      </div>
    </header>
  )
}
