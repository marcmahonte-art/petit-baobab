"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  BookOpen,
  ChevronDown,
  Star,
  Search,
  Plus,
  X,
  Eye,
  Download,
  Info,
  Calendar,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Printer,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Gift,
  Lightbulb,
  BookText,
  Zap,
  Flame,
  Package,
  Ruler,
  Compass,
  FileText,
  HardDrive,
  Flag,
  Pencil,
  Save,
  Contrast,
  Minus,
  Palette,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useBookPdf } from "@/features/coloring-book/hooks/useBookPdf"
import { getDrawingSvg } from "@/lib/pdf/drawingSvgCache"
import { toColoringBook } from "@/features/coloring-book/lib/bookModel"
import { BookPrint } from "@/features/coloring-book/components/BookPrint"
import { BookIndex } from "@/features/coloring-book/components/BookIndex"
import { PrintButton } from "@/features/coloring-book/components/PrintButton"
import { DownloadButton } from "@/features/coloring-book/components/DownloadButton"
import { BookProvider } from "@/features/coloring-book/context/BookContext"
import type { ColoringBook } from "@/features/coloring-book/types/ColoringBook"
import "@/features/coloring-book/print/print.css"
import * as Progress from "@radix-ui/react-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import { categories, libraryDrawings } from "@/features/coloring-book/constants/book.constants"
import { useBookWizard } from "@/features/coloring-book/hooks/useBookWizard"
import type { SavedDrawing } from "@/features/drawings/types"
import { useBookStore } from "@/features/coloring-book/store/useBookStore"
import { drawingService } from "@/features/drawings/DrawingService"
import { BookHeader } from "@/features/coloring-book/components/BookHeader"
import { BookPreviewCanvas } from "@/features/coloring-book/components/BookPreviewCanvas"
import { BookStepper } from "@/features/coloring-book/components/BookStepper"
import { useProfileStore } from "@/lib/profile-store"
import { storageService } from "@/lib/storageService"
import { bookService } from "@/features/books"
import type { CoverTemplate, CoverPalette, BookStyle, BookFrame, BookFormat, BookOrientation } from "@/features/books/types"

