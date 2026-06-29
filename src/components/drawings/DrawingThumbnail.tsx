"use client"

import type { SavedDrawing } from "@/features/drawings/types"

interface DrawingThumbnailProps {
  drawing: SavedDrawing
}

export function DrawingThumbnail({ drawing }: DrawingThumbnailProps) {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-[#EFE7DB] bg-[#FFF9F2]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={drawing.thumbnail || drawing.image}
        alt={drawing.name}
        className="h-full w-full object-contain p-2"
        loading="lazy"
      />
    </div>
  )
}
