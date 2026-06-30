"use client"

import { floodFill, hexToRgba } from "./floodFill"
import type { ArtPath } from "./line-art"
import type { ToolType } from "./store"

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const MAX_HISTORY = 100
const RAINBOW_FALLBACK = "#FFD95C"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface DrawingEngineOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  onChange?: () => void
}

export interface HistoryEntry {
  userLayer: string
  pathFills: Record<string, string>
}

export interface EngineExportData {
  version: number
  userLayer: string
  pathFills: Record<string, string>
  isVectorMode: boolean
}

interface VectorPathDef {
  id: string
  path2d: Path2D
  stroke: string
  strokeWidth: number
  zIndex: number
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function createOffscreen(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!
  return { canvas, ctx }
}

function toFillRgba(hex: string): { r: number; g: number; b: number; a: number } {
  if (hex === "rainbow") return hexToRgba(RAINBOW_FALLBACK)
  return hexToRgba(hex)
}

/* ------------------------------------------------------------------ */
/* DrawingEngine — Native Canvas API                                   */
/* ------------------------------------------------------------------ */

export class DrawingEngine {
  /* Display */
  private displayCanvas: HTMLCanvasElement
  private displayCtx: CanvasRenderingContext2D

  /* Layers (offscreen) */
  private templateCanvas: HTMLCanvasElement
  private templateCtx: CanvasRenderingContext2D

  private userCanvas: HTMLCanvasElement
  private userCtx: CanvasRenderingContext2D

  /* Dimensions */
  private readonly W: number
  private readonly H: number

  /* Tool state */
  private tool: ToolType = "brush"
  private color: string = "#FFD95C"
  private brushSize: number = 6
  private zoom: number = 1
  private panX: number = 0
  private panY: number = 0

  /* Drawing state */
  private isDrawing = false
  private lastX = 0
  private lastY = 0

  /* Vector paths */
  private isVectorMode = false
  private vectorDefs: VectorPathDef[] = []
  private pathFills: Map<string, string> = new Map()

  /* History */
  private history: HistoryEntry[] = []
  private historyIdx: number = -1
  private isRestoring = false
  private pendingSave = false

  /* Callbacks */
  onChange: (() => void) | null = null

  /* -------------------------------------------------------------- */
  /*  Constructor                                                    */
  /* -------------------------------------------------------------- */

  constructor(opts: DrawingEngineOptions) {
    this.W = opts.width
    this.H = opts.height

    /* Display */
    this.displayCanvas = opts.canvas
    this.displayCanvas.width = this.W
    this.displayCanvas.height = this.H
    this.displayCtx = this.displayCanvas.getContext("2d")!

    /* Offscreen layers */
    const tmp1 = createOffscreen(this.W, this.H)
    this.templateCanvas = tmp1.canvas
    this.templateCtx = tmp1.ctx

    const tmp2 = createOffscreen(this.W, this.H)
    this.userCanvas = tmp2.canvas
    this.userCtx = tmp2.ctx

    if (opts.onChange) this.onChange = opts.onChange

    this.displayCanvas.addEventListener("mousedown", this.hMD)
    window.addEventListener("mousemove", this.hMM)
    window.addEventListener("mouseup", this.hMU)
    this.displayCanvas.addEventListener("touchstart", this.hTS, { passive: false })
    window.addEventListener("touchmove", this.hTM, { passive: false })
    window.addEventListener("touchend", this.hTE)

    this.render()
  }

  /* -------------------------------------------------------------- */
  /*  Destroy                                                        */
  /* -------------------------------------------------------------- */

  destroy(): void {
    this.displayCanvas.removeEventListener("mousedown", this.hMD)
    window.removeEventListener("mousemove", this.hMM)
    window.removeEventListener("mouseup", this.hMU)
    this.displayCanvas.removeEventListener("touchstart", this.hTS)
    window.removeEventListener("touchmove", this.hTM)
    window.removeEventListener("touchend", this.hTE)
  }

