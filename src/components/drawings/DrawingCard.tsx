"use client"

import { Download, Edit3, FolderOpen, Palette, Printer, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DrawingThumbnail } from "@/components/drawings/DrawingThumbnail"
import type { SavedDrawing } from "@/features/drawings/types"

interface DrawingCardProps {
  drawing: SavedDrawing
  onOpen: (drawing: SavedDrawing) => void
  onRename: (drawing: SavedDrawing) => void
  onDelete: (drawing: SavedDrawing) => void
  onDownload: (drawing: SavedDrawing) => void
  onPrint: (drawing: SavedDrawing) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))

export function DrawingCard({ drawing, onOpen, onRename, onDelete, onDownload, onPrint }: DrawingCardProps) {
  const isCompleted = drawing.progress === "completed"

  return (
    <article className="rounded-[8px] border border-[#EFE7DB] bg-white p-3 shadow-[0_4px_14px_rgba(59,36,22,0.07)]">
      <DrawingThumbnail drawing={drawing} />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-[#261B4B]">{drawing.name}</h3>
          <p className="mt-0.5 text-xs font-semibold text-[#7A6A5E]">{formatDate(drawing.createdAt)} - {drawing.category}</p>
        </div>
        <span className={isCompleted ? "shrink-0 rounded-full bg-[#25C76F]/15 px-2.5 py-1 text-[11px] font-black text-[#18884E]" : "shrink-0 rounded-full bg-[#FFD53D]/25 px-2.5 py-1 text-[11px] font-black text-[#7A5200]"}>
          {isCompleted ? "Trophee Termine" : "En cours"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button onClick={() => onOpen(drawing)} className="h-10 rounded-full bg-[#7C57FF] text-xs font-black text-white hover:bg-[#6E4EF5]">
          <FolderOpen className="mr-1.5 h-4 w-4" /> Ouvrir
        </Button>
        <Button onClick={() => onOpen(drawing)} className="h-10 rounded-full bg-[#FFD53D] text-xs font-black text-[#3B2416] hover:bg-[#FFD53D]/90">
          <Palette className="mr-1.5 h-4 w-4" /> Continuer
        </Button>
        <Button onClick={() => onRename(drawing)} variant="outline" className="h-10 rounded-full border-[#EFE7DB] text-xs font-black">
          <Edit3 className="mr-1.5 h-4 w-4" /> Renommer
        </Button>
        <Button onClick={() => onDelete(drawing)} variant="outline" className="h-10 rounded-full border-[#FFE0E0] text-xs font-black text-[#D63B3B] hover:bg-[#FFF2F2]">
          <Trash2 className="mr-1.5 h-4 w-4" /> Supprimer
        </Button>
        <Button onClick={() => onDownload(drawing)} variant="outline" className="h-10 rounded-full border-[#EFE7DB] text-xs font-black">
          <Download className="mr-1.5 h-4 w-4" /> Telecharger
        </Button>
        <Button onClick={() => onPrint(drawing)} variant="outline" className="h-10 rounded-full border-[#EFE7DB] text-xs font-black">
          <Printer className="mr-1.5 h-4 w-4" /> Imprimer
        </Button>
      </div>
    </article>
  )
}
