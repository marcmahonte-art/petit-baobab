"use client"

import { useRef, useState } from "react"
import { ColoringHeader } from "@/components/coloring-header"
import { DrawingToolsPanel } from "@/components/drawing-tools-panel"
import { CanvasCard, CanvasCardRef } from "@/components/canvas-card"
import { ColorPalette } from "@/components/color-palette"
import { BrushSizeSlider } from "@/components/brush-size-slider"
import { MyDrawingsGrid } from "@/components/my-drawings-grid"
import { CategoryTabs } from "@/components/category-tabs"
import { FooterActions } from "@/components/footer-actions"
import { RewardPopup } from "@/components/reward-popup"
import { DrawingGallery } from "@/components/drawings/DrawingGallery"
import { SaveDrawingModal } from "@/components/drawings/SaveDrawingModal"
import { drawingService } from "@/features/drawings/DrawingService"
import type { SavedDrawing } from "@/features/drawings/types"
import { useColoringStore } from "@/lib/store"
import { useBookStore } from "@/features/coloring-book/store/useBookStore"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sliders } from "lucide-react"

export function ColoringPage() {
  const canvasRef = useRef<CanvasCardRef>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)
  const [toast, setToast] = useState("")

  const {
    currentDrawing,
    setCurrentDrawing,
    setSaved,
    setAddedToLivre,
    clearHistory,
    activeSavedDrawingId,
    setActiveSavedDrawingId,
  } = useColoringStore()

  const handleUndo = () => canvasRef.current?.undo()
  const handleRedo = () => canvasRef.current?.redo()
  const handleZoomIn = () => canvasRef.current?.zoomIn()
  const handleZoomOut = () => canvasRef.current?.zoomOut()

  const handleClearAll = () => {
    if (confirm("Voulez-vous vraiment effacer tout votre dessin ?")) {
      canvasRef.current?.clearAll()
      clearHistory()
    }
  }

  const handleDownload = () => canvasRef.current?.download()
  const handlePrint = () => canvasRef.current?.print()

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2200)
  }

  const handleSave = async () => {
    const snapshot = await canvasRef.current?.saveDrawing()
    if (!snapshot) return

    const savedResult = await drawingService.save(snapshot, activeSavedDrawingId)
    setActiveSavedDrawingId(savedResult.id)
    setSaved(true)
    setGalleryRefreshKey((key) => key + 1)
    showToast('✅ Votre dessin a été enregistré dans "Mes dessins".')
  }

  const handleOpenSavedDrawing = (drawing: SavedDrawing) => {
    setCurrentDrawing(drawing.template)
    setActiveSavedDrawingId(drawing.id)
    setIsGalleryOpen(false)

    window.setTimeout(() => {
      canvasRef.current?.loadSavedDrawing(drawing)
    }, currentDrawing.id === drawing.template.id ? 0 : 250)
  }

  const handleAddToBook = async () => {
    const snapshot = await canvasRef.current?.saveDrawing()
    if (!snapshot) return

    const savedResult = await drawingService.save(snapshot, activeSavedDrawingId)
    setActiveSavedDrawingId(savedResult.id)
    setSaved(true)
    setGalleryRefreshKey((key) => key + 1)

    const selectedImages = useBookStore.getState().selectedImages
    if (!selectedImages.includes(savedResult.id)) {
      useBookStore.getState().setSelectedImages((prev) => [...prev, savedResult.id])
    }

    setAddedToLivre(true)
    showToast("✅ Dessin enregistré et ajouté au livre !")
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] p-[24px] flex flex-col gap-[20px] font-sans overflow-x-hidden relative max-w-[1440px] mx-auto select-none">
      <SaveDrawingModal open={Boolean(toast)} message={toast} />

      <div className="w-full shrink-0">
        <ColoringHeader
          onDownload={handleDownload}
          onPrint={handlePrint}
          onOpenDrawings={() => setIsGalleryOpen(true)}
        />
      </div>

      <Sheet open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <SheetContent side="right" className="w-full overflow-hidden bg-[#FFF9F2] p-5 sm:max-w-[920px]">
          <DrawingGallery refreshKey={galleryRefreshKey} onOpen={handleOpenSavedDrawing} />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_320px] gap-[20px] items-start">
        <div className="hidden md:block sticky top-6 shrink-0 w-[220px]">
          <DrawingToolsPanel
            onUndo={handleUndo}
            onRedo={handleRedo}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="flex flex-col gap-[20px] min-w-0 md:col-span-1 xl:col-span-1">
          <div className="h-auto md:h-[90px] flex flex-col items-center justify-center gap-2 text-center select-none py-2 md:py-0">
            <h1 className="text-3xl sm:text-4xl md:text-[54px] font-extrabold text-[#261B4B] leading-none tracking-tight">
              {currentDrawing.name}
            </h1>
            <p className="text-base sm:text-lg md:text-[22px] font-medium text-[#7A6A5E]">
              Amuse-toi a colorier ton dessin !
            </p>
          </div>

          <CanvasCard ref={canvasRef} />

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-[16px] w-full">
            <div className="bg-white rounded-[28px] border border-[#EFE7DB] p-[18px] flex items-center gap-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] min-w-0 overflow-hidden">
              <ColorPalette />
            </div>
            <div className="w-full sm:w-[180px] bg-white rounded-[28px] border border-[#EFE7DB] p-[20px] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] shrink-0">
              <BrushSizeSlider />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row xl:flex-col gap-[20px] md:col-span-2 xl:col-span-1 w-full xl:w-[320px]">
          <div className="bg-white rounded-[28px] border border-[#EFE7DB] p-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex-1">
            <MyDrawingsGrid />
          </div>

          <div className="bg-white rounded-[28px] border border-[#EFE7DB] p-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex-1">
            <CategoryTabs />
          </div>
        </div>
      </div>

      <div className="w-full shrink-0 mt-auto pt-4">
        <FooterActions onSave={handleSave} onAddToBook={handleAddToBook} />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="md:hidden fixed bottom-24 right-6 z-50 w-[64px] h-[64px] rounded-full bg-[#7C57FF] shadow-xl text-white p-0 flex items-center justify-center"
            size="icon"
          >
            <Sliders className="w-8 h-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] bg-[#FFF9F2] p-6">
          <div className="pt-8">
            <h3 className="font-extrabold text-lg text-[#2D1846]">Outils de dessin</h3>
            <div className="mt-4">
              <DrawingToolsPanel
                onUndo={handleUndo}
                onRedo={handleRedo}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <RewardPopup />
    </div>
  )
}