export function ColoringBooksPage() {
  const bookIdRef = useRef<string | null>(null)

  const {
    activeStep,
    setActiveStep,
    searchTerm,
    setSearchTerm,
    selectedCat,
    setSelectedCat,
    selectedIds,
    setSelectedIds,
    title,
    setTitle,
    subtitle,
    setSubtitle,
    author,
    setAuthor,
    childName,
    setChildName,
    selectedCover,
    setSelectedCover,
    selectedPalette,
    setSelectedPalette,
    drawingStyle,
    setDrawingStyle,
    contourThickness,
    setContourThickness,
    bookFormat,
    setBookFormat,
    orientation,
    setOrientation,
    pageNumbers,
    setPageNumbers,
    addTitlePage,
    setAddTitlePage,
    belongsTo,
    setBelongsTo,
    educationalText,
    setEducationalText,
    funFact,
    setFunFact,
    questions,
    setQuestions,
    optimizeInk,
    setOptimizeInk,
    rectoOnly,
    setRectoOnly,
    cutMarks,
    setCutMarks,
    bindingMargin,
    setBindingMargin,
    isPreviewOpen,
    setIsPreviewOpen,
    zoomScale,
    setZoomScale,
    currentBookPage,
    setCurrentBookPage,
    generationProgress,
    setGenerationProgress,
    isGenerating,
    setIsGenerating,
    bleed,
    setBleed,
    copiesCount,
    setCopiesCount,
    selectedDrawings: selectedDrawingsList,
    bookPages,
    totalPagesCount,
    calculatedPdfWeight,
    validate,
  } = useBookWizard()

  const activeProfileId = useProfileStore((s) => s.activeProfileId)
  const viewerContainerRef = useRef<HTMLDivElement>(null)
  const generationTimerRef = useRef<number | null>(null)
  const [step2Tab, setStep2Tab] = useState<"couverture" | "style" | "format" | "options">("couverture")
  const [expanded, setExpanded] = useState(false)
  const drawingsGridRef = useRef<HTMLDivElement>(null)

  const { status: genStatus, error: genError, generate } = useBookPdf()

  // Modèle de domaine unique consommé par l'impression et le PDF.
  const book: ColoringBook = useMemo(
    () => toColoringBook(useBookStore.getState()),
    [bookPages, title, subtitle, author, childName, selectedCover, selectedPalette, drawingStyle, bookFormat, orientation, pageNumbers, addTitlePage, belongsTo, optimizeInk, rectoOnly, cutMarks, bindingMargin, bleed],
  )

  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([])

  useEffect(() => {
    drawingService.list().then((list) => {
      window.setTimeout(() => {
        setSavedDrawings(list)
        
        // Populate customDrawings list in useBookStore
        const mappedList = list.map((draw) => ({
          id: draw.id,
          name: draw.name,
          image: draw.isColored ? draw.image : draw.template.image,
          category: draw.category,
          isPersonal: draw.isColored,
        }))
        useBookStore.getState().setCustomDrawings(mappedList)
      }, 0)
    }).catch((e) => {
      console.error("Error loading saved drawings for book selector:", e)
    })
  }, [])

  const allAvailableDrawings = [
    ...libraryDrawings,
    ...savedDrawings.map((draw) => ({
      id: draw.id,
      name: draw.name,
      image: draw.isColored ? draw.image : draw.template.image,
      category: draw.category,
      isPersonal: draw.isColored,
      svg: draw.isColored ? getDrawingSvg(draw.id) : undefined,
    })),
  ]

  // Auto-fill book info from active profile (only when no book has been loaded)
  useEffect(() => {
    if (title && title !== "Coloriages de ") return
    const profile = useProfileStore.getState().profiles.find((p) => p.id === useProfileStore.getState().activeProfileId)
    if (profile) {
      setChildName(profile.name)
      setAuthor(`Maman & ${profile.name}`)
      setTitle(`Coloriages de ${profile.name}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId])

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) {
        window.clearInterval(generationTimerRef.current)
      }
    }
  }, [])

  // Trigger a short non-blocking generation preview.
  const handleStartGeneration = () => {
    if (generationTimerRef.current) {
      window.clearInterval(generationTimerRef.current)
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    generationTimerRef.current = window.setInterval(() => {
      setGenerationProgress((prev) => {
        const next = Math.min(prev + 20, 100)

        if (next >= 100) {
          if (generationTimerRef.current) {
            window.clearInterval(generationTimerRef.current)
            generationTimerRef.current = null
          }

          setIsGenerating(false)
          import("canvas-confetti").then((module) => {
            const confetti = module.default
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
            })
          })
        }

        return next
      })
    }, 120)
  }

  // Handle step transitions
  const handleNextStep = () => {
    if (activeStep < 4) {
      const next = (activeStep + 1) as 1 | 2 | 3 | 4
      if (!validate()) return
      setActiveStep(next)
      if (next === 4) {
        saveBookToLibrary()
        handleStartGeneration()
      }
    }
  }

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((activeStep - 1) as 1 | 2 | 3 | 4)
    }
  }

  // Toggle selection handler
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      if (selectedIds.length >= 50) return // Limit selection to 50
      setSelectedIds([...selectedIds, id])
    }
  }

  // Filter drawings list
  const filteredDrawings = allAvailableDrawings.filter((drawing) => {
    const matchesSearch = drawing.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCat === "all" || drawing.category === selectedCat
    return matchesSearch && matchesCategory
  })

  // UX: show only the first 8 drawings by default; "Voir plus" reveals the rest.
  const visibleDrawings = expanded
    ? filteredDrawings
    : filteredDrawings.slice(0, 8)

  const handleFilterChange = (apply: () => void) => {
    setExpanded(false)
    apply()
  }
  const handleDownloadPdf = () => {
    void generate(book)
  }


  // Save configurations simulation
  const handleSaveConfigs = () => {
    saveBookToLibrary()
    import("canvas-confetti").then((module) => {
      const confetti = module.default
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ["#6D4CFF", "#20C997", "#FFD95C"]
      })
    })
  }

  // Save book to library as draft
  const saveBookToLibrary = async () => {
    try {
      const profileId = useProfileStore.getState().activeProfileId || "anonymous"
      const bookId = bookIdRef.current || crypto.randomUUID()
      bookIdRef.current = bookId

      const pagesRef = selectedIds.map((id, idx) => ({
        drawingId: id,
        pageNumber: idx + 1,
      }))

      const now = new Date().toISOString()
      await bookService.save({
        id: bookId,
        title: title || "Mon livre de coloriage",
        subtitle: subtitle || "",
        author: author || "Auteur",
        childName: childName || "Enfant",
        cover: selectedCover as CoverTemplate,
        palette: selectedPalette as CoverPalette,
        style: drawingStyle as BookStyle,
        frame: "Aucun" as BookFrame,
        format: bookFormat as BookFormat,
        orientation: orientation as BookOrientation,
        pages: pagesRef,
        status: "draft",
        pdfUrl: "",
        coverImageUrl: "",
        profileId: profileId,
        createdAt: now,
        updatedAt: now,
      })
    } catch (err) {
      console.error("Failed to save book to library:", err)
    }
  }

  // Reset to fitting scale
  const handleFitWidth = () => {
    setZoomScale(1.0)
  }

  // Auto-trigger download or print from query param (?action=download | ?action=print)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const action = params.get("action")
    if (action === "print") {
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
    if (action === "download") {
      const timer = setTimeout(handleDownloadPdf, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <BookProvider>
    <div className="no-print w-full flex flex-col gap-6 select-none font-sans text-[#1F2937] bg-[#FFFDF7] p-2 sm:p-4 rounded-[32px] min-h-screen">
      
      <BookHeader />

      <BookStepper
        activeStep={activeStep}
        selectedCount={selectedIds.length}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        setActiveStep={setActiveStep}
      />

      {/* 3. WIZARD PAGES WITH TRANSITIONS */}
      <div className="w-full relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_0.9fr] xl:grid-cols-[1.5fr_1.1fr_0.9fr] gap-6 items-start"
            >
              {/* ================= STEP 1: COLONNE GAUCHE ================= */}
              <div className="flex flex-col gap-6">
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-extrabold text-[#1F2937]">
                      1. Choisir les dessins
                    </h2>
                    <span className="text-[10px] font-extrabold bg-[#6D4CFF]/10 text-[#6D4CFF] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Dessins
                    </span>
                  </div>

                  {/* Search and Categories Selection */}
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <Input
                        placeholder="Rechercher un dessin (ex : éléphant, école...)"
                        value={searchTerm}
                        onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                        className="pl-11 pr-4 h-[46px] rounded-2xl border border-[#E5E7EB] bg-[#FAFAFC] text-sm font-semibold text-[#1F2937] placeholder-[#64748B]/60 focus-visible:ring-1 focus-visible:ring-[#6D4CFF]"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleFilterChange(() => setSelectedCat(cat.id))}
                          className={cn(
                            "flex items-center gap-1.5 px-4 h-9 rounded-full font-extrabold text-[13px] border transition-all shrink-0 cursor-pointer",
                            selectedCat === cat.id
                              ? "bg-[#6D4CFF] border-[#6D4CFF] text-white shadow-sm scale-102"
                              : "bg-white border-[#E5E7EB] text-[#64748B] hover:bg-neutral-50"
                          )}
                        >
                          <cat.icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drawings Grid */}
                  <motion.div
                    ref={drawingsGridRef}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence initial={false}>
                      {visibleDrawings.map((draw) => {
                        const isSelected = selectedIds.includes(draw.id)
                        return (
                          <motion.div
                            key={draw.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => handleToggleSelect(draw.id)}
                            className={cn(
                              "w-full aspect-[4/5] rounded-[18px] border p-2 flex flex-col justify-between cursor-pointer transition-all shadow-sm bg-white overflow-hidden select-none relative group",
                              isSelected
                                ? "border-[2px] border-[#6D4CFF] ring-2 ring-[#6D4CFF]/10 bg-[#6D4CFF]/2"
                                : "border-[#E5E7EB] hover:border-[#6D4CFF]/40"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5.5 h-5.5 rounded-full bg-[#22C55E] text-white flex items-center justify-center z-10 shadow-sm border border-white">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}

                            {draw.isPersonal && (
                              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#22C55E] text-white text-[9px] font-black uppercase tracking-wider z-10 shadow-sm">
                                Mes dessins
                              </div>
                            )}

                            <div className="flex-1 w-full relative flex items-center justify-center bg-[#FAFAFC] rounded-[12px] overflow-hidden p-2">
                              <Image
                                src={draw.image}
                                alt={draw.name}
                                fill
                                unoptimized={draw.isPersonal}
                                className="object-contain p-2 group-hover:scale-102 transition-transform duration-200"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2 px-1">
                              <span className="text-[12px] font-extrabold text-[#1F2937] truncate">
                                {draw.name}
                              </span>
                              {!isSelected && (
                                <div className="w-5.5 h-5.5 rounded-full border border-[#6D4CFF]/40 flex items-center justify-center text-[#6D4CFF] hover:bg-[#6D4CFF]/10 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>

                    {filteredDrawings.length === 0 && (
                      <div className="col-span-4 text-center py-10 text-xs font-bold text-[#64748B]">
                        Aucun dessin trouvé dans cette catégorie.
                      </div>
                    )}
                  </motion.div>

                  {/* Voir plus / Voir moins */}
                  {filteredDrawings.length > 8 && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-2 pt-2"
                    >
                      <button
                        onClick={() => {
                          if (expanded) {
                            setExpanded(false)
                            drawingsGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                          } else {
                            setExpanded(true)
                          }
                        }}
                        className="flex items-center gap-2 px-6 h-11 rounded-full bg-[#6D4CFF] text-white text-sm font-extrabold shadow-sm hover:bg-[#5B3FDF] transition-colors cursor-pointer"
                      >
                        {expanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Voir plus ({filteredDrawings.length - 8})
                          </>
                        )}
                      </button>
                      <p className="text-[11px] font-bold text-[#64748B]">
                        {expanded
                          ? `${filteredDrawings.length} dessins affichés`
                          : `Affichage de 8 sur ${filteredDrawings.length} dessins`}
                      </p>
                    </motion.div>
                  )}
                </Card>

                {/* Selected drawings list at bottom */}
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-[#1F2937]">
                      Sélectionnés : {selectedIds.length} / 50 dessins
                    </span>
                    {selectedIds.length > 0 && (
                      <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs font-bold text-[#EF4444] hover:underline cursor-pointer"
                      >
                        Tout enlever
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none min-h-[110px] items-stretch">
                    <AnimatePresence>
                      {selectedDrawingsList.map((draw) => (
                        <motion.div
                          key={draw.id}
                          initial={{ opacity: 0, scale: 0.8, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: -10 }}
                          className="relative w-[80px] h-[100px] rounded-xl border border-[#E5E7EB] p-1.5 flex flex-col items-center justify-center bg-white shadow-sm shrink-0 group select-none"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleSelect(draw.id)
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-sm opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          
                          <div className="w-full h-full relative flex items-center justify-center bg-[#FAFAFC] rounded-lg overflow-hidden p-1">
                            <Image
                              src={draw.image}
                              alt={draw.name}
                              width={60}
                              height={60}
                              unoptimized={draw.isPersonal}
                              className="object-contain"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div
                      onClick={() => {
                        const searchInput = document.querySelector<HTMLInputElement>('[placeholder="Rechercher un dessin"]')
                        searchInput?.focus()
                        searchInput?.scrollIntoView({ behavior: "smooth", block: "center" })
                      }}
                      className="w-[80px] h-[100px] rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#6D4CFF]/50 flex flex-col items-center justify-center gap-1 bg-[#FAFAFC]/40 cursor-pointer shrink-0 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-[#64748B]" />
                      <span className="text-[10px] font-bold text-[#64748B]">Ajouter plus</span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-4">
                    <Button 
                      onClick={() => {
                        if (!validate()) return
                        setActiveStep(2)
                      }}
                      disabled={selectedIds.length === 0}
                      className="w-full h-[52px] rounded-[18px] bg-[#22C55E] text-white hover:bg-[#22C55E]/90 font-bold text-sm flex items-center justify-center gap-1.5 shadow-md border-none cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Personnaliser</span>
                    </Button>
                  </motion.div>
                </Card>
              </div>

              {/* ================= STEP 1: COLONNE CENTRALE ================= */}
              <div className="flex flex-col gap-6">
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col items-center gap-5">
                  <h3 className="text-[16px] font-extrabold text-[#1F2937] self-start">
                    Aperçu de la couverture
                  </h3>

                  <div className="w-full relative flex justify-center items-center py-2">
                    <BookPreviewCanvas
                      selectedCover={selectedCover}
                      selectedPalette={selectedPalette}
                      title={title}
                      subtitle={subtitle}
                      childName={childName}
                      author={author}
                      orientation={orientation}
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full">
                    <Button 
                      onClick={() => {
                        if (!validate()) return
                        setActiveStep(2)
                      }}
                      variant="outline" 
                      className="w-full h-11 rounded-[16px] border border-[#6D4CFF]/20 text-[#6D4CFF] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#6D4CFF]/5 bg-transparent cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Personnaliser la couverture</span>
                    </Button>
                  </motion.div>
                </Card>

              </div>

              {/* ================= STEP 1: COLONNE DROITE ================= */}
              <div className="flex flex-col gap-6">
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-5">
                  <h3 className="text-[16px] font-extrabold text-[#1F2937] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#6D4CFF]" /> Résumé de ton livre
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3.5 h-[52px] rounded-2xl bg-[#6D4CFF]/5 border border-[#6D4CFF]/10 px-3">
                        <div className="w-8 h-8 rounded-full bg-[#6D4CFF] text-white flex items-center justify-center shrink-0">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[10px] font-bold text-[#64748B]">Dessins</span>
                          <span className="text-[13px] font-extrabold text-[#1F2937] mt-1">{selectedIds.length} dessins</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 h-[52px] rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/10 px-3">
                        <div className="w-8 h-8 rounded-full bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[10px] font-bold text-[#64748B]">Pages</span>
                          <span className="text-[13px] font-extrabold text-[#1F2937] mt-1">{totalPagesCount} pages</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 h-[52px] rounded-2xl bg-[#FBBF24]/5 border border-[#FBBF24]/10 px-3">
                        <div className="w-8 h-8 rounded-full bg-[#FBBF24] text-white flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[10px] font-bold text-[#64748B]">Format</span>
                          <span className="text-[13px] font-extrabold text-[#1F2937] mt-1">{bookFormat} ({orientation})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button 
                          onClick={() => {
                            if (!validate()) return
                            setActiveStep(2)
                          }}
                          disabled={selectedIds.length === 0}
                          className="w-full h-11 rounded-[16px] bg-[#22C55E] text-white hover:bg-[#22C55E]/90 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md border-none cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Personnaliser</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>

                {/* Bottom info */}
                <Card className="rounded-[24px] border border-[#22C55E]/20 p-5 bg-[#F0FDF4] shadow-sm flex gap-4 select-none relative overflow-hidden">
                  <div className="p-2 rounded-xl bg-[#22C55E]/10 text-[#22C55E] shrink-0 mt-0.5 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-[#16A34A] leading-tight">
                      Livre PDF prêt à l&apos;emploi
                    </span>
                    <p className="text-[10px] font-semibold text-[#16A34A] leading-normal mt-0.5">
                      Génère un livre prêt à imprimer pour des heures de coloriage ludique !
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8 items-start"
            >
              <div className="flex flex-col gap-6">
                {/* Mobile Preview Accordion */}
                <div className="lg:hidden w-full">
                  <Card className="rounded-[24px] border border-[#E5E7EB] bg-white shadow-md overflow-hidden">
                    <button
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="w-full flex items-center justify-between p-5 bg-neutral-50/50 hover:bg-neutral-50 transition-colors font-extrabold text-sm text-[#1F2937] focus:outline-none"
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-[#6D4CFF]" />
                        <span>Aperçu en direct ({selectedIds.length} dessins)</span>
                      </span>
                      {isPreviewOpen ? <ChevronUp className="w-5 h-5 text-[#64748B]" /> : <ChevronDown className="w-5 h-5 text-[#64748B]" />}
                    </button>
                    <AnimatePresence>
                      {isPreviewOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-[#E5E7EB] p-5 flex flex-col gap-4 bg-[#FFFDF7]"
                        >
                          <BookPreviewCanvas
                            selectedCover={selectedCover}
                            selectedPalette={selectedPalette}
                            title={title}
                            subtitle={subtitle}
                            childName={childName}
                            author={author}
                            orientation={orientation}
                          />
                          <div className="grid grid-cols-2 gap-3 text-xs font-semibold bg-white p-4 rounded-xl border border-neutral-100">
                            <div><BookOpen className="w-3.5 h-3.5 inline-block mr-1" /> Pages: <span className="font-extrabold text-[#6D4CFF]">{totalPagesCount} pages</span></div>
                            <div><Package className="w-3.5 h-3.5 inline-block mr-1" /> Poids: <span className="font-extrabold text-[#20C997]">{calculatedPdfWeight} MB</span></div>
                            <div><Ruler className="w-3.5 h-3.5 inline-block mr-1" /> Format: <span className="font-extrabold text-[#FFB300]">{bookFormat}</span></div>
                            <div><Compass className="w-3.5 h-3.5 inline-block mr-1" /> Orientation: <span className="font-extrabold text-[#1194FF]">{orientation}</span></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </div>

                {/* Pill tabs */}
                <div className="flex gap-1.5 bg-white p-1.5 rounded-[20px] border border-[#E5E7EB]/80 shadow-sm overflow-x-auto no-scrollbar">
                  {[
                    { id: "couverture", label: "Couverture", icon: BookOpen },
                    { id: "style", label: "Style", icon: Eye },
                    { id: "format", label: "Format", icon: Package },
                    { id: "options", label: "Options", icon: Plus },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const active = step2Tab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setStep2Tab(tab.id as typeof step2Tab)}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer",
                          active
                            ? "bg-[#6D4CFF] text-white shadow-md"
                            : "text-[#64748B] hover:text-[#1F2937] hover:bg-[#F3EFFF]"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  {/* ---- COUVERTURE TAB ---- */}
                  {step2Tab === "couverture" && (
                    <motion.div
                      key="tab-couverture"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-5"
                    >
                      {/* Book info - compact card */}
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                              Titre <span className="text-red-500">*</span>
                            </label>
                            <Input
                              maxLength={50}
                              placeholder="Ex: Les animaux de la savane"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="h-[44px] rounded-[14px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#6D4CFF]"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Enfant</label>
                            <Input
                              placeholder="Ex: Awa"
                              value={childName}
                              onChange={(e) => setChildName(e.target.value)}
                              className="h-[44px] rounded-[14px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#6D4CFF]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cover templates - horizontal scroll */}
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Couverture</h4>
                        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                          {[
                            { id: "petit-baobab", name: "Petit Baobab", bg: "bg-[#FFF4DD]" },
                            { id: "savane", name: "Savane", bg: "bg-[#FFF6E0]" },
                            { id: "ecole", name: "École", bg: "bg-[#EAF3FF]" },
                            { id: "afrique", name: "Afrique", bg: "bg-[#FDEAF3]" },
                            { id: "coloree", name: "Colorée", bg: "bg-[#E6F8F0]" },
                            { id: "ia", name: "Générée par IA", bg: "bg-[#F4ECF7]" },
                          ].map((cov) => (
                            <button
                              key={cov.id}
                              onClick={() => setSelectedCover(cov.id)}
                              className={cn(
                                "flex-shrink-0 w-[100px] rounded-[14px] border-2 p-3 flex flex-col items-center gap-2 cursor-pointer transition-all",
                                selectedCover === cov.id
                                  ? "border-[#6D4CFF] ring-2 ring-[#6D4CFF]/15 bg-[#6D4CFF]/5"
                                  : "border-[#E5E7EB] hover:border-[#6D4CFF]/40"
                              )}
                            >
                              <div className={cn("w-full h-[52px] rounded-[10px] flex items-center justify-center overflow-hidden", cov.bg)}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`/illustrations/covers/cover-${cov.id}.svg`}
                                  alt={cov.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                              <span className="text-[9px] font-bold text-[#1F2937] text-center leading-tight">{cov.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Palette */}
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Palette</h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          {[
                            { name: "Purple", color: "bg-[#6D4CFF]" },
                            { name: "Green", color: "bg-[#20C997]" },
                            { name: "Yellow", color: "bg-[#FFD95C]" },
                            { name: "Orange", color: "bg-[#FFB300]" },
                            { name: "Blue", color: "bg-[#1194FF]" },
                            { name: "Pink", color: "bg-[#FF5E83]" },
                            { name: "Turquoise", color: "bg-[#13C6A2]" },
                            { name: "Multicolore", color: "bg-gradient-to-br from-[#FF5E83] via-[#FFD95C] via-[#20C997] to-[#6D4CFF]" },
                          ].map((pal) => (
                            <button
                              key={pal.name}
                              onClick={() => setSelectedPalette(pal.name)}
                              className={cn(
                                "w-8 h-8 rounded-full cursor-pointer transition-all border border-neutral-200/50",
                                pal.color,
                                selectedPalette === pal.name
                                  ? "ring-3 ring-[#6D4CFF] ring-offset-2 scale-110"
                                  : "hover:ring-2 hover:ring-[#6D4CFF]/50"
                              )}
                              title={pal.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Subtitle + Author inline (compact) */}
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Sous-titre</label>
                            <Input
                              maxLength={50}
                              placeholder="Ex: Mon super livre"
                              value={subtitle}
                              onChange={(e) => setSubtitle(e.target.value)}
                              className="h-[44px] rounded-[14px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#6D4CFF]"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Auteur</label>
                            <Input
                              placeholder="Ex: Maman & Awa"
                              value={author}
                              onChange={(e) => setAuthor(e.target.value)}
                              className="h-[44px] rounded-[14px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#6D4CFF]"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ---- STYLE TAB ---- */}
                  {step2Tab === "style" && (
                    <motion.div
                      key="tab-style"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-5"
                    >
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Style du dessin</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { name: "Contour simple", desc: "Trait propre", Icon: Pencil },
                            { name: "Noir & Blanc détaillé", desc: "Ombrages", Icon: Contrast },
                            { name: "Contours épais", desc: "Pour les petits", Icon: Minus },
                            { name: "Version couleur", desc: "Livre coloré", Icon: Palette },
                          ].map((st) => {
                            const active = drawingStyle === st.name
                            return (
                              <button
                                key={st.name}
                                onClick={() => setDrawingStyle(st.name)}
                                className={cn(
                                  "rounded-[14px] border-2 p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all",
                                  active
                                    ? "border-[#6D4CFF] ring-2 ring-[#6D4CFF]/15 bg-[#6D4CFF]/5"
                                    : "border-[#E5E7EB] hover:border-[#6D4CFF]/40"
                                )}
                              >
                                <st.Icon className="w-5 h-5 text-[#3B2416]" />
                                <span className="text-[10px] font-black text-[#1F2937] text-center leading-tight">{st.name}</span>
                                <span className="text-[8px] font-semibold text-[#64748B]">{st.desc}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Épaisseur des contours</h4>
                          <span className="text-xs font-extrabold text-[#6D4CFF] bg-[#6D4CFF]/10 px-2.5 py-0.5 rounded-full">{contourThickness}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-[#64748B]">Fin</span>
                          <Slider
                            value={[contourThickness]}
                            onValueChange={(val) => setContourThickness(val[0])}
                            max={100}
                            step={1}
                            className="flex-1 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-[#64748B]">Épais</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ---- FORMAT TAB ---- */}
                  {step2Tab === "format" && (
                    <motion.div
                      key="tab-format"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-5"
                    >
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Format</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: "A4", name: "A4", dim: "21 x 29.7 cm" },
                            { id: "A5", name: "A5", dim: "14.8 x 21 cm" },
                            { id: "Letter", name: "US Letter", dim: "21.6 x 27.9 cm" },
                            { id: "Carré", name: "Carré", dim: "21 x 21 cm" },
                          ].map((f) => {
                            const active = bookFormat === f.id
                            return (
                              <button
                                key={f.id}
                                onClick={() => setBookFormat(f.id)}
                                className={cn(
                                  "rounded-[14px] border-2 p-3 flex flex-col items-center gap-1 cursor-pointer transition-all",
                                  active
                                    ? "border-[#6D4CFF] ring-2 ring-[#6D4CFF]/15 bg-[#6D4CFF]/5"
                                    : "border-[#E5E7EB] hover:border-[#6D4CFF]/40"
                                )}
                              >
                                <span className="text-sm font-black text-[#1F2937]">{f.name}</span>
                                <span className="text-[9px] font-bold text-[#64748B]">{f.dim}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Orientation</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "Portrait", name: "Portrait", desc: "Vertical" },
                            { id: "Paysage", name: "Paysage", desc: "Horizontal" },
                            { id: "Carré", name: "Carré", desc: "1:1" },
                          ].map((o) => {
                            const active = orientation === o.id
                            return (
                              <button
                                key={o.id}
                                onClick={() => setOrientation(o.id)}
                                className={cn(
                                  "rounded-[14px] border-2 p-3 flex flex-col items-center gap-1 cursor-pointer transition-all",
                                  active
                                    ? "border-[#6D4CFF] ring-2 ring-[#6D4CFF]/15 bg-[#6D4CFF]/5"
                                    : "border-[#E5E7EB] hover:border-[#6D4CFF]/40"
                                )}
                              >
                                <span className="text-xs font-black text-[#1F2937]">{o.name}</span>
                                <span className="text-[9px] font-bold text-[#64748B]">{o.desc}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ---- OPTIONS TAB ---- */}
                  {step2Tab === "options" && (
                    <motion.div
                      key="tab-options"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-5"
                    >
                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Ajouts au livre</h4>
                        <div className="flex flex-col gap-2">
                          {[
                            { state: pageNumbers, setter: setPageNumbers, title: "Numéroter les pages", desc: "Affiche le numéro en bas" },
                            { state: addTitlePage, setter: setAddTitlePage, title: "Page de garde", desc: "Page de couverture personnalisée" },
                            { state: belongsTo, setter: setBelongsTo, title: '"Ce livre appartient à"', desc: "Page d'identification enfant" },
                            { state: educationalText, setter: setEducationalText, title: "Texte éducatif", desc: "Petites phrases pour apprendre" },
                            { state: funFact, setter: setFunFact, title: "Fait amusant", desc: "Anecdotes rigolotes" },
                            { state: questions, setter: setQuestions, title: "Questions", desc: "Mini-jeux et questions" },
                          ].map((opt, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-[12px] bg-[#FAFAFC]/80 border border-neutral-50">
                              <div className="flex flex-col leading-tight">
                                <span className="text-xs font-black text-[#1F2937]">{opt.title}</span>
                                <span className="text-[9px] font-semibold text-[#64748B]">{opt.desc}</span>
                              </div>
                              <button
                                onClick={() => opt.setter(!opt.state)}
                                className={cn(
                                  "w-[40px] h-[22px] rounded-full transition-colors relative shrink-0 border border-[#E5E7EB] cursor-pointer",
                                  opt.state ? "bg-[#22C55E]" : "bg-neutral-200"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-0.5 w-[17px] h-[17px] rounded-full bg-white transition-all shadow-sm",
                                  opt.state ? "left-[20px]" : "left-0.5"
                                )} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-[20px] border border-[#E5E7EB]/80 p-4 shadow-sm">
                        <h4 className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-3">Impression</h4>
                        <div className="flex flex-col gap-2">
                          {[
                            { state: optimizeInk, setter: setOptimizeInk, title: "Optimiser l'encre", desc: "Lignes plus fines" },
                            { state: rectoOnly, setter: setRectoOnly, title: "Recto uniquement", desc: "Page blanche au verso" },
                            { state: cutMarks, setter: setCutMarks, title: "Repères de coupe", desc: "Pour couper le papier" },
                            { state: bindingMargin, setter: setBindingMargin, title: "Marge de reliure", desc: "Espace pour agrafer" },
                          ].map((opt, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-[12px] bg-[#FAFAFC]/80 border border-neutral-50">
                              <div className="flex flex-col leading-tight">
                                <span className="text-xs font-black text-[#1F2937]">{opt.title}</span>
                                <span className="text-[9px] font-semibold text-[#64748B]">{opt.desc}</span>
                              </div>
                              <button
                                onClick={() => opt.setter(!opt.state)}
                                className={cn(
                                  "w-[40px] h-[22px] rounded-full transition-colors relative shrink-0 border border-[#E5E7EB] cursor-pointer",
                                  opt.state ? "bg-[#22C55E]" : "bg-neutral-200"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-0.5 w-[17px] h-[17px] rounded-full bg-white transition-all shadow-sm",
                                  opt.state ? "left-[20px]" : "left-0.5"
                                )} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ACTION BUTTONS */}
                <div className="flex items-center justify-between gap-4 py-2">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handlePrevStep}
                      className="h-11 px-5 rounded-2xl border border-neutral-200 bg-white text-[#64748B] hover:bg-neutral-50 font-extrabold text-sm cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour</span>
                    </Button>
                  </motion.div>

                  <div className="flex items-center gap-2.5">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleSaveConfigs}
                        className="h-11 px-4 rounded-2xl border border-[#6D4CFF]/20 bg-[#6D4CFF]/5 text-[#6D4CFF] hover:bg-[#6D4CFF]/10 font-extrabold text-sm cursor-pointer"
                      >
                        Enregistrer
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleNextStep}
                        className="h-11 px-5 rounded-2xl bg-[#6D4CFF] text-white hover:bg-[#6D4CFF]/90 font-extrabold text-sm cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <span>Aperçu</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT COLUMN: STICKY PREVIEW ================= */}
              <div className="hidden lg:block sticky top-8 flex flex-col gap-6 w-[360px] xl:w-[380px] shrink-0">
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-md flex flex-col items-center gap-5">
                  <h3 className="text-sm font-extrabold text-[#64748B] uppercase tracking-wider self-start flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#6D4CFF]" /> Aperçu
                  </h3>
                  <div className="w-full flex justify-center items-center py-2 bg-neutral-50/20 rounded-2xl border border-dashed border-neutral-100/85">
                    <BookPreviewCanvas
                      selectedCover={selectedCover}
                      selectedPalette={selectedPalette}
                      title={title}
                      subtitle={subtitle}
                      childName={childName}
                      author={author}
                      orientation={orientation}
                    />
                  </div>
                  <div className="w-full h-[1px] bg-neutral-100 my-1" />
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#64748B]">Dessins</span>
                      <span className="font-black text-[#1F2937]">{selectedIds.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#64748B]">Pages</span>
                      <span className="font-black text-[#1F2937]">{totalPagesCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#64748B]">Format</span>
                      <span className="font-black text-[#1F2937] capitalize">{bookFormat} / {orientation}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs bg-[#FAFAFC] p-2.5 rounded-xl border border-neutral-100">
                      <span className="font-semibold text-[#64748B]">Poids estimé</span>
                      <span className="font-black text-[#20C997]">{calculatedPdfWeight} MB</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8 items-start w-full"
            >
              {/* ================= COLONNE GAUCHE (65% PREVIEW) ================= */}
              <div className="flex flex-col gap-6 w-full">
                
                {/* SECTION 1: Titre & Sous-titre */}
                <div>
                  <h2 className="text-[24px] font-black text-[#1F2937] flex items-center gap-2">
                    <Eye className="w-5 h-5 inline-block mr-1" /> Aperçu de votre livre
                  </h2>
                  <p className="text-sm font-semibold text-[#64748B] mt-1">
                    Vérifiez votre livre avant de le télécharger ou de l&apos;imprimer.
                  </p>
                </div>

                {/* SECTION 2: Visionneuse du livre */}
                <Card className="rounded-[28px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm h-[720px] flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Top Zoom Controls */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-2 shrink-0 z-10 bg-white">
                    <span className="text-xs font-black text-[#1F2937]">Visualiseur A4</span>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.1))}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                        title="Zoom arrière"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-extrabold text-[#6D4CFF] bg-[#6D4CFF]/5 px-2.5 py-1 rounded-full w-[54px] text-center">
                        {Math.round(zoomScale * 100)}%
                      </span>

                      <button
                        onClick={() => setZoomScale((z) => Math.min(1.5, z + 0.1))}
                        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                        title="Zoom avant"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <div className="h-4 w-[1px] bg-neutral-200 mx-1" />

                      <Button
                        onClick={handleFitWidth}
                        variant="outline"
                        className="h-8 rounded-lg px-2.5 text-[11px] font-bold border border-[#6D4CFF]/20 text-[#6D4CFF] hover:bg-[#6D4CFF]/5 bg-transparent cursor-pointer"
                      >
                        Ajuster à la largeur
                      </Button>
                    </div>
                  </div>

                  {/* Centered book area */}
                  <div 
                    ref={viewerContainerRef}
                    className="flex-1 w-full flex items-center justify-center overflow-auto bg-neutral-50/50 rounded-2xl border border-[#E5E7EB] p-4 relative"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentBookPage}
                        initial={{ rotateY: -15, opacity: 0, scale: 0.95 }}
                        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                        exit={{ rotateY: 15, opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        style={{ 
                          width: `${420 * zoomScale}px`, 
                          height: `${595 * zoomScale}px`,
                          perspective: 1200 
                        }}
                        className="relative bg-white shadow-md overflow-hidden flex flex-col justify-between p-6 select-none origin-center shrink-0 border border-neutral-200/40 rounded-sm"
                      >
                        {/* Book Page rendering */}
                        {bookPages[currentBookPage]?.type === "cover" ? (
                          <div className="w-full h-full flex flex-col justify-center items-center origin-center">
                            <BookPreviewCanvas
                              selectedCover={selectedCover}
                              selectedPalette={selectedPalette}
                              title={title}
                              subtitle={subtitle}
                              childName={childName}
                              author={author}
                              orientation={orientation}
                              scale={zoomScale}
                            />
                          </div>
                        ) : bookPages[currentBookPage]?.type === "belongs_to" ? (
                          <div className="w-full h-full flex flex-col justify-between items-center border-[8px] border-dashed border-[#6D4CFF]/30 p-8 font-nunito bg-[#FFFDF7]/50 rounded-lg">
                            <div className="w-full flex justify-between items-center text-[10px] font-black text-[#6D4CFF]/40">
                              <span>PETIT BAOBAB</span>
                              <span>PAGE DE GARDE</span>
                            </div>

                            <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
                              <Gift className="w-12 h-12 text-[#6D4CFF]" />
                              <h2 className="text-2xl font-black text-[#3B2416] tracking-tight uppercase">Ce livre appartient à :</h2>
                              <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFD95C] to-[#FFE08A] border-2 border-[#3B2416] shadow-sm transform -rotate-1">
                                <span className="text-3xl font-extrabold text-[#3B2416] font-nunito">{childName || "Awa"}</span>
                              </div>
                              <p className="text-[11px] font-bold text-[#7A6A5E] italic max-w-[200px] mt-2">
                                Prépare tes plus beaux crayons et amuse-toi bien !
                              </p>
                            </div>

                            <div className="w-full flex justify-between items-center text-[10px] text-[#64748B] font-bold">
                              <span>Page 2</span>
                              <span className="text-[#3B2416]/20 font-black">petitbaobab.com</span>
                            </div>
                          </div>
                        ) : (
                          // Drawing pages
                          <div className="w-full h-full flex flex-col justify-between items-center relative">
                            {/* Top header details */}
                            <div className="w-full flex justify-between items-center text-[10px] font-black text-[#6D4CFF]/40 z-10">
                              <span className="uppercase tracking-widest">{title}</span>
                              <span className="uppercase tracking-wider">Coloriage</span>
                            </div>

                            {/* Drawing illustration */}
                            <div className="flex-1 w-full relative flex items-center justify-center py-6 px-4">
                              {bookPages[currentBookPage] ? (
                                <div className="relative w-[85%] h-[85%] flex items-center justify-center">
                                  <Image
                                    src={bookPages[currentBookPage].image || "/illustrations/animals/elephant.svg"}
                                    alt="coloriage"
                                    fill
                                    className={cn(
                                      "object-contain p-2",
                                      drawingStyle === "Version couleur" ? "" : "grayscale brightness-105 contrast-125"
                                    )}
                                    style={{
                                      filter: drawingStyle === "Contours épais" ? "contrast(200%)" : undefined,
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="text-center p-4">
                                  <Flag className="w-8 h-8 mx-auto text-[#FFB300]" />
                                  <p className="text-xs font-extrabold text-[#64748B] mt-2">Fin du livre</p>
                                </div>
                              )}
                            </div>

                            {/* Optional Fun fact or Educational text */}
                            {(funFact || educationalText) && (
                              <div className="bg-[#FFFDF7] p-2.5 rounded-xl border border-neutral-100 w-[90%] text-center shadow-sm shrink-0 z-10 mb-2">
                                {funFact && (
                                  <>
                                    <span className="text-[9px] font-black text-[#FFB300] uppercase tracking-wider block flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Le Savais-tu ?</span>
                                    <span className="text-[9px] font-extrabold text-[#7A6A5E] leading-tight block mt-0.5">
                                      {bookPages[currentBookPage].title === "Éléphant" ? "L'éléphant communique par infrasons inaudibles pour les humains !" :
                                       bookPages[currentBookPage].title === "Lion" ? "Le rugissement du lion peut s'entendre jusqu'à 8 kilomètres de distance !" :
                                       "Cet animal adore s'amuser sous le soleil de l'Afrique !"}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Footer page details */}
                            <div className="w-full flex items-center justify-between text-[10px] text-[#64748B] font-bold z-10 px-1">
                              {pageNumbers ? (
                                <span>Page {currentBookPage + 1}</span>
                              ) : <span />}
                              <span className="text-[#3B2416]/20 font-black">Petit Baobab</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation below the book */}
                  <div className="flex items-center justify-between mt-4 shrink-0 border-t border-neutral-100 pt-3 z-10">
                    <Button
                      disabled={currentBookPage === 0}
                      onClick={() => setCurrentBookPage((prev) => prev - 1)}
                      className="h-10 px-4 rounded-xl border border-neutral-200 bg-white text-[#64748B] hover:bg-neutral-50 font-extrabold text-xs cursor-pointer disabled:opacity-40"
                    >
                      ← Page précédente
                    </Button>

                    <span className="text-xs font-black text-[#1F2937]">
                      Page {currentBookPage + 1} / {totalPagesCount}
                    </span>

                    <Button
                      disabled={currentBookPage >= totalPagesCount - 1}
                      onClick={() => setCurrentBookPage((prev) => prev + 1)}
                      className="h-10 px-4 rounded-xl border border-neutral-200 bg-white text-[#64748B] hover:bg-neutral-50 font-extrabold text-xs cursor-pointer disabled:opacity-40"
                    >
                      Page suivante →
                    </Button>
                  </div>

                </Card>

                {/* Miniatures horizontales strip */}
                <div className="w-full flex flex-col gap-2 shrink-0">
                  <span className="text-xs font-black text-[#64748B] uppercase tracking-wider px-1">
                    <BookText className="w-5 h-5 inline-block mr-1" /> Pages du livre ({totalPagesCount})
                  </span>

                  <BookIndex pages={bookPages} current={currentBookPage} onSelect={setCurrentBookPage} total={totalPagesCount} />
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-6">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={() => setActiveStep(2)}
                      className="h-12 px-6 rounded-2xl border border-neutral-200 bg-white text-[#64748B] hover:bg-neutral-50 font-extrabold text-sm cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Modifier</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleNextStep}
                      className="h-12 px-8 rounded-2xl bg-[#6D4CFF] text-white hover:bg-[#6D4CFF]/90 font-extrabold text-sm cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <span>Continuer vers Téléchargement</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>

              </div>

              {/* ================= COLONNE DROITE (35% RÉSUMÉ) ================= */}
              <div className="flex flex-col gap-6 w-full shrink-0 lg:max-w-[360px] xl:max-w-[380px]">
                
                {/* SECTION 3: Informations */}
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-black text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                    <Info className="w-4 h-4 text-[#6D4CFF]" /> Informations
                  </h3>

                  <div className="flex flex-col gap-3 text-xs font-semibold text-[#1F2937]">
                    <div className="flex justify-between py-1.5 border-b border-neutral-50">
                      <span className="text-[#64748B]">Format</span>
                      <span className="font-extrabold">{bookFormat} ({bookFormat === "A4" ? "21 x 29.7 cm" : "14.8 x 21 cm"})</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-neutral-50">
                      <span className="text-[#64748B]">Orientation</span>
                      <span className="font-extrabold">{orientation}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-neutral-50">
                      <span className="text-[#64748B]">Nombre de pages</span>
                      <span className="font-extrabold text-[#6D4CFF]">{totalPagesCount} pages</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-neutral-50">
                      <span className="text-[#64748B]">Style graphique</span>
                      <span className="font-extrabold">{drawingStyle}</span>
                    </div>

                    <div className="flex justify-between py-2 bg-[#FAFAFC] p-2.5 rounded-xl border border-neutral-100 mt-1">
                      <span className="text-[#64748B] font-bold">PDF Estimé</span>
                      <span className="font-black text-[#20C997]">{calculatedPdfWeight} MB</span>
                    </div>
                  </div>
                </Card>

                {/* SECTION 4: Validation */}
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-black text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                    <Check className="w-4 h-4 text-[#20C997]" /> Validation
                  </h3>

                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Dessins sélectionnés", done: selectedIds.length > 0 },
                      { label: "Couverture personnalisée", done: true },
                      { label: "Numérotation des pages", done: pageNumbers },
                      { label: "Qualité impression 300 DPI", done: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-bold text-[#1F2937]">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-[#20C997]/10 text-[#20C997]" : "bg-neutral-100 text-[#64748B]"}`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Print Hint Info Card */}
                <Card className="rounded-[24px] border border-[#20C997]/20 p-5 bg-[#F0FDF4] shadow-sm flex gap-4 select-none">
                  <div className="p-2 rounded-xl bg-[#20C997]/10 text-[#20C997] shrink-0 mt-0.5 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-[#16A34A] leading-tight">
                      Prêt pour impression
                    </span>
                    <p className="text-[10px] font-semibold text-[#16A34A] leading-normal mt-0.5">
                      Les repères de coupe et marges de reliure s&apos;appliqueront lors de l&apos;impression finale du PDF.
                    </p>
                  </div>
                </Card>

              </div>
            </motion.div>
          )}

          {activeStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8 items-start"
            >
              {/* =============== STEP 4: COLONNE GAUCHE =============== */}
              <div className="flex flex-col gap-6">

                {/* Header card */}
                <div className="flex flex-col gap-1">
                  <h2 className="text-[28px] font-black text-[#1F2937] flex items-center gap-2 leading-tight">
                    <Download className="w-7 h-7 text-[#1F2937]" /> Télécharger votre livre
                  </h2>
                  <p className="text-[15px] font-semibold text-[#64748B]">
                    Votre livre est prêt ! Téléchargez-le ou demandez une impression professionnelle.
                  </p>
                </div>

                {/* Generation progress + error states */}
                {(isGenerating || genStatus === "generating" || genStatus === "uploading") && (
                  <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-8 bg-white shadow-sm flex flex-col items-center gap-5">
                    <div className="w-12 h-12 rounded-full border-4 border-[#E5E7EB] border-t-[#6D4CFF] animate-spin" />
                    <h3 className="text-xl font-extrabold text-[#1F2937]">
                      {genStatus === "uploading" ? "Sauvegarde de votre livre…" : "Génération du PDF en cours…"}
                    </h3>
                    <Progress.Root
                      className="w-full h-2 overflow-hidden rounded-full bg-[#E5E7EB]"
                      value={generationProgress}
                    >
                      <Progress.Indicator
                        className="h-full bg-[#6D4CFF] transition-transform duration-300"
                        style={{ transform: `translateX(-${100 - (generationProgress || 0)}%)` }}
                      />
                    </Progress.Root>
                    <p className="text-xs font-bold text-[#6D4CFF]">{generationProgress || 0}%</p>
                    <p className="text-xs text-[#64748B] text-center max-w-sm">
                      Nous assemblons {selectedIds.length} coloriages avec la couverture &ldquo;{title}&rdquo; et vos options personnalisées.
                    </p>
                  </Card>
                )}

                {genStatus === "error" && (
                  <Card className="rounded-[24px] border border-red-200 bg-red-50 p-8 shadow-sm flex flex-col items-center gap-4">
                    <h3 className="text-lg font-extrabold text-red-600">La génération a échoué</h3>
                    <p className="text-xs text-red-500 text-center max-w-sm">{genError}</p>
                    <Button
                      onClick={handleDownloadPdf}
                      className="h-11 px-6 rounded-xl bg-[#6D4CFF] text-white font-bold text-sm cursor-pointer"
                    >
                      Réessayer
                    </Button>
                  </Card>
                )}

                {/* Main Download Card (shown after generation) */}
                {generationProgress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="rounded-[28px] border border-[#E5E7EB]/80 p-6 bg-white shadow-xl/5 flex flex-col gap-6">

                      {/* Book Illustration */}
                      <div className="relative w-full rounded-[20px] bg-gradient-to-br from-[#F5F0FF] to-[#EEF7FF] flex flex-col items-center justify-center py-10 overflow-hidden">
                        {/* Decorative background circles */}
                        <div className="absolute w-52 h-52 rounded-full bg-[#6D4CFF]/8 -top-10 -right-10" />
                        <div className="absolute w-32 h-32 rounded-full bg-[#20C997]/8 -bottom-8 -left-8" />

                        {/* Success badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#20C997] text-white flex items-center justify-center shadow-lg z-10"
                        >
                          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                        </motion.div>

                        {/* Book SVG illustration */}
                        <motion.div
                          initial={{ y: 12, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="relative z-10"
                        >
                          <svg width="180" height="220" viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Book shadow */}
                            <ellipse cx="90" cy="208" rx="64" ry="10" fill="#6D4CFF" opacity="0.12" />
                            {/* Back cover */}
                            <rect x="32" y="22" width="118" height="162" rx="10" fill="#E8E3FF" stroke="#C4B8FF" strokeWidth="1.5" />
                            {/* Book spine */}
                            <rect x="32" y="22" width="18" height="162" rx="6" fill="#6D4CFF" opacity="0.7" />
                            {/* Front cover */}
                            <rect x="38" y="16" width="118" height="162" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
                            {/* Cover gradient band */}
                            <rect x="38" y="16" width="118" height="48" rx="10" fill="url(#bookCoverGrad)" />
                            <rect x="38" y="48" width="118" height="16" fill="url(#bookCoverGrad)" />
                            {/* Title line */}
                            <rect x="56" y="32" width="82" height="8" rx="4" fill="white" opacity="0.85" />
                            <rect x="66" y="44" width="62" height="5" rx="2.5" fill="white" opacity="0.55" />
                            {/* Content lines */}
                            <rect x="54" y="82" width="88" height="5" rx="2.5" fill="#E5E7EB" />
                            <rect x="54" y="94" width="70" height="5" rx="2.5" fill="#E5E7EB" />
                            <rect x="54" y="106" width="80" height="5" rx="2.5" fill="#E5E7EB" />
                            <rect x="54" y="118" width="60" height="5" rx="2.5" fill="#E5E7EB" />
                            <rect x="54" y="130" width="75" height="5" rx="2.5" fill="#E5E7EB" />
                            {/* Page lines (pages visible from edge) */}
                            <rect x="152" y="26" width="3" height="148" rx="1.5" fill="#F5F5F5" stroke="#E5E7EB" strokeWidth="0.5" />
                            <rect x="156" y="28" width="2" height="144" rx="1" fill="#FAFAFA" />
                            {/* Baobab illustration on cover */}
                            <circle cx="97" cy="148" r="18" fill="#F1EFFF" />
                            <path d="M94 162 C93 154, 90 144, 88 138 C89 134, 96 132, 97 132 C98 132, 105 134, 106 138 C104 144, 101 154, 100 162 Z" fill="#3B2416" />
                            <circle cx="88" cy="136" r="9" fill="#6D4CFF" opacity="0.8" />
                            <circle cx="106" cy="136" r="9" fill="#6D4CFF" opacity="0.8" />
                            <circle cx="97" cy="130" r="11" fill="#6D4CFF" />
                            {/* Petit Baobab branding */}
                            <text x="97" y="175" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#7A6A5E" opacity="0.6" fontFamily="sans-serif">PETIT BAOBAB</text>
                            <defs>
                              <linearGradient id="bookCoverGrad" x1="38" y1="16" x2="156" y2="64" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#6D4CFF" />
                                <stop offset="1" stopColor="#9B8FFA" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 text-center z-10"
                        >
                          <p className="text-[13px] font-black text-[#1F2937]">{title}</p>
                          <p className="text-[10px] font-semibold text-[#64748B] mt-0.5">Par {author}</p>
                        </motion.div>
                      </div>

                      {/* File Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                         {[
                           { label: "Pages", value: `${totalPagesCount} pages`, Icon: FileText, color: "#6D4CFF" },
                           { label: "Format", value: bookFormat, Icon: Ruler, color: "#1194FF" },
                           { label: "Qualité", value: "300 DPI", Icon: Star, color: "#20C997" },
                           { label: "Taille", value: `${calculatedPdfWeight} Mo`, Icon: HardDrive, color: "#FFB300" },
                         ].map((item) => (
                           <div
                             key={item.label}
                             className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-[#FAFAFC] border border-[#E5E7EB]/80"
                           >
                             <item.Icon className="w-5 h-5" style={{ color: item.color }} />
                            <span className="text-[11px] font-black" style={{ color: item.color }}>{item.value}</span>
                            <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">{item.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Print options checkboxes */}
                      <div className="flex flex-col gap-3 p-4 rounded-[18px] bg-[#FAFAFC] border border-[#E5E7EB]/80">
                        <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Options d&apos;impression</span>
                        {[
                          { label: "Repères de coupe", state: cutMarks, setter: setCutMarks },
                          { label: "Optimiser l'encre (économie)", state: optimizeInk, setter: setOptimizeInk },
                        ].map((opt) => (
                          <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                            <button
                              role="checkbox"
                              aria-checked={opt.state}
                              onClick={() => opt.setter(!opt.state)}
                              className={cn(
                                "w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer",
                                opt.state
                                  ? "bg-[#6D4CFF] border-[#6D4CFF]"
                                  : "bg-white border-[#D1D5DB] group-hover:border-[#6D4CFF]/50"
                              )}
                            >
                              {opt.state && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </button>
                            <span className="text-[13px] font-semibold text-[#374151]">{opt.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Main Action Buttons */}
                      <div className="flex flex-col gap-3 mt-1">
                        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}>
                          <DownloadButton book={book} className="w-full" />
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}>
                          <PrintButton book={book} className="w-full" />
                        </motion.div>
                      </div>
                    </Card>

                    {/* Back button */}
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        onClick={() => setActiveStep(3)}
                        variant="outline"
                        className="h-10 px-5 rounded-xl border border-neutral-200 font-bold text-xs cursor-pointer hover:bg-neutral-50"
                      >
                        ← Retour à l&apos;aperçu
                      </Button>
                      <Button
                        onClick={() => {
                          useBookStore.getState().reset()
                          setActiveStep(1)
                          setGenerationProgress(0)
                          setIsGenerating(false)
                        }}
                        className="h-10 px-5 rounded-xl bg-neutral-100 text-[#64748B] hover:bg-neutral-200 border-none font-bold text-xs cursor-pointer"
                      >
                        Créer un nouveau livre
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* =============== STEP 4: COLONNE DROITE (STICKY SUMMARY) =============== */}
              <div className="flex flex-col gap-5 lg:sticky lg:top-6">

                {/* Order Summary Card */}
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-4">
                  <h3 className="text-[15px] font-extrabold text-[#1F2937] flex items-center gap-2 pb-3 border-b border-neutral-100">
                    <BookOpen className="w-5 h-5 text-[#6D4CFF]" /> Résumé de la commande
                  </h3>

                  <div className="flex flex-col gap-2.5 text-xs font-semibold text-[#1F2937]">
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Titre</span>
                      <span className="font-extrabold text-right max-w-[55%] truncate">{title}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Auteur</span>
                      <span className="font-extrabold">{author}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Dessins</span>
                      <span className="font-extrabold text-[#6D4CFF]">{selectedIds.length} illustrations</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Pages totales</span>
                      <span className="font-extrabold text-[#6D4CFF]">{totalPagesCount} pages</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Format</span>
                      <span className="font-extrabold">{bookFormat} · {orientation}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Style graphique</span>
                      <span className="font-extrabold">{drawingStyle}</span>
                    </div>
                    <div className="flex justify-between py-2 rounded-xl bg-[#F5F0FF] px-3 -mx-1 mt-1">
                      <span className="text-[#64748B] font-bold">Taille PDF estimée</span>
                      <span className="font-black text-[#6D4CFF]">{calculatedPdfWeight} Mo</span>
                    </div>
                  </div>

                  {/* Validation checklist */}
                  <div className="flex flex-col gap-2 mt-1">
                    {[
                      "Toutes les pages générées",
                      "Couverture personnalisée",
                      "Qualité impression 300 DPI",
                      "Format PDF standard",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-[11px] font-bold text-[#374151]">
                        <div className="w-4.5 h-4.5 rounded-full bg-[#20C997]/15 text-[#20C997] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Multi-copy Request Card */}
                <Card className="rounded-[24px] border border-[#1194FF]/20 p-5 bg-[#EFF6FF] shadow-sm flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1194FF]/15 flex items-center justify-center shrink-0">
                      <Printer className="w-5 h-5 text-[#1194FF]" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-extrabold text-[#1E3A5F]">Impression en plusieurs exemplaires</h4>
                      <p className="text-[10px] font-semibold text-[#3B82F6] mt-0.5 leading-relaxed">
                        Commandez plusieurs copies imprimées et reliées pour toute la famille ou la classe.
                      </p>
                    </div>
                  </div>

                  {/* Copies counter */}
                  <div className="flex items-center justify-between bg-white rounded-[14px] border border-[#BFDBFE] p-3">
                    <span className="text-[12px] font-extrabold text-[#1E3A5F]">Nombre d&apos;exemplaires</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCopiesCount(Math.max(1, copiesCount - 1))}
                        className="w-7 h-7 rounded-full bg-[#DBEAFE] text-[#1194FF] flex items-center justify-center font-extrabold text-lg leading-none hover:bg-[#BFDBFE] transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-[15px] font-black text-[#1E3A5F] w-6 text-center">{copiesCount}</span>
                      <button
                        onClick={() => setCopiesCount(Math.min(500, copiesCount + 1))}
                        className="w-7 h-7 rounded-full bg-[#DBEAFE] text-[#1194FF] flex items-center justify-center font-extrabold text-lg leading-none hover:bg-[#BFDBFE] transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button className="w-full h-11 rounded-[14px] bg-[#1194FF] text-white hover:bg-[#0080EE] font-bold text-xs flex items-center justify-center gap-2 border-none cursor-pointer shadow-sm shadow-[#1194FF]/20">
                      <Printer className="w-4 h-4" />
                      Demander un devis · {copiesCount} ex.
                    </Button>
                  </motion.div>
                </Card>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Version impression : masquee a l'ecran, affichee uniquement a l'impression */}
      <div className="print-only" aria-hidden>
        <BookPrint book={book} />
      </div>

    </div>
    </BookProvider>
  )
}
