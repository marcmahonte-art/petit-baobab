"use client"

import Image from "next/image"
import { Play, MoreVertical, User, Sparkles } from "lucide-react"
import { Story } from "@/lib/stories/types"
import { cn } from "@/lib/utils"

interface StoryCardProps {
  story: Story
  onRead: (story: Story) => void
  compact?: boolean
}

export function StoryCard({ story, onRead, compact = false }: StoryCardProps) {
  return (
    <article
      onClick={() => onRead(story)}
      className="group relative bg-white rounded-[22px] md:rounded-[26px] border border-[#F0E7DA] p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#7D6AF8]/30 transition-all duration-200 cursor-pointer select-none"
    >
      <div>
        {/* Cover Image Container */}
        <div
          className={cn(
            "relative w-full rounded-[18px] md:rounded-[20px] overflow-hidden bg-[#FAF5EE] border border-[#F6EFE5]/80",
            compact ? "aspect-[175/96]" : "aspect-[178/148]"
          )}
        >
          <Image
            src={story.coverUrl}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Title & Options Row */}
        <div className="mt-3 flex items-start justify-between gap-1.5">
          <h3 className="font-extrabold text-[14px] sm:text-[15px] text-[#3B2416] leading-snug group-hover:text-[#7D6AF8] transition-colors line-clamp-1">
            {story.title}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="text-[#B5A599] hover:text-[#3B2416] p-0.5 rounded-full shrink-0"
            aria-label="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Description snippet */}
        <p className="text-[11px] sm:text-xs text-[#7A6A5E] font-medium line-clamp-2 mt-1 leading-relaxed">
          {story.description}
        </p>
      </div>

      {/* Footer / Badges & Play Button */}
      <div className="mt-3.5 pt-2 border-t border-[#F8F3EC] flex items-center justify-between gap-2">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Age Pill */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#F0EDFF] text-[#7D6AF8]">
            <User className="w-2.5 h-2.5" />
            {story.ageRange}
          </span>

          {/* Category Pill */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold"
            style={{
              backgroundColor: `${story.categoryColor}18`,
              color: story.categoryColor,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: story.categoryColor }} />
            {story.category}
          </span>
        </div>

        {/* Play / Read Button */}
        <button
          type="button"
          aria-label={`Lire ${story.title}`}
          onClick={(e) => {
            e.stopPropagation()
            onRead(story)
          }}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#7D6AF8] hover:bg-[#6852F6] text-white flex items-center justify-center shadow-xs group-hover:scale-110 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}
