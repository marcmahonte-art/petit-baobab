"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react"
import { Maximize, Minimize } from "lucide-react"
import { DrawingEngine } from "@/lib/drawing-engine"
import { useColoringStore } from "@/lib/store"
import { savaneArtPaths } from "@/lib/line-art"
import type { SaveDrawingInput, SavedDrawing } from "@/features/drawings/types"
import { storageService } from "@/lib/storageService"
import { useProfileStore } from "@/lib/profile-store"

export interface CanvasCardRef {
  undo: () => void
  redo: () => void
  zoomIn: () => void
  zoomOut: () => void
  clearAll: () => void
  download: () => void
  print: () => void
  saveDrawing: () => Promise<SaveDrawingInput | null>
  loadSavedDrawing: (drawing: SavedDrawing) => void
}

interface CanvasCardProps {
  className?: string
}

const CANVAS_W = 800
const CANVAS_H = 500

export const CanvasCard = forwardRef<CanvasCardRef, CanvasCardProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DrawingEngine | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const profileId = useProfileStore((s) => s.activeProfileId)

  const {
    selectedTool,
    selectedColor,
    brushSize,
    currentDrawing,
    selectedCategory,
    setSelectedTool,
    setSelectedColor,
    setBrushSize,
    setSaved,
    activeSavedDrawingId,
  } = useColoringStore()

  /* ---- Sync store undo/redo state with engine ---- */
  const syncUndoRedo = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    const cu = engine.canUndo()
    const cr = engine.canRedo()
    const len = 1 + (cu ? 1 : 0) + (cr ? 1 : 0)
    useColoringStore.setState({
      historyIndex: cu ? 1 : 0,
      canvasHistory: new Array(len).fill(""),
    })
  }, [])

  /* ---- Engine change handler ---- */
  const handleEngineChange = useCallback(() => {
    setSaved(false)
    syncUndoRedo()
  }, [setSaved, syncUndoRedo])

  /* ---- Detect new vs legacy state format ---- */
  const isNewFormat = useCallback((json: string): boolean => {
    try {
      const p = JSON.parse(json)
      return p?.version === 1
    } catch {
      return false
    }
  }, [])

  /* ---- Load canvas from a saved drawing ---- */
  const loadCanvasFromSaved = useCallback(async (engine: DrawingEngine, drawing: SavedDrawing) => {
    if (isNewFormat(drawing.state.canvasJson)) {
      await engine.importState(drawing.state.canvasJson)
    } else {
      await engine.importLegacyImage(drawing.image)
    }
  }, [isNewFormat])

  /* ---- Main effect: create engine and load content ---- */
  useEffect(() => {
    if (!canvasElRef.current) return

    /* Dispose previous engine */
    if (engineRef.current) {
      engineRef.current.destroy()
      engineRef.current = null
    }

    const el = canvasElRef.current
    const engine = new DrawingEngine({
      canvas: el,
      width: CANVAS_W,
      height: CANVAS_H,
      onChange: handleEngineChange,
    })
    engineRef.current = engine

    /* Set initial tool state */
    engine.setTool(selectedTool)
    engine.setColor(selectedColor)
    engine.setBrushSize(brushSize)
    engine.setZoom(1)

    /* Load initial content */
    const loadContent = async () => {
      useColoringStore.getState().clearHistory()

      const activeId = activeSavedDrawingId
      if (activeId) {
        try {
          const raw = window.localStorage.getItem("petit-baobab.saved-drawings.v1")
          if (raw) {
            const list = JSON.parse(raw) as SavedDrawing[]
            const found = list.find((d) => d.id === activeId)
            if (found) {
              setSelectedTool(found.state.selectedTool)
              setSelectedColor(found.state.selectedColor)
              setBrushSize(found.state.brushSize)
              engine.setTool(found.state.selectedTool)
              engine.setColor(found.state.selectedColor)
              engine.setBrushSize(found.state.brushSize)
              await loadCanvasFromSaved(engine, found)
              setSaved(true)
              syncUndoRedo()
              return
            }
          }
        } catch (e) {
          console.error("Error loading saved drawing on init:", e)
        }
      }

      if (currentDrawing.isVector) {
        engine.loadVectorTemplate(savaneArtPaths)
      } else {
        let imageUrl = currentDrawing.image

        if (imageUrl.endsWith(".svg")) {
          try {
            const res = await fetch(imageUrl)
            let svgText = await res.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(svgText, "image/svg+xml")
            const svgEl = doc.querySelector("svg")

            if (svgEl) {
              if (!svgEl.getAttribute("width") || !svgEl.getAttribute("height")) {
                const viewBox = svgEl.getAttribute("viewBox")
                if (viewBox) {
                  const parts = viewBox.trim().split(/\s+/)
                  if (parts.length === 4) {
                    svgEl.setAttribute("width", parts[2])
                    svgEl.setAttribute("height", parts[3])
                  }
                } else {
                  svgEl.setAttribute("width", String(CANVAS_W))
                  svgEl.setAttribute("height", String(CANVAS_H))
                }
              }
              svgText = new XMLSerializer().serializeToString(doc)
            }

            imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
          } catch (err) {
            console.error("Error preprocessing SVG:", err)
          }
        }

        await engine.loadRasterTemplate(imageUrl)
      }

      syncUndoRedo()
    }

    loadContent()

    /* Resize observer */
    const container = containerRef.current
    const observer = new ResizeObserver(() => {
      if (!container) return
      const cw = container.offsetWidth
      const ch = container.offsetHeight || 620
      engine.setCssScale(cw, ch)
    })
    if (container) observer.observe(container)

    return () => {
      observer.disconnect()
      engine.destroy()
      if (engineRef.current === engine) engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDrawing.id])

  /* ---- Sync tool/color/brush changes to engine ---- */
  useEffect(() => {
    engineRef.current?.setTool(selectedTool)
  }, [selectedTool])

  useEffect(() => {
    engineRef.current?.setColor(selectedColor)
  }, [selectedColor])

  useEffect(() => {
    engineRef.current?.setBrushSize(brushSize)
  }, [brushSize])

  /* ---- Fullscreen toggle ---- */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Fullscreen error:", err))
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  /* ---- Keyboard shortcuts ---- */
  const handleUndo = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.undo()
    syncUndoRedo()
  }, [syncUndoRedo])

  const handleRedo = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    engine.redo()
    syncUndoRedo()
  }, [syncUndoRedo])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.hasAttribute("contenteditable")
      ) return

      const mod = e.ctrlKey || e.metaKey
      if (!mod) return

      if (e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) handleRedo()
        else handleUndo()
      } else if (e.key.toLowerCase() === "y") {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleUndo, handleRedo])

  /* ---- Imperative ref ---- */
  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    zoomIn: () => {
      const engine = engineRef.current
      if (engine) engine.setZoom(engine.getZoom() + 0.2)
    },
    zoomOut: () => {
      const engine = engineRef.current
      if (engine) engine.setZoom(engine.getZoom() - 0.2)
    },
    clearAll: () => {
      engineRef.current?.clearAll()
      setSaved(false)
      syncUndoRedo()
    },
    download: () => {
      const engine = engineRef.current
      if (!engine) return
      const dataURL = engine.toDataURL({ format: "png", quality: 1, multiplier: 1 })
      const link = document.createElement("a")
      link.download = "mon-coloriage-petit-baobab.png"
      link.href = dataURL
      link.click()
    },
    print: () => {
      const engine = engineRef.current
      if (!engine) return
      const dataURL = engine.toDataURL({ format: "png", multiplier: 2 })
      const pw = window.open("", "_blank")
      if (!pw) return
      pw.document.write(`<html><head><title>Imprimer Coloriage - Petit Baobab</title><style>@page{size:A4 landscape;margin:0}@media print{body{margin:0;padding:0;background:white}img{width:100vw;height:100vh;object-fit:contain;display:block}}body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:white}img{max-width:100%;max-height:100%;object-fit:contain}</style></head><body><img src="${dataURL}" onload="window.print(); window.close();" /></body></html>`)
      pw.document.close()
    },
    saveDrawing: async () => {
      const engine = engineRef.current
      if (!engine) return null
      const canvasJson = engine.exportState()
      const filledZones = engine.getFilledZoneCount()

      const drawingId = activeSavedDrawingId || crypto.randomUUID()
      const cleanProfileId = profileId || "anonymous"

      let imageUrl = ""
      let thumbnailUrl = ""

      try {
        const imageBlob = await engine.toBlob({ format: "png", quality: 1, multiplier: 1 })
        const thumbBlob = await engine.toBlob({ format: "png", quality: 0.85, multiplier: 0.28 })

        if (imageBlob && thumbBlob) {
          imageUrl = await storageService.uploadDrawingImage(imageBlob, cleanProfileId, drawingId, "user")
          thumbnailUrl = await storageService.uploadThumbnail(thumbBlob, cleanProfileId, drawingId, "user")
        } else {
          throw new Error("Failed to generate canvas blobs")
        }
      } catch (error) {
        console.error("Failed to upload drawing to Supabase Storage, using fallback base64 DataURLs:", error)
        imageUrl = engine.toDataURL({ format: "png", quality: 1, multiplier: 1 })
        thumbnailUrl = engine.toDataURL({ format: "png", quality: 0.85, multiplier: 0.28 })
      }

      return {
        id: drawingId,
        name: currentDrawing.name,
        category: currentDrawing.category || selectedCategory,
        origin: "coloriage" as const,
        profileId: cleanProfileId,
        image: imageUrl,
        thumbnail: thumbnailUrl,
        template: { ...currentDrawing, category: currentDrawing.category || selectedCategory },
        state: {
          canvasJson,
          selectedTool,
          selectedColor,
          brushSize,
          usedColors: engine.getUsedColors(),
          filledZones,
        },
      }
    },
    loadSavedDrawing: async (drawing) => {
      const engine = engineRef.current
      if (!engine) return
      setSelectedTool(drawing.state.selectedTool)
      setSelectedColor(drawing.state.selectedColor)
      setBrushSize(drawing.state.brushSize)
      engine.setTool(drawing.state.selectedTool)
      engine.setColor(drawing.state.selectedColor)
      engine.setBrushSize(drawing.state.brushSize)
      await loadCanvasFromSaved(engine, drawing)
      setSaved(true)
      syncUndoRedo()
    },
  }))

  return (
    <div className="bg-white rounded-[32px] border border-[#EFE7DB] p-4 md:p-[24px] shadow-sm flex flex-col items-center justify-center relative overflow-hidden select-none w-full min-h-[400px] md:min-h-[700px]">
      <div className="absolute top-[20px] right-[20px] z-20 flex items-center gap-[16px]">
        <button
          onClick={toggleFullscreen}
          className="w-[56px] h-[56px] rounded-full border border-[#EFE7DB] bg-white text-[#7A6A5E] hover:bg-neutral-50 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
      </div>

      <div ref={containerRef} className="w-full h-[280px] sm:h-[400px] md:h-[620px] rounded-[24px] bg-white flex items-center justify-center overflow-hidden relative border border-[#EFE7DB]/60 shadow-inner">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  )
})
CanvasCard.displayName = "CanvasCard"