  /* Bound handlers (arrow functions for automatic this binding) */
  private hMD = (e: MouseEvent): void => { e.preventDefault(); this.pointerDown(e.clientX, e.clientY) }
  private hMM = (e: MouseEvent): void => { if (this.isDrawing) { e.preventDefault(); this.pointerMove(e.clientX, e.clientY) } }
  private hMU = (): void => { this.pointerUp() }
  private hTS = (e: TouchEvent): void => { e.preventDefault(); const t = e.touches[0]; if (t) this.pointerDown(t.clientX, t.clientY) }
  private hTM = (e: TouchEvent): void => { if (!this.isDrawing) return; e.preventDefault(); const t = e.touches[0]; if (t) this.pointerMove(t.clientX, t.clientY) }
  private hTE = (): void => { this.pointerUp() }

  /* -------------------------------------------------------------- */
  /*  Setters                                                        */
  /* -------------------------------------------------------------- */

  setTool(t: ToolType): void {
    this.tool = t
    this.displayCanvas.style.cursor =
      t === "bucket" || t === "fill" ? "cell" :
      t === "eraser" ? "crosshair" : "default"
  }

  setColor(c: string): void { this.color = c }
  setBrushSize(s: number): void { this.brushSize = s }

  setZoom(z: number): void {
    this.zoom = Math.max(0.6, Math.min(3, z))
    this.render()
  }

  getZoom(): number { return this.zoom }

  /* -------------------------------------------------------------- */
  /*  Template — Vector                                              */
  /* -------------------------------------------------------------- */

  loadVectorTemplate(paths: ArtPath[]): void {
    this.isVectorMode = true
    this.vectorDefs = []
    this.pathFills.clear()

    const sorted = [...paths].sort((a, b) => a.zIndex - b.zIndex)

    for (const p of sorted) {
      this.vectorDefs.push({
        id: p.id,
        path2d: new Path2D(p.d),
        stroke: p.stroke,
        strokeWidth: p.strokeWidth,
        zIndex: p.zIndex,
      })
      this.pathFills.set(p.id, p.fill)
    }

    this.renderTemplate()
    this.render()
    this.pushHistory()
  }

  /* -------------------------------------------------------------- */
  /*  Template — Raster (image / SVG)                                */
  /* -------------------------------------------------------------- */

