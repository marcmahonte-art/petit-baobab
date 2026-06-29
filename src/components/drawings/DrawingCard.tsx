import { Download, FolderOpen, Printer, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DrawingThumbnail } from "@/components/drawings/DrawingThumbnail"
import type { SavedDrawing } from "@/features/drawings/types"

interface DrawingCardProps {
  drawing: SavedDrawing
  onOpen: (drawing: SavedDrawing) => void
  onDelete: (drawing: SavedDrawing) => void
  onDownload: (drawing: SavedDrawing) => void
  onPrint: (drawing: SavedDrawing) => void
  onAddToBook: (drawing: SavedDrawing) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))

export function DrawingCard({ drawing, onOpen, onDelete, onDownload, onPrint, onAddToBook }: DrawingCardProps) {
  const badgeInfo = !drawing.isColored
    ? { label: "Nouveau", className: "shrink-0 rounded-full bg-[#60A5FA]/15 px-2.5 py-1 text-[11px] font-black text-[#1D4ED8]" }
    : drawing.status === "completed"
      ? { label: "Terminé", className: "shrink-0 rounded-full bg-[#25C76F]/15 px-2.5 py-1 text-[11px] font-black text-[#18884E]" }
      : { label: "En cours", className: "shrink-0 rounded-full bg-[#FFD53D]/25 px-2.5 py-1 text-[11px] font-black text-[#7A5200]" }

  return (
    <article className="rounded-[18px] border border-[#EFE7DB] bg-white p-4 shadow-[0_4px_14px_rgba(59,36,22,0.07)] flex flex-col justify-between">
      <div>
        <DrawingThumbnail drawing={drawing} />

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[#261B4B]">{drawing.name}</h3>
            <p className="mt-0.5 text-xs font-semibold text-[#7A6A5E]">{formatDate(drawing.createdAt)} - {drawing.category}</p>
          </div>
          <span className={badgeInfo.className}>
            {badgeInfo.label}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={() => onOpen(drawing)} className="w-full h-10 rounded-full bg-[#7C57FF] text-xs font-black text-white hover:bg-[#6E4EF5] cursor-pointer">
          <FolderOpen className="mr-1.5 h-4 w-4" /> Ouvrir pour continuer
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onDownload(drawing)} variant="outline" className="h-10 rounded-full border-[#EFE7DB] text-xs font-black cursor-pointer">
            <Download className="mr-1.5 h-4 w-4" /> Télécharger
          </Button>
          <Button onClick={() => onPrint(drawing)} variant="outline" className="h-10 rounded-full border-[#EFE7DB] text-xs font-black cursor-pointer">
            <Printer className="mr-1.5 h-4 w-4" /> Imprimer
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onAddToBook(drawing)} className="h-10 rounded-full bg-[#22C55E] hover:bg-[#1EAE52] text-white text-xs font-black cursor-pointer">
            <Sparkles className="mr-1.5 h-4 w-4 fill-current" /> Ajouter au livre
          </Button>
          <Button onClick={() => onDelete(drawing)} variant="outline" className="h-10 rounded-full border-[#FFE0E0] text-xs font-black text-[#D63B3B] hover:bg-[#FFF2F2] cursor-pointer">
            <Trash2 className="mr-1.5 h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>
    </article>
  )
}
