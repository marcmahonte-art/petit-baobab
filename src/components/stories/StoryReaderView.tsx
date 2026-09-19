"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { OpenBookView } from "./OpenBookView"
import type { Story } from "@/lib/stories/types"

interface StoryReaderViewProps {
  story: Story
}

export function StoryReaderView({ story }: StoryReaderViewProps) {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto my-2 gap-3">
      {/* Top back link */}
      <div className="flex items-center justify-between px-2">
        <Link
          href="/histoires"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F0E7DA]/50 text-[#3B2416] font-bold text-xs sm:text-sm border border-[#EFE7DB] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Catalogue d&apos;histoires</span>
        </Link>
      </div>

      {/* The Realistic Open Book Component */}
      <div className="bg-[#F7F3EA] rounded-3xl border border-[#E3D8C6] overflow-hidden shadow-md">
        <OpenBookView
          story={story}
          authorName={story.authorName || story.characterName || "MARC MAHONTE"}
        />
      </div>
    </div>
  )
}
