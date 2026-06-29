"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react"
import * as fabric from "fabric"
import { Maximize, Minimize } from "lucide-react"
import { useColoringStore } from "@/lib/store"
import { savaneArtPaths } from "@/lib/line-art"
import { floodFill, hexToRgba } from "@/lib/floodFill"
import type { SaveDrawingInput, SavedDrawing } from "@/features/drawings/types"

;(fabric.FabricObject as unknown as { customProperties: string[] }).customProperties = ["id", "name"]

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
  const [fabricInstance, setFabricInstance] = useState<fabric.Canvas | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const outlineImgRef = useRef<fabric.Image | null>(null)

  const {
    selectedTool,
    selectedColor,
    brushSize,
    pushHistory,
    undo: storeUndo,
    redo: storeRedo,
    currentDrawing,
    selectedCategory,
    clearHistory,
    replaceHistory,
    setSelectedTool,
    setSelectedColor,
    setBrushSize,
    setSaved,
    activeSavedDrawingId,
  } = useColoringStore()

  const restoreOutlineRef = useCallback((canvas: fabric.Canvas) => {
    const objects = canvas.getObjects()
    const outline = objects.find((object) => object.type === "image" && object.get("name") === "outline-image")
    outlineImgRef.current = (outline as fabric.Image | undefined) || null
  }, [])

  const loadJsonIntoCanvas = useCallback((canvas: fabric.Canvas, canvasJson: string, shouldReplaceHistory = true) => {
    canvas.loadFromJSON(canvasJson, () => {
      restoreOutlineRef(canvas)
      canvas.renderAll()
      if (shouldReplaceHistory) replaceHistory(canvasJson)
    })
  }, [restoreOutlineRef, replaceHistory])

  useEffect(() => {
    let canvas: fabric.Canvas | null = null
    let isUnmounted = false

    setZoomLevel(1)
    clearHistory()
    outlineImgRef.current = null

    import("fabric").then((fabricModule) => {
      if (isUnmounted || !canvasElRef.current) return
      const fb = fabricModule as unknown as typeof fabric

      canvas = new fb.Canvas(canvasElRef.current, {
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundColor: "#FFFFFF",
        isDrawingMode: selectedTool === "brush" || selectedTool === "eraser",
        selection: false,
      })

      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fb.PencilBrush(canvas)
      }
      canvas.freeDrawingBrush.color = selectedTool === "eraser" ? "#FFFFFF" : selectedColor
      canvas.freeDrawingBrush.width = selectedTool === "eraser" ? brushSize * 2.5 : brushSize

      const loadInitialContent = async () => {
        if (!canvas) return
        const activeId = activeSavedDrawingId
        if (activeId) {
          try {
            const raw = window.localStorage.getItem("petit-baobab.saved-drawings.v1")
            if (raw) {
              const list = JSON.parse(raw) as SavedDrawing[]
              const found = list.find((d) => d.id === activeId)
              if (found && canvas) {
                setSelectedTool(found.state.selectedTool)
                setSelectedColor(found.state.selectedColor)
                setBrushSize(found.state.brushSize)
                loadJsonIntoCanvas(canvas, found.state.canvasJson, true)
                setSaved(true)
                return
              }
            }
          } catch (e) {
            console.error("Error loading saved drawing JSON on init:", e)
          }
        }

        if (currentDrawing.isVector) {
          const sortedPaths = [...savaneArtPaths].sort((a, b) => a.zIndex - b.zIndex)
          sortedPaths.forEach((artPath) => {
            const path = new fb.Path(artPath.d, {
              id: artPath.id,
              name: artPath.name,
              strokeWidth: artPath.strokeWidth,
              stroke: artPath.stroke,
              fill: artPath.fill,
              selectable: false,
              evented: true,
              hoverCursor: "pointer",
            })
            canvas?.add(path)
          })
          canvas.renderAll()
          pushHistory(JSON.stringify(canvas.toJSON()))
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

          fb.Image.fromURL(imageUrl, { crossOrigin: "anonymous" }).then((img) => {
            if (isUnmounted || !canvas) return

            const element = img.getElement()
            const imgWidth = img.width || (element ? (element as HTMLImageElement).naturalWidth : 0) || CANVAS_W
            const imgHeight = img.height || (element ? (element as HTMLImageElement).naturalHeight : 0) || CANVAS_H
            const scale = Math.min(CANVAS_W / imgWidth, CANVAS_H / imgHeight) * 0.9

            img.set({
              name: "outline-image",
              originX: "center",
              originY: "center",
              scaleX: scale,
              scaleY: scale,
              left: CANVAS_W / 2,
              top: CANVAS_H / 2,
              selectable: false,
              evented: false,
            })

            outlineImgRef.current = img
            canvas.add(img)
            canvas.renderAll()
            pushHistory(JSON.stringify(canvas.toJSON()))
          }).catch((err) => {
            console.error("Error loading image:", err)
          })
        }
      }

      loadInitialContent()

      setFabricInstance(canvas)

      const handleCanvasChange = () => {
        if (!canvas) return
        pushHistory(JSON.stringify(canvas.toJSON()))
        useColoringStore.getState().setSaved(false)
      }

      canvas.on("object:modified", handleCanvasChange)
      canvas.on("path:created", handleCanvasChange)

      canvas.on("mouse:down", (options) => {
        if (!canvas) return
        const tool = useColoringStore.getState().selectedTool
        const color = useColoringStore.getState().selectedColor

        if (tool !== "bucket" && tool !== "fill") return

        if (canvas.isDrawingMode) {
          canvas.isDrawingMode = false
        }

        const target = options.target

        if (currentDrawing.isVector && target && target.type === "path") {
          target.set("fill", color)
          canvas.renderAll()
          handleCanvasChange()
          return
        }

        canvas.calcOffset()
        const pointer = canvas.getScenePoint(options.e)
        const startX = Math.round(pointer.x)
        const startY = Math.round(pointer.y)

        if (startX < 0 || startX >= CANVAS_W || startY < 0 || startY >= CANVAS_H) return

        const snapCanvas = canvas.toCanvasElement(1)
        const snapCtx = snapCanvas.getContext("2d", { willReadFrequently: true })
        if (!snapCtx) return

        const maskResult = floodFill(snapCtx, {
          startX,
          startY,
          fillColor: hexToRgba(color),
          fillTolerance: 120,
          outlineThreshold: 40,
          outlineMinAlpha: 80,
        })

        if (!maskResult) return

        const dataUrl = maskResult.maskCanvas.toDataURL()
        fb.Image.fromURL(dataUrl).then((maskImg) => {
          if (isUnmounted || !canvas) return

          maskImg.set({
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            scaleX: 1,
            scaleY: 1,
            selectable: false,
            evented: false,
          })

          canvas.add(maskImg)
          const objects = canvas.getObjects()
          const outlineImg = outlineImgRef.current

          if (outlineImg) {
            const outlineIndex = objects.indexOf(outlineImg)
            const maskIndex = objects.indexOf(maskImg)
            if (outlineIndex >= 0 && maskIndex > outlineIndex) {
              objects.splice(maskIndex, 1)
              objects.splice(outlineIndex, 0, maskImg)
            }
            canvas.bringObjectToFront(outlineImg)
          }

          canvas.renderAll()
          handleCanvasChange()
        }).catch((err) => {
          console.error("Failed to load fill mask image:", err)
        })
      })
    })

    const handleScrollOrInteraction = () => {
      if (canvas) canvas.calcOffset()
    }
    window.addEventListener("scroll", handleScrollOrInteraction, { passive: true })

    return () => {
      isUnmounted = true
      window.removeEventListener("scroll", handleScrollOrInteraction)
      if (canvas) canvas.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDrawing.id])

  useEffect(() => {
    if (!fabricInstance) return

    const isDraw = selectedTool === "brush" || selectedTool === "eraser"
    fabricInstance.isDrawingMode = isDraw

    if (!fabricInstance.freeDrawingBrush) {
      fabricInstance.freeDrawingBrush = new fabric.PencilBrush(fabricInstance)
    }
    fabricInstance.freeDrawingBrush.color = selectedTool === "eraser" ? "#FFFFFF" : selectedColor
    fabricInstance.freeDrawingBrush.width = selectedTool === "eraser" ? brushSize * 2.5 : brushSize

    if (selectedTool === "bucket" || selectedTool === "fill") {
      fabricInstance.defaultCursor = "cell"
    } else if (selectedTool === "eraser") {
      fabricInstance.defaultCursor = "crosshair"
    } else {
      fabricInstance.defaultCursor = "default"
    }
  }, [selectedTool, selectedColor, brushSize, fabricInstance])

  useEffect(() => {
    if (!fabricInstance || !containerRef.current) return

    const handleResize = () => {
      if (!containerRef.current || !fabricInstance || !fabricInstance.wrapperEl) return
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight || 620
      const scale = Math.min(containerWidth / CANVAS_W, containerHeight / CANVAS_H)

      fabricInstance.setDimensions({ width: CANVAS_W * scale, height: CANVAS_H * scale }, { cssOnly: true })
      fabricInstance.setZoom(zoomLevel)
      fabricInstance.calcOffset()
      fabricInstance.renderAll()
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)
    handleResize()

    return () => observer.disconnect()
  }, [fabricInstance, zoomLevel])

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => console.error("Fullscreen error:", err))
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])
  const handleUndo = useCallback(() => {
    if (!fabricInstance) return
    const { canUndo, stateJson } = storeUndo()
    if (canUndo && stateJson) loadJsonIntoCanvas(fabricInstance, stateJson, false)
  }, [fabricInstance, storeUndo, loadJsonIntoCanvas])

  const handleRedo = useCallback(() => {
    if (!fabricInstance) return
    const { canRedo, stateJson } = storeRedo()
    if (canRedo && stateJson) loadJsonIntoCanvas(fabricInstance, stateJson, false)
  }, [fabricInstance, storeRedo, loadJsonIntoCanvas])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.hasAttribute("contenteditable")
      ) {
        return
      }

      const isCmdOrCtrl = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      if (isCmdOrCtrl) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault()
          if (isShift) {
            handleRedo()
          } else {
            handleUndo()
          }
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault()
          handleRedo()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [fabricInstance, handleUndo, handleRedo])

  const getUserObjects = (canvas: fabric.Canvas) => {
    return canvas.getObjects().filter((object: fabric.Object & { id?: string }) => {
      const isPredefined = savaneArtPaths.some((path) => path.id === object.id)
      return !isPredefined && object !== outlineImgRef.current
    })
  }

  const getUsedColors = (canvas: fabric.Canvas) => {
    const colors = new Set<string>()
    canvas.getObjects().forEach((object) => {
      const fill = object.get("fill")
      const stroke = object.get("stroke")
      if (typeof fill === "string" && fill.startsWith("#")) colors.add(fill)
      if (typeof stroke === "string" && stroke.startsWith("#")) colors.add(stroke)
    })
    return Array.from(colors)
  }

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    zoomIn: () => setZoomLevel((z) => Math.min(z + 0.2, 3)),
    zoomOut: () => setZoomLevel((z) => Math.max(z - 0.2, 0.6)),
    clearAll: () => {
      if (!fabricInstance) return
      const objects = fabricInstance.getObjects()
      const objectsToRemove: fabric.Object[] = []

      objects.forEach((obj: fabric.Object & { id?: string }) => {
        const isPredefined = savaneArtPaths.some((p) => p.id === obj.id)
        if (isPredefined) {
          if (obj.id === "ele-eye") obj.set("fill", "#3B2416")
          else if (obj.id === "sun-rays" || obj.id === "grass-left" || obj.id === "grass-right") obj.set("fill", "none")
          else obj.set("fill", "#FFFFFF")
        } else if (obj !== outlineImgRef.current) {
          objectsToRemove.push(obj)
        }
      })

      objectsToRemove.forEach((obj) => fabricInstance.remove(obj))
      fabricInstance.backgroundColor = "#FFFFFF"
      fabricInstance.renderAll()
      pushHistory(JSON.stringify(fabricInstance.toJSON()))
      setSaved(false)
    },
    download: () => {
      if (!fabricInstance) return
      const dataURL = fabricInstance.toDataURL({ format: "png", quality: 1.0, multiplier: 1 })
      const link = document.createElement("a")
      link.download = "mon-coloriage-petit-baobab.png"
      link.href = dataURL
      link.click()
    },
    print: () => {
      if (!fabricInstance) return
      const dataURL = fabricInstance.toDataURL({ format: "png", multiplier: 2 })
      const printWindow = window.open("", "_blank")
      if (!printWindow) return
      printWindow.document.write(`<html><head><title>Imprimer Coloriage - Petit Baobab</title><style>@page{size:A4 landscape;margin:0}@media print{body{margin:0;padding:0;background:white}img{width:100vw;height:100vh;object-fit:contain;display:block}}body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:white}img{max-width:100%;max-height:100%;object-fit:contain}</style></head><body><img src="${dataURL}" onload="window.print(); window.close();" /></body></html>`)
      printWindow.document.close()
    },
    saveDrawing: async () => {
      if (!fabricInstance) return null
      const canvasJson = JSON.stringify(fabricInstance.toJSON())
      const image = fabricInstance.toDataURL({ format: "png", quality: 1, multiplier: 1 })
      const thumbnail = fabricInstance.toDataURL({ format: "png", quality: 0.85, multiplier: 0.28 })
      const filledZones = getUserObjects(fabricInstance).length

      return {
        name: currentDrawing.name,
        category: currentDrawing.category || selectedCategory,
        image,
        thumbnail,
        template: { ...currentDrawing, category: currentDrawing.category || selectedCategory },
        state: {
          canvasJson,
          selectedTool,
          selectedColor,
          brushSize,
          usedColors: getUsedColors(fabricInstance),
          filledZones,
        },
      }
    },
    loadSavedDrawing: (drawing) => {
      if (!fabricInstance) return
      setSelectedTool(drawing.state.selectedTool)
      setSelectedColor(drawing.state.selectedColor)
      setBrushSize(drawing.state.brushSize)
      loadJsonIntoCanvas(fabricInstance, drawing.state.canvasJson, true)
      setSaved(true)
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