  loadRasterTemplate(url: string): Promise<void> {
    this.isVectorMode = false
    this.clearUser()

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const iw = img.naturalWidth || img.width || this.W
        const ih = img.naturalHeight || img.height || this.H
        const s = Math.min((this.W * 0.9) / iw, (this.H * 0.9) / ih)
        const dx = (this.W - iw * s) / 2
        const dy = (this.H - ih * s) / 2

        this.templateCtx.clearRect(0, 0, this.W, this.H)
        this.templateCtx.drawImage(img, dx, dy, iw * s, ih * s)
        this.render()
        this.pushHistory()
        resolve()
      }
      img.onerror = () => { this.render(); resolve() }
      img.src = url
    })
  }

  /* -------------------------------------------------------------- */
  /*  Load image onto user layer (for restoring saved drawings)      */
  /* -------------------------------------------------------------- */

  loadUserImage(dataUrl: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.userCtx.clearRect(0, 0, this.W, this.H)
        this.userCtx.drawImage(img, 0, 0, this.W, this.H)
        this.render()
        resolve()
      }
      img.onerror = () => resolve()
      img.src = dataUrl
    })
  }

  /* -------------------------------------------------------------- */
  /*  Render                                                         */
  /* -------------------------------------------------------------- */

  private render(): void {
    const ctx = this.displayCtx
    ctx.save()

    /* Zoom & pan */
    const cx = this.W / 2, cy = this.H / 2
    ctx.translate(cx + this.panX, cy + this.panY)
    ctx.scale(this.zoom, this.zoom)
    ctx.translate(-cx, -cy)

    /* White bg */
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, this.W, this.H)

    /* Template */
    ctx.drawImage(this.templateCanvas, 0, 0)

    /* User content */
    ctx.drawImage(this.userCanvas, 0, 0)

    ctx.restore()
  }

  private renderTemplate(): void {
    this.templateCtx.clearRect(0, 0, this.W, this.H)
    if (!this.isVectorMode) return

    for (const vp of this.vectorDefs) {
      const fill = this.pathFills.get(vp.id) || "#FFFFFF"
      this.templateCtx.fillStyle = fill
      this.templateCtx.strokeStyle = vp.stroke
      this.templateCtx.lineWidth = vp.strokeWidth
      this.templateCtx.lineJoin = "round"
      this.templateCtx.lineCap = "round"
      this.templateCtx.fill(vp.path2d)
      this.templateCtx.stroke(vp.path2d)
    }
  }

  /* -------------------------------------------------------------- */
  /*  Coordinates                                                    */
  /* -------------------------------------------------------------- */

  private logicalXY(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.displayCanvas.getBoundingClientRect()
    let x = (clientX - rect.left) * (this.displayCanvas.width / rect.width)
    let y = (clientY - rect.top) * (this.displayCanvas.height / rect.height)
    const cx = this.W / 2, cy = this.H / 2
    x = (x - cx - this.panX) / this.zoom + cx
    y = (y - cy - this.panY) / this.zoom + cy
    return { x, y }
  }

  /* -------------------------------------------------------------- */
  /*  Pointer handling                                               */
  /* -------------------------------------------------------------- */

  private pointerDown(cx: number, cy: number): void {
    const p = this.logicalXY(cx, cy)
    if (this.tool === "bucket" || this.tool === "fill") {
      this.doFloodFill(Math.round(p.x), Math.round(p.y))
      return
    }
    this.isDrawing = true
    this.lastX = p.x
    this.lastY = p.y
  }

  private pointerMove(cx: number, cy: number): void {
    if (!this.isDrawing) return
    const p = this.logicalXY(cx, cy)
    const isErase = this.tool === "eraser"
    const color = isErase ? "#FFFFFF" : (this.color === "rainbow" ? RAINBOW_FALLBACK : this.color)
    const size = isErase ? this.brushSize * 2.5 : this.brushSize

    const ctx = this.userCtx
    ctx.save()
    if (isErase) {
      ctx.globalCompositeOperation = "destination-out"
    }
    ctx.strokeStyle = isErase ? "rgba(0,0,0,1)" : color
    ctx.lineWidth = size
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    ctx.moveTo(this.lastX, this.lastY)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.restore()

    this.lastX = p.x
    this.lastY = p.y
    this.render()
  }

  private pointerUp(): void {
    if (!this.isDrawing) return
    this.isDrawing = false
    this.scheduleHistory()
  }

  /* -------------------------------------------------------------- */
  /*  Flood fill                                                     */
  /* -------------------------------------------------------------- */

  private doFloodFill(sx: number, sy: number): void {
    if (sx < 0 || sx >= this.W || sy < 0 || sy >= this.H) return

    /* Vector mode — hit-test paths */
    if (this.isVectorMode) {
      const hit = this.hitTestPath(sx, sy)
      if (hit) {
        if (hit.id === "ele-eye") return
        this.pathFills.set(hit.id, this.color === "rainbow" ? RAINBOW_FALLBACK : this.color)
        this.renderTemplate()
        this.render()
        this.scheduleHistory()
        return
      }
    }

    /* Raster flood fill via composite */
    const tmp = createOffscreen(this.W, this.H)
    const tc = tmp.ctx
    tc.fillStyle = "#FFFFFF"
    tc.fillRect(0, 0, this.W, this.H)
    tc.drawImage(this.templateCanvas, 0, 0)
    tc.drawImage(this.userCanvas, 0, 0)

    const result = floodFill(tc, {
      startX: sx,
      startY: sy,
      fillColor: toFillRgba(this.color),
      fillTolerance: 120,
      outlineThreshold: 40,
      outlineMinAlpha: 80,
    })

    if (!result) return

    this.userCtx.drawImage(result.maskCanvas, 0, 0)
    this.render()
    this.scheduleHistory()
  }

  private hitTestPath(x: number, y: number): { id: string } | null {
    const sorted = [...this.vectorDefs].sort((a, b) => b.zIndex - a.zIndex)
    for (const vp of sorted) {
      if (this.templateCtx.isPointInPath(vp.path2d, x, y)) {
        return { id: vp.id }
      }
    }
    return null
  }

  /* -------------------------------------------------------------- */
  /*  History                                                        */
  /* -------------------------------------------------------------- */

  private scheduleHistory(): void {
    if (this.isRestoring || this.pendingSave) return
    this.pendingSave = true
    requestAnimationFrame(() => {
      this.pendingSave = false
      this.pushHistory()
    })
  }

  private pushHistory(): void {
    if (this.isRestoring) return

    /* Discard any redo states */
    this.history.length = this.historyIdx + 1

    const entry: HistoryEntry = {
      userLayer: this.userCanvas.toDataURL("image/png"),
      pathFills: Object.fromEntries(this.pathFills),
    }

    this.history.push(entry)
    if (this.history.length > MAX_HISTORY) this.history.shift()
    this.historyIdx = this.history.length - 1

    if (this.onChange) this.onChange()
  }

  undo(): boolean {
    if (this.historyIdx <= 0) return false
    this.historyIdx--
    return this.restoreCurrent()
  }

  redo(): boolean {
    if (this.historyIdx >= this.history.length - 1) return false
    this.historyIdx++
    return this.restoreCurrent()
  }

  canUndo(): boolean { return this.historyIdx > 0 }
  canRedo(): boolean { return this.historyIdx < this.history.length - 1 }

  private restoreCurrent(): boolean {
    const entry = this.history[this.historyIdx]
    if (!entry) return false

    this.isRestoring = true

    const img = new Image()
    img.onload = () => {
      this.userCtx.clearRect(0, 0, this.W, this.H)
      this.userCtx.drawImage(img, 0, 0, this.W, this.H)

      /* Restore path fills */
      for (const [id, fill] of Object.entries(entry.pathFills)) {
        this.pathFills.set(id, fill)
      }
      if (this.isVectorMode) this.renderTemplate()

      this.render()
      this.isRestoring = false
      if (this.onChange) this.onChange()
    }
    img.onerror = () => { this.isRestoring = false }
    img.src = entry.userLayer

    return true
  }

  resetHistory(): void {
    this.history = []
    this.historyIdx = -1
    this.pushHistory()
  }

  replaceHistory(): void {
    this.history = []
    this.historyIdx = -1
    this.pushHistory()
  }

  /* -------------------------------------------------------------- */
  /*  Clear all                                                      */
  /* -------------------------------------------------------------- */

  clearAll(): void {
    if (this.isVectorMode) {
      for (const vp of this.vectorDefs) {
        if (vp.id === "ele-eye") this.pathFills.set(vp.id, "#3B2416")
        else if (["sun-rays", "grass-left", "grass-right"].includes(vp.id)) this.pathFills.set(vp.id, "none")
        else this.pathFills.set(vp.id, "#FFFFFF")
      }
      this.renderTemplate()
    }
    this.userCtx.clearRect(0, 0, this.W, this.H)
    this.render()
    this.pushHistory()
  }

  private clearUser(): void {
    this.userCtx.clearRect(0, 0, this.W, this.H)
  }

  /* -------------------------------------------------------------- */
  /*  Export                                                         */
  /* -------------------------------------------------------------- */

  toDataURL(opts?: { format?: string; quality?: number; multiplier?: number }): string {
    const mul = opts?.multiplier ?? 1
    const fmt = opts?.format ?? "png"
    const q = opts?.quality ?? 1

    if (mul === 1 && fmt === "png" && q >= 1) {
      return this.compositeDataURL()
    }

    const tmp = createOffscreen(Math.round(this.W * mul), Math.round(this.H * mul))
    const ctx = tmp.ctx
    ctx.scale(mul, mul)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.drawImage(this.templateCanvas, 0, 0)
    ctx.drawImage(this.userCanvas, 0, 0)

    return tmp.canvas.toDataURL(`image/${fmt}`, q)
  }

  toBlob(opts?: { format?: string; quality?: number; multiplier?: number }): Promise<Blob | null> {
    const mul = opts?.multiplier ?? 1
    const fmt = opts?.format ?? "png"
    const q = opts?.quality ?? 1

    const tmp = createOffscreen(Math.round(this.W * mul), Math.round(this.H * mul))
    const ctx = tmp.ctx
    ctx.scale(mul, mul)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.drawImage(this.templateCanvas, 0, 0)
    ctx.drawImage(this.userCanvas, 0, 0)

    return new Promise((resolve) => {
      tmp.canvas.toBlob((blob) => {
        resolve(blob)
      }, `image/${fmt}`, q)
    })
  }

  private compositeDataURL(): string {
    const tmp = createOffscreen(this.W, this.H)
    const ctx = tmp.ctx
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.drawImage(this.templateCanvas, 0, 0)
    ctx.drawImage(this.userCanvas, 0, 0)
    return tmp.canvas.toDataURL("image/png")
  }

  /* -------------------------------------------------------------- */
  /*  State persistence                                              */
  /* -------------------------------------------------------------- */

  exportState(): string {
    const data: EngineExportData = {
      version: 1,
      userLayer: this.userCanvas.toDataURL("image/png"),
      pathFills: Object.fromEntries(this.pathFills),
      isVectorMode: this.isVectorMode,
    }
    return JSON.stringify(data)
  }

  importState(json: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const data = JSON.parse(json) as EngineExportData
        if (data.version !== 1) { this.resetAfterLoad(); resolve(); return }

        this.isVectorMode = data.isVectorMode
        this.pathFills.clear()
        for (const [id, fill] of Object.entries(data.pathFills)) {
          this.pathFills.set(id, fill)
        }
        if (this.isVectorMode) this.renderTemplate()

        const img = new Image()
        img.onload = () => {
          this.userCtx.clearRect(0, 0, this.W, this.H)
          this.userCtx.drawImage(img, 0, 0, this.W, this.H)
          this.render()
          this.pushHistory()
          resolve()
        }
        img.onerror = () => { this.render(); this.pushHistory(); resolve() }
        img.src = data.userLayer
      } catch {
        this.resetAfterLoad()
        resolve()
      }
    })
  }

  importLegacyImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.userCtx.clearRect(0, 0, this.W, this.H)
        this.userCtx.drawImage(img, 0, 0, this.W, this.H)
        this.render()
        this.pushHistory()
        resolve()
      }
      img.onerror = () => resolve()
      img.src = url
    })
  }

  private resetAfterLoad(): void {
    this.clearUser()
    this.pathFills.clear()
    this.render()
    this.pushHistory()
  }

  /* -------------------------------------------------------------- */
  /*  CSS resize                                                     */
  /* -------------------------------------------------------------- */

  setCssScale(cw: number, ch: number): void {
    const s = Math.min(cw / this.W, ch / this.H)
    this.displayCanvas.style.width = `${this.W * s}px`
    this.displayCanvas.style.height = `${this.H * s}px`
    this.render()
  }

  /* -------------------------------------------------------------- */
  /*  Queries                                                        */
  /* -------------------------------------------------------------- */

  getUsedColors(): string[] {
    const colors = new Set<string>()
    for (const fill of this.pathFills.values()) {
      if (fill.startsWith("#")) colors.add(fill)
    }
    const imgData = this.userCtx.getImageData(0, 0, this.W, this.H)
    const d = imgData.data
    for (let y = 0; y < this.H; y += 20) {
      for (let x = 0; x < this.W; x += 20) {
        const i = (y * this.W + x) * 4
        if (d[i + 3] > 0) {
          const hex = "#" + [d[i], d[i + 1], d[i + 2]].map(c => c.toString(16).padStart(2, "0")).join("")
          colors.add(hex)
        }
      }
    }
    return Array.from(colors)
  }

  getFilledZoneCount(): number {
    const imgData = this.userCtx.getImageData(0, 0, this.W, this.H)
    const d = imgData.data
    let filled = 0
    const total = this.W * this.H
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] > 0) filled++
    }
    const ratio = filled / total
    if (ratio < 0.01) return 0
    return Math.max(1, Math.round(ratio * 30))
  }

  isVectorModeEnabled(): boolean { return this.isVectorMode }
}
