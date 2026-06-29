"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DrawingCard } from "@/components/drawings/DrawingCard"
import { drawingService } from "@/features/drawings/DrawingService"
import type { DrawingSort, SavedDrawing } from "@/features/drawings/types"
import { useBookStore } from "@/features/coloring-book/store/useBookStore"

interface DrawingGalleryProps {
  refreshKey?: number
  onOpen: (drawing: SavedDrawing) => void
}

const PAGE_SIZE = 12

export function DrawingGallery({ refreshKey, onOpen }: DrawingGalleryProps) {
  const [drawings, setDrawings] = useState<SavedDrawing[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<DrawingSort>("recent")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    drawingService.list({ search, category, sort }).then(setDrawings)
  }, [search, category, sort, refreshKey])


  const categories = useMemo(() => {
    const values = new Set(drawings.map((drawing) => drawing.category))
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b, "fr"))]
  }, [drawings])

  const visibleDrawings = drawings.slice(0, visibleCount)

  const handleDelete = async (drawing: SavedDrawing) => {
    if (!window.confirm(`Supprimer "${drawing.name}" ?`)) return
    await drawingService.delete(drawing.id)
    setDrawings(await drawingService.list({ search, category, sort }))
  }

  const handleDownload = (drawing: SavedDrawing) => {
    const link = document.createElement("a")
    link.href = drawing.image
    link.download = `${drawing.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "mon-dessin"}.png`
    link.click()
  }

  const handlePrint = (drawing: SavedDrawing) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`<html><head><title>${drawing.name}</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:white}img{max-width:100%;max-height:100%;object-fit:contain}@media print{@page{size:A4 landscape;margin:0}img{width:100vw;height:100vh}}</style></head><body><img src="${drawing.image}" onload="window.print(); window.close();" /></body></html>`)
    printWindow.document.close()
  }

  const handleAddToBook = (drawing: SavedDrawing) => {
    const selectedImages = useBookStore.getState().selectedImages
    if (selectedImages.includes(drawing.id)) {
      alert("Ce dessin est déjà ajouté à votre livre !")
      return
    }

    useBookStore.getState().setSelectedImages((prev) => [...prev, drawing.id])
    alert(`✅ "${drawing.name}" a été ajouté à votre livre !`)
  }

  return (
    <section className="flex h-full flex-col gap-4 text-[#3B2416]">
      <div className="pr-8">
        <h2 className="text-2xl font-black text-[#261B4B]">Mes dessins</h2>
        <p className="mt-1 text-sm font-semibold text-[#7A6A5E]">Retrouve, continue, imprime ou telecharge tes coloriages.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A6A5E]" />
          <Input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE) }} placeholder="Rechercher un dessin" className="pl-12" />
        </label>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleCount(PAGE_SIZE) }} className="h-[54px] rounded-full border border-[#EFE7DB] bg-white px-5 text-sm font-black text-[#3B2416]">
          {categories.map((item) => (
            <option key={item} value={item}>{item === "all" ? "Toutes categories" : item}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => { setSort(event.target.value as DrawingSort); setVisibleCount(PAGE_SIZE) }} className="h-[54px] rounded-full border border-[#EFE7DB] bg-white px-5 text-sm font-black text-[#3B2416]">
          <option value="recent">Plus recent</option>
          <option value="oldest">Plus ancien</option>
          <option value="name">Nom</option>
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {drawings.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[8px] border border-dashed border-[#EFE7DB] bg-[#FFF9F2] p-8 text-center text-sm font-bold text-[#7A6A5E]">
            Aucun dessin enregistre pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDrawings.map((drawing) => (
              <DrawingCard key={drawing.id} drawing={drawing} onOpen={onOpen} onDelete={handleDelete} onDownload={handleDownload} onPrint={handlePrint} onAddToBook={handleAddToBook} />
            ))}
          </div>
        )}
      </div>

      {visibleCount < drawings.length && (
        <button onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="mx-auto h-11 rounded-full bg-[#261B4B] px-6 text-sm font-black text-white">
          Afficher plus
        </button>
      )}
    </section>
  )
}

