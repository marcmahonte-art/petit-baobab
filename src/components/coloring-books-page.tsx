"use client"

import { useEffect, useRef, useState } from "react"
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
  TreePine
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
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

export function ColoringBooksPage() {
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
    decorativeFrame,
    setDecorativeFrame,
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
    currentChild,
    setCurrentChild,
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

  const viewerContainerRef = useRef<HTMLDivElement>(null)
  const generationTimerRef = useRef<number | null>(null)
  const [isPrintableBookOpen, setIsPrintableBookOpen] = useState(false)

  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([])

  useEffect(() => {
    drawingService.list().then((list) => {
      window.setTimeout(() => {
        setSavedDrawings(list)
        
        // Populate customDrawings list in useBookStore
        const mappedList = list.map((draw) => ({
          id: draw.id,
          name: draw.name,
          image: draw.image,
          category: draw.category,
          isPersonal: true,
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
      image: draw.image,
      category: draw.category,
      isPersonal: true,
    })),
  ]

  // Switch to Child values when child changes
  useEffect(() => {
    if (currentChild === "awa") {
      setChildName("Awa")
      setAuthor("Maman & Awa")
      setTitle("Animaux de Awa")
    } else if (currentChild === "kofi") {
      setChildName("Kofi")
      setAuthor("Papa & Kofi")
      setTitle("Aventures de Kofi")
    }
  // The setters are store actions; this effect intentionally tracks the selected child only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChild])

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


  const handleDownloadPdf = () => {
    setIsPrintableBookOpen(true)
    setCurrentBookPage(0)

    try {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595.28 841.89] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length 320 >>
stream
BT
/F1 24 Tf
50 750 Td
(LIVRE DE COLORIAGE - PETIT BAOBAB) Tj
/F1 16 Tf
0 -50 Td
(Titre : ${title || "Sans titre"}) Tj
0 -25 Td
(Auteur : ${author || "Anonyme"}) Tj
0 -25 Td
(Enfant : ${childName || "Awa"}) Tj
0 -25 Td
(Format : ${bookFormat} - ${orientation}) Tj
0 -25 Td
(Nombre de pages : ${totalPagesCount} pages (${selectedIds.length} dessins)) Tj
0 -50 Td
(Votre livre a ete genere avec succes !) Tj
0 -20 Td
(Pour l'imprimer en haute qualite avec tous les dessins,) Tj
0 -20 Td
(utilisez le bouton d'impression de l'apercu qui vient de s'ouvrir.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000320 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
590
%%EOF`

      const blob = new Blob([pdfContent], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const safeTitle = (title || "livre-coloriage").toLowerCase().replace(/[^a-z0-9]+/g, "-")
      link.download = `${safeTitle}-petit-baobab.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to download PDF", err)
    }
  }

  const handlePrintPdf = () => {
    window.print()
  }
  // Save configurations simulation
  const handleSaveConfigs = () => {
    import("canvas-confetti").then((module) => {
      const confetti = module.default
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ["#7D6AF8", "#20C997", "#FFD95C"]
      })
    })
  }

  // Reset to fitting scale
  const handleFitWidth = () => {
    setZoomScale(1.0)
  }

  return (
    <div className="w-full flex flex-col gap-6 select-none font-sans text-[#1F2937] bg-[#FFFDF7] p-2 sm:p-4 rounded-[32px] min-h-screen">
      
      <BookHeader currentChild={currentChild} setCurrentChild={setCurrentChild} />

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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-4 h-[46px] rounded-2xl border border-[#E5E7EB] bg-[#FAFAFC] text-sm font-semibold text-[#1F2937] placeholder-[#64748B]/60 focus-visible:ring-1 focus-visible:ring-[#6D4CFF]"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCat(cat.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-4 h-9 rounded-full font-extrabold text-[13px] border transition-all shrink-0 cursor-pointer",
                            selectedCat === cat.id
                              ? "bg-[#6D4CFF] border-[#6D4CFF] text-white shadow-sm scale-102"
                              : "bg-white border-[#E5E7EB] text-[#64748B] hover:bg-neutral-50"
                          )}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drawings Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {filteredDrawings.map((draw) => {
                        const isSelected = selectedIds.includes(draw.id)
                        return (
                          <motion.div
                            key={draw.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
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
                  </div>
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

                    <div className="w-[80px] h-[100px] rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#6D4CFF]/50 flex flex-col items-center justify-center gap-1 bg-[#FAFAFC]/40 cursor-pointer shrink-0 transition-colors">
                      <Plus className="w-5 h-5 text-[#64748B]" />
                      <span className="text-[10px] font-bold text-[#64748B]">Ajouter plus</span>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-4">
                    <Button 
                      onClick={() => setActiveStep(2)}
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
                      decorativeFrame={decorativeFrame}
                      orientation={orientation}
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full">
                    <Button 
                      onClick={() => setActiveStep(2)}
                      variant="outline" 
                      className="w-full h-11 rounded-[16px] border border-[#6D4CFF]/20 text-[#6D4CFF] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#6D4CFF]/5 bg-transparent cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Personnaliser la couverture</span>
                    </Button>
                  </motion.div>
                </Card>

                {/* Quick book options for Step 1 */}
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-sm flex flex-col gap-4">
                  <h3 className="text-[16px] font-extrabold text-[#1F2937]">
                    Options rapides
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Format</label>
                      <select
                        value={bookFormat}
                        onChange={(e) => setBookFormat(e.target.value)}
                        className="w-full h-11 px-3 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFC] text-xs font-bold text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] cursor-pointer"
                      >
                        <option value="A4">A4 (21 x 29.7 cm)</option>
                        <option value="A5">A5 (14.8 x 21 cm)</option>
                        <option value="Letter">US Letter (21.6 x 27.9 cm)</option>
                        <option value="Carré">Carré (21 x 21 cm)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Orientation</label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value)}
                        className="w-full h-11 px-3 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFC] text-xs font-bold text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] cursor-pointer"
                      >
                        <option value="Portrait">Portrait</option>
                        <option value="Paysage">Paysage</option>
                        <option value="Carré">Carré</option>
                      </select>
                    </div>
                  </div>
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
                          onClick={() => setActiveStep(2)}
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
              {/* ================= STEP 2: COLONNE GAUCHE (FORMULAIRE) ================= */}
              <div className="flex flex-col gap-8">
                
                {/* Mobile Preview Accordion (Collapsible) */}
                <div className="lg:hidden w-full">
                  <Card className="rounded-[24px] border border-[#E5E7EB] bg-white shadow-md overflow-hidden">
                    <button
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="w-full flex items-center justify-between p-5 bg-neutral-50/50 hover:bg-neutral-50 transition-colors font-extrabold text-sm text-[#1F2937] focus:outline-none"
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-[#7D6AF8]" />
                        <span><Search className="w-3.5 h-3.5 inline-block mr-1" /> Voir l&apos;aperçu en direct ({selectedIds.length} dessins)</span>
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
                            decorativeFrame={decorativeFrame}
                            orientation={orientation}
                          />

                          <div className="grid grid-cols-2 gap-3 text-xs font-semibold bg-white p-4 rounded-xl border border-neutral-100">
                            <div><BookOpen className="w-3.5 h-3.5 inline-block mr-1" /> Pages: <span className="font-extrabold text-[#7D6AF8]">{totalPagesCount} pages</span></div>
                            <div><Package className="w-3.5 h-3.5 inline-block mr-1" /> Poids: <span className="font-extrabold text-[#20C997]">{calculatedPdfWeight} MB</span></div>
                            <div>📐 Format: <span className="font-extrabold text-[#FFB300]">{bookFormat}</span></div>
                            <div>🧭 Orientation: <span className="font-extrabold text-[#1194FF]">{orientation}</span></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </div>

                {/* SECTION 1: Informations */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">1</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Informations du livre</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                        Titre du livre <span className="text-red-500">*</span>
                      </label>
                      <Input
                        maxLength={50}
                        placeholder="Ex : Les animaux de la savane"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-[52px] rounded-[16px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#7D6AF8]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Sous-titre</label>
                      <Input
                        maxLength={50}
                        placeholder="Ex : Mon super livre de coloriage"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="h-[52px] rounded-[16px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#7D6AF8]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Auteur</label>
                      <Input
                        placeholder="Ex : Maman & Awa"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="h-[52px] rounded-[16px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#7D6AF8]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">Nom de l&apos;enfant</label>
                      <Input
                        placeholder="Ex : Awa"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="h-[52px] rounded-[16px] border border-[#EFE7DB] bg-[#FAFAFC] px-4 font-bold text-sm text-[#1F2937] placeholder-[#64748B]/40 focus-visible:ring-1 focus-visible:ring-[#7D6AF8]"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* SECTION 2: Choisir une couverture */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">2</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Choisir une couverture</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: "petit-baobab", name: "Petit Baobab", color: "from-[#FFE5B4] to-[#FFF9E5]" },
                      { id: "savane", name: "Savane", color: "from-[#FFEAA7] to-[#FFF5CC]" },
                      { id: "ecole", name: "🏫 École", color: "from-[#D2EAFF] to-[#E6F4FF]" },
                      { id: "afrique", name: "Afrique", color: "from-[#FCDDEC] to-[#FFF0F7]" },
                      { id: "coloree", name: "Colorée", color: "from-[#D5F5E3] to-[#E8F8F5]" },
                      { id: "ia", name: "Générée par IA", color: "from-[#E8DAEF] to-[#F4ECF7]" },
                    ].map((cov) => {
                      const isSelected = selectedCover === cov.id
                      return (
                        <motion.button
                          key={cov.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCover(cov.id)}
                          className={cn(
                            "h-[120px] rounded-[18px] border p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 bg-white relative overflow-hidden",
                            isSelected 
                              ? "border-[2px] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/15" 
                              : "border-[#E5E7EB] hover:border-[#7D6AF8]/40"
                          )}
                        >
                          <div className={cn("w-full h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl", cov.color)}>
                            {cov.name.split(" ")[0]}
                          </div>
                          <span className="text-xs font-black text-[#1F2937] leading-none mt-2">
                            {cov.name.split(" ").slice(1).join(" ")}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* SECTION 3: Palette */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">3</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Palette de couleurs</h3>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    {[
                      { name: "Purple", color: "bg-[#7D6AF8]" },
                      { name: "Green", color: "bg-[#20C997]" },
                      { name: "Yellow", color: "bg-[#FFD95C]" },
                      { name: "Orange", color: "bg-[#FFB300]" },
                      { name: "Blue", color: "bg-[#1194FF]" },
                      { name: "Pink", color: "bg-[#FF5E83]" },
                      { name: "Turquoise", color: "bg-[#13C6A2]" },
                      { name: "Multicolore", color: "bg-gradient-to-br from-[#FF5E83] via-[#FFD95C] via-[#20C997] to-[#7D6AF8]" },
                    ].map((pal) => {
                      const isSelected = selectedPalette === pal.name
                      return (
                        <motion.button
                          key={pal.name}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setSelectedPalette(pal.name)}
                          className={cn(
                            "w-10 h-10 rounded-full cursor-pointer relative transition-all duration-150 shadow-sm border border-neutral-200/50",
                            pal.color,
                            isSelected ? "ring-4 ring-[#7D6AF8] ring-offset-2 scale-105" : "hover:ring-2 hover:ring-[#7D6AF8]/50"
                          )}
                          title={pal.name}
                        >
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black drop-shadow">
                              ✓
                            </span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* SECTION 4: Style du dessin */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">4</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Style du dessin</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { name: "Contour simple", desc: "Trait propre", emoji: "✎" },
                      { name: "Noir & Blanc détaillé", desc: "Ombrages", emoji: "◐" },
                      { name: "Contours épais", desc: "Pour les petits", emoji: "▬" },
                      { name: "Version couleur", desc: "Livre coloré", emoji: "◉" },
                    ].map((style) => {
                      const isSelected = drawingStyle === style.name
                      return (
                        <motion.button
                          key={style.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDrawingStyle(style.name)}
                          className={cn(
                            "aspect-square rounded-[18px] border p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 bg-white",
                            isSelected
                              ? "border-[2px] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/15"
                              : "border-[#E5E7EB] hover:border-[#7D6AF8]/40"
                          )}
                        >
                          <span className="text-2xl mt-1">{style.emoji}</span>
                          <div className="flex flex-col gap-0.5 leading-none">
                            <span className="text-[11px] font-black text-[#1F2937]">{style.name}</span>
                            <span className="text-[9px] font-semibold text-[#64748B]">{style.desc}</span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* SECTION 5: Épaisseur des contours */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">5</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Épaisseur des contours</h3>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center text-xs font-black text-[#64748B]">
                      <span>Fin</span>
                      <span className="text-sm font-extrabold text-[#7D6AF8] bg-[#7D6AF8]/10 px-2.5 py-1 rounded-full">
                        Valeur : {contourThickness}%
                      </span>
                      <span>Épais</span>
                    </div>

                    <Slider
                      value={[contourThickness]}
                      onValueChange={(val) => setContourThickness(val[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer py-2"
                    />
                  </div>
                </motion.div>

                {/* SECTION 6: Format */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">6</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Format du livre</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: "A4", name: "A4", dim: "21.0 x 29.7 cm", size: "Grand standard" },
                      { id: "A5", name: "A5", dim: "14.8 x 21.0 cm", size: "Compact" },
                      { id: "Letter", name: "US Letter", dim: "21.6 x 27.9 cm", size: "Format US" },
                      { id: "Carré", name: "Carré", dim: "21.0 x 21.0 cm", size: "Créatif" },
                    ].map((f) => {
                      const isSelected = bookFormat === f.id
                      return (
                        <motion.button
                          key={f.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setBookFormat(f.id)}
                          className={cn(
                            "p-4 rounded-[18px] border text-center flex flex-col justify-between items-center cursor-pointer transition-all duration-200 bg-white",
                            isSelected
                              ? "border-[2px] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/15"
                              : "border-[#E5E7EB] hover:border-[#7D6AF8]/40"
                          )}
                        >
                          <span className="text-[14px] font-black text-[#1F2937]">{f.name}</span>
                          <div className="flex flex-col gap-0.5 leading-none mt-2">
                            <span className="text-[10px] font-extrabold text-[#7A6A5E]">{f.dim}</span>
                            <span className="text-[8px] font-bold text-[#64748B] mt-0.5">{f.size}</span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* SECTION 7: Orientation */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">7</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Orientation</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "Portrait", name: "Portrait", desc: "Vertical" },
                      { id: "Paysage", name: "Paysage", desc: "Horizontal" },
                      { id: "Carré", name: "Carré", desc: "1:1 Symétrique" },
                    ].map((o) => {
                      const isSelected = orientation === o.id
                      return (
                        <motion.button
                          key={o.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setOrientation(o.id)}
                          className={cn(
                            "p-4 rounded-[18px] border text-center flex flex-col justify-between items-center cursor-pointer transition-all duration-200 bg-white",
                            isSelected
                              ? "border-[2px] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/15"
                              : "border-[#E5E7EB] hover:border-[#7D6AF8]/40"
                          )}
                        >
                          <span className="text-xs font-black text-[#1F2937]">{o.name}</span>
                          <span className="text-[9px] font-bold text-[#64748B] mt-1">{o.desc}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* SECTION 8: Cadre décoratif */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">8</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Cadre décoratif</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: "Faso Dan Fani", name: "🇧🇫 Faso Dan Fani", desc: "Bordure tissée" },
                      { id: "Bogolan", name: "🇲🇱 Bogolan", desc: "Motifs en terre" },
                      { id: "Nature", name: "🌿 Nature", desc: "Feuilles et lianes" },
                      { id: "Savane", name: "Savane", desc: "Silhouettes sauvages" },
                      { id: "Animaux", name: "🐾 Animaux", desc: "Empreintes de pattes" },
                      { id: "Aucun", name: "⬜ Aucun", desc: "Sans cadre" },
                    ].map((frame) => {
                      const isSelected = decorativeFrame === frame.id
                      return (
                        <motion.button
                          key={frame.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDecorativeFrame(frame.id)}
                          className={cn(
                            "h-[90px] rounded-[18px] border p-3 flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-200 bg-white",
                            isSelected
                              ? "border-[2px] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/15"
                              : "border-[#E5E7EB] hover:border-[#7D6AF8]/40"
                          )}
                        >
                          <span className="text-xs font-black text-[#1F2937] leading-tight">{frame.name}</span>
                          <span className="text-[9px] font-bold text-[#64748B] mt-1">{frame.desc}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>

                {/* SECTION 9: Options */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">9</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Options additionnelles</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { state: pageNumbers, setter: setPageNumbers, title: "Numéroter les pages", desc: "Affiche le numéro en bas" },
                      { state: addTitlePage, setter: setAddTitlePage, title: "Ajouter une page de garde", desc: "Page de couverture personnalisée" },
                      { state: belongsTo, setter: setBelongsTo, title: 'Ajouter "Ce livre appartient à"', desc: "Page d'identification enfant" },
                      { state: educationalText, setter: setEducationalText, title: "Ajouter un texte éducatif", desc: "Petites phrases pour apprendre" },
                      { state: funFact, setter: setFunFact, title: "Ajouter un fait amusant", desc: "Anecdotes rigolotes sur le dessin" },
                      { state: questions, setter: setQuestions, title: "Ajouter des questions", desc: "Mini-jeux et questions de fin" },
                    ].map((opt, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-50 bg-[#FAFAFC]/65 shadow-sm">
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-black text-[#1F2937]">{opt.title}</span>
                          <span className="text-[9px] font-semibold text-[#64748B] mt-0.5">{opt.desc}</span>
                        </div>
                        <button
                          onClick={() => opt.setter(!opt.state)}
                          className={cn(
                            "w-[44px] h-[24px] rounded-full transition-colors relative shrink-0 focus:outline-none border border-[#E5E7EB] cursor-pointer",
                            opt.state ? "bg-[#22C55E]" : "bg-neutral-200"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all shadow-sm",
                              opt.state ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* SECTION 10: Impression */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="bg-white rounded-[24px] border border-[#E5E7EB]/80 p-6 sm:p-8 shadow-xl/5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <span className="w-8 h-8 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center font-black text-sm">10</span>
                    <h3 className="text-lg font-extrabold text-[#1F2937]">Options d&apos;impression</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { state: optimizeInk, setter: setOptimizeInk, title: "Optimiser l'encre", desc: "Lignes plus fines pour économiser" },
                      { state: rectoOnly, setter: setRectoOnly, title: "Recto uniquement", desc: "Page blanche au verso pour feutres" },
                      { state: cutMarks, setter: setCutMarks, title: "Repères de coupe", desc: "Lignes d'aide pour couper le papier" },
                      { state: bindingMargin, setter: setBindingMargin, title: "Marge de reliure", desc: "Espace décalé à gauche pour agrafer" },
                    ].map((opt, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-50 bg-[#FAFAFC]/65 shadow-sm">
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-black text-[#1F2937]">{opt.title}</span>
                          <span className="text-[9px] font-semibold text-[#64748B] mt-0.5">{opt.desc}</span>
                        </div>
                        <button
                          onClick={() => opt.setter(!opt.state)}
                          className={cn(
                            "w-[44px] h-[24px] rounded-full transition-colors relative shrink-0 focus:outline-none border border-[#E5E7EB] cursor-pointer",
                            opt.state ? "bg-[#22C55E]" : "bg-neutral-200"
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all shadow-sm",
                              opt.state ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* ACTION BUTTONS (BOTTOM) */}
                <div className="flex items-center justify-between gap-4 py-4 mt-2">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handlePrevStep}
                      className="h-12 px-6 rounded-2xl border border-neutral-200 bg-white text-[#64748B] hover:bg-neutral-50 font-extrabold text-sm cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour</span>
                    </Button>
                  </motion.div>

                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleSaveConfigs}
                        className="h-12 px-5 rounded-2xl border border-[#7D6AF8]/20 bg-[#7D6AF8]/5 text-[#7D6AF8] hover:bg-[#7D6AF8]/10 font-extrabold text-sm cursor-pointer"
                      >
                        Enregistrer
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleNextStep}
                        className="h-12 px-6 rounded-2xl bg-[#7D6AF8] text-white hover:bg-[#7D6AF8]/90 font-extrabold text-sm cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <span>Continuer vers Aperçu</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

              </div>

              {/* ================= STEP 2: COLONNE DROITE (APERÇU STICKY) ================= */}
              <div className="hidden lg:block sticky top-8 flex flex-col gap-6 w-[360px] xl:w-[380px] shrink-0">
                <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-6 bg-white shadow-md flex flex-col items-center gap-5">
                  <h3 className="text-sm font-extrabold text-[#64748B] uppercase tracking-wider self-start flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#7D6AF8]" /> Aperçu en temps réel
                  </h3>

                  <div className="w-full flex justify-center items-center py-2 bg-neutral-50/20 rounded-2xl border border-dashed border-neutral-100/85">
                    <BookPreviewCanvas
                      selectedCover={selectedCover}
                      selectedPalette={selectedPalette}
                      title={title}
                      subtitle={subtitle}
                      childName={childName}
                      author={author}
                      decorativeFrame={decorativeFrame}
                      orientation={orientation}
                    />
                  </div>

                  {/* Summary below */}
                  <div className="w-full h-[1px] bg-neutral-100 my-1" />

                  <div className="w-full flex flex-col gap-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#64748B]">Nombre de dessins</span>
                      <span className="font-black text-[#1F2937]">{selectedIds.length} dessins</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#64748B]">Pages totales</span>
                      <span className="font-black text-[#1F2937]">{totalPagesCount} pages</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#64748B]">Format / Orientation</span>
                      <span className="font-black text-[#1F2937] capitalize">{bookFormat} ({orientation})</span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-[#FAFAFC] p-2.5 rounded-xl border border-neutral-100">
                      <span className="font-semibold text-[#64748B]">Poids PDF estimé</span>
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

                      <span className="text-xs font-extrabold text-[#7D6AF8] bg-[#7D6AF8]/5 px-2.5 py-1 rounded-full w-[54px] text-center">
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
                        className="h-8 rounded-lg px-2.5 text-[11px] font-bold border border-[#7D6AF8]/20 text-[#7D6AF8] hover:bg-[#7D6AF8]/5 bg-transparent cursor-pointer"
                      >
                        Fit Width
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
                              decorativeFrame={decorativeFrame}
                              orientation={orientation}
                              scale={zoomScale}
                            />
                          </div>
                        ) : bookPages[currentBookPage]?.type === "belongs_to" ? (
                          <div className="w-full h-full flex flex-col justify-between items-center border-[8px] border-dashed border-[#7D6AF8]/30 p-8 font-nunito bg-[#FFFDF7]/50 rounded-lg">
                            <div className="w-full flex justify-between items-center text-[10px] font-black text-[#7D6AF8]/40">
                              <span>PETIT BAOBAB</span>
                              <span>PAGE DE GARDE</span>
                            </div>

                            <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
                              <Gift className="w-12 h-12 text-[#7D6AF8]" />
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
                            {/* Selected decorative frame inside book pages */}
                            {decorativeFrame !== "Aucun" && (
                              <div className={cn(
                                "absolute inset-0 pointer-events-none border-[8px]",
                                decorativeFrame === "Faso Dan Fani" && "border-red-100",
                                decorativeFrame === "Nature" && "border-green-50",
                                decorativeFrame === "Bogolan" && "border-neutral-200",
                                decorativeFrame === "Savane" && "border-[#FFB300]/10",
                                decorativeFrame === "Animaux" && "border-[#7D6AF8]/10"
                              )} />
                            )}

                            {/* Top header details */}
                            <div className="w-full flex justify-between items-center text-[10px] font-black text-[#7D6AF8]/40 z-10">
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
                                  <span className="text-3xl">🏁</span>
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
                                      {bookPages[currentBookPage].label === "Éléphant" ? "L'éléphant communique par infrasons inaudibles pour les humains !" :
                                       bookPages[currentBookPage].label === "Lion" ? "Le rugissement du lion peut s'entendre jusqu'à 8 kilomètres de distance !" :
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

                  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin w-full items-stretch">
                    {bookPages.map((page, idx) => {
                      const isSelected = currentBookPage === idx
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setCurrentBookPage(idx)}
                          className={cn(
                            "w-[120px] h-[160px] rounded-xl border p-2 flex flex-col justify-between shrink-0 bg-white shadow-sm relative transition-all text-left",
                            isSelected
                              ? "border-[3px] border-[#7D6AF8] ring-2 ring-[#7D6AF8]/10"
                              : "border-neutral-200/80 hover:border-neutral-300"
                          )}
                        >
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-neutral-900/5 text-neutral-600 rounded-full flex items-center justify-center text-[8px] font-black">
                            {idx + 1}
                          </div>

                          {/* Mini visual representing page */}
                          <div className="flex-1 w-full bg-[#FAFAFC] rounded-lg overflow-hidden flex items-center justify-center relative p-1 mt-1 border border-neutral-100">
                            {page.type === "cover" ? (
                              <TreePine className="w-5 h-5 text-[#22C55E]" />
                            ) : page.type === "belongs_to" ? (
                              <Gift className="w-5 h-5 text-[#7D6AF8]" />
                            ) : (
                              <div className="relative w-full h-full">
                                <Image
                                  src={page.image || "/illustrations/animals/elephant.svg"}
                                  alt="miniature"
                                  fill
                                  className="object-contain grayscale"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col leading-none pt-1 px-0.5">
                            <span className="text-[10px] font-black text-[#1F2937] truncate w-full">
                              {page.label}
                            </span>
                            <span className="text-[8px] font-bold text-[#64748B] mt-0.5 truncate w-full capitalize">
                              {page.details}
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
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
                      className="h-12 px-8 rounded-2xl bg-[#7D6AF8] text-white hover:bg-[#7D6AF8]/90 font-extrabold text-sm cursor-pointer shadow-md flex items-center gap-2"
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
                    <Info className="w-4 h-4 text-[#7D6AF8]" /> Informations
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
                      <span className="font-extrabold text-[#7D6AF8]">{totalPagesCount} pages</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-neutral-50">
                      <span className="text-[#64748B]">Style graphique</span>
                      <span className="font-extrabold">{drawingStyle}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-neutral-50">
                      <span className="text-[#64748B]">Bordure / Cadre</span>
                      <span className="font-extrabold">{decorativeFrame}</span>
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
                      "Toutes les pages sont générées",
                      "Couverture créée",
                      "Numérotation",
                      "Cadres décoratifs",
                      "Qualité impression 300 DPI"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-bold text-[#1F2937]">
                        <div className="w-5 h-5 rounded-full bg-[#20C997]/10 text-[#20C997] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>{item}</span>
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
                    <span>📥</span> Télécharger votre livre
                  </h2>
                  <p className="text-[15px] font-semibold text-[#64748B]">
                    Votre livre est prêt ! Téléchargez-le ou demandez une impression professionnelle.
                  </p>
                </div>

                {/* Generation Progress (only shown while generating) */}
                {generationProgress < 100 && (
                  <Card className="rounded-[24px] border border-[#E5E7EB]/80 p-8 bg-white shadow-sm flex flex-col items-center gap-5">
                    <Zap className="w-12 h-12 text-[#FFB300] animate-bounce" />
                    <h3 className="text-xl font-extrabold text-[#1F2937]">Génération du PDF en cours…</h3>
                    <p className="text-xs text-[#64748B] text-center max-w-sm">
                      Nous assemblons {selectedIds.length} coloriages avec la couverture &ldquo;{title}&rdquo; et vos options personnalisées.
                    </p>
                    <div className="w-full h-3.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/50">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#7D6AF8]">{generationProgress}%</span>
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
                        <div className="absolute w-52 h-52 rounded-full bg-[#7D6AF8]/8 -top-10 -right-10" />
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
                            <ellipse cx="90" cy="208" rx="64" ry="10" fill="#7D6AF8" opacity="0.12" />
                            {/* Back cover */}
                            <rect x="32" y="22" width="118" height="162" rx="10" fill="#E8E3FF" stroke="#C4B8FF" strokeWidth="1.5" />
                            {/* Book spine */}
                            <rect x="32" y="22" width="18" height="162" rx="6" fill="#7D6AF8" opacity="0.7" />
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
                            <circle cx="88" cy="136" r="9" fill="#7D6AF8" opacity="0.8" />
                            <circle cx="106" cy="136" r="9" fill="#7D6AF8" opacity="0.8" />
                            <circle cx="97" cy="130" r="11" fill="#7D6AF8" />
                            {/* Petit Baobab branding */}
                            <text x="97" y="175" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#7A6A5E" opacity="0.6" fontFamily="sans-serif">PETIT BAOBAB</text>
                            <defs>
                              <linearGradient id="bookCoverGrad" x1="38" y1="16" x2="156" y2="64" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#7D6AF8" />
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
                          { label: "Pages", value: `${totalPagesCount} pages`, icon: "📄", color: "#7D6AF8" },
                          { label: "Format", value: bookFormat, icon: "📐", color: "#1194FF" },
                          { label: "Qualité", value: "300 DPI", icon: "★", color: "#20C997" },
                          { label: "Taille", value: `${calculatedPdfWeight} Mo`, icon: "💾", color: "#FFB300" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-[#FAFAFC] border border-[#E5E7EB]/80"
                          >
                            <span className="text-xl">{item.icon}</span>
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
                          { label: "Inclure le fond perdu (bleed)", state: bleed, setter: setBleed },
                        ].map((opt) => (
                          <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                            <button
                              role="checkbox"
                              aria-checked={opt.state}
                              onClick={() => opt.setter(!opt.state)}
                              className={cn(
                                "w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer",
                                opt.state
                                  ? "bg-[#7D6AF8] border-[#7D6AF8]"
                                  : "bg-white border-[#D1D5DB] group-hover:border-[#7D6AF8]/50"
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
                          <Button
                            onClick={handleDownloadPdf}
                            className="w-full h-[64px] rounded-[18px] bg-[#7D6AF8] text-white hover:bg-[#6D5DE8] font-black text-[16px] flex items-center justify-center gap-3 shadow-lg shadow-[#7D6AF8]/25 border-none cursor-pointer"
                          >
                            <Download className="w-6 h-6" />
                            <span>⬇ Télécharger le PDF</span>
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}>
                          <Button
                            variant="outline"
                            className="w-full h-[64px] rounded-[18px] border-2 border-[#7D6AF8]/20 bg-white text-[#7D6AF8] hover:bg-[#7D6AF8]/5 font-black text-[16px] flex items-center justify-center gap-3 cursor-pointer"
                          >
                            <Printer className="w-6 h-6" />
                            <span>🖨 Demander une impression</span>
                          </Button>
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
                    <BookOpen className="w-5 h-5 text-[#7D6AF8]" /> Résumé de la commande
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
                      <span className="font-extrabold text-[#7D6AF8]">{selectedIds.length} illustrations</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-50">
                      <span className="text-[#64748B]">Pages totales</span>
                      <span className="font-extrabold text-[#7D6AF8]">{totalPagesCount} pages</span>
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
                      <span className="font-black text-[#7D6AF8]">{calculatedPdfWeight} Mo</span>
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

                {/* Premium Upsell Card */}
                <Card className="rounded-[24px] border border-[#7D6AF8]/25 p-5 bg-gradient-to-br from-[#F5F0FF] to-[#EFF6FF] shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  {/* decorative glow */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#7D6AF8]/10 pointer-events-none" />

                  <div className="flex items-center gap-2 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-[#7D6AF8] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                      <span className="text-[12px] font-black text-[#4C3BAF] uppercase tracking-wider">Premium</span>
                      <p className="text-[10px] font-semibold text-[#6D5DE8] leading-none">Accès illimité</p>
                    </div>
                    <span className="ml-auto text-[10px] font-black bg-[#7D6AF8] text-white px-2.5 py-1 rounded-full shadow-sm">
                      <Flame className="w-3.5 h-3.5 inline-block" /> Populaire
                    </span>
                  </div>

                  <ul className="flex flex-col gap-1.5 relative z-10">
                    {[
                      "Livres illimités sans filigrane",
                      "Toutes les palettes et cadres",
                      "Impression haute qualité incluse",
                      "Bibliothèque de 500+ dessins",
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] font-semibold text-[#374151]">
                        <Star className="w-3.5 h-3.5 fill-[#7D6AF8] text-[#7D6AF8] shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="relative z-10">
                    <Button className="w-full h-10 rounded-[14px] bg-[#7D6AF8] text-white hover:bg-[#6D5DE8] font-bold text-xs flex items-center justify-center gap-2 border-none cursor-pointer shadow-md shadow-[#7D6AF8]/25">
                      <Sparkles className="w-3.5 h-3.5" />
                      Découvrir Premium — 4,99 €/mois
                    </Button>
                  </motion.div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isPrintableBookOpen && (
          <motion.div
            key="printable-book-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#111827]/70 p-3 sm:p-6 overflow-y-auto"
          >
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #printable-book, #printable-book * { visibility: visible !important; }
                #printable-book {
                  position: absolute !important;
                  inset: 0 auto auto 0 !important;
                  width: 100% !important;
                  background: white !important;
                  padding: 0 !important;
                }
                .no-print { display: none !important; }
                .print-page {
                  width: 210mm !important;
                  min-height: 297mm !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: 0 !important;
                  page-break-after: always;
                }
              }
            `}</style>

            <div className="mx-auto max-w-6xl bg-[#F8FAFC] rounded-[24px] shadow-2xl overflow-hidden">
              <div className="sticky top-0 z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] bg-white/95 p-4 backdrop-blur no-print">
                <div>
                  <h3 className="text-[18px] font-black text-[#1F2937]">Votre livre personnalise</h3>
                  <p className="text-[12px] font-bold text-[#64748B] mt-0.5">
                    {totalPagesCount} pages - {selectedIds.length} coloriages - {bookFormat} {orientation}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePrintPdf}
                    className="h-10 rounded-xl bg-[#7D6AF8] px-4 text-white hover:bg-[#6D5DE8] font-extrabold text-xs flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer / PDF
                  </Button>
                  <Button
                    onClick={() => setIsPrintableBookOpen(false)}
                    variant="outline"
                    className="h-10 w-10 rounded-xl border border-[#E5E7EB] bg-white p-0"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div id="printable-book" className="flex flex-col items-center gap-6 p-4 sm:p-8 bg-[#EEF2F7]">
                {bookPages.map((page, index) => {
                  if (page.type === "cover") {
                    return (
                      <section
                        key={`${page.type}-${index}`}
                        className="print-page w-full max-w-[794px] min-h-[1123px] bg-white shadow-lg border border-[#E5E7EB] p-8 sm:p-14 flex flex-col items-center justify-center gap-8 text-center"
                      >
                        <BookPreviewCanvas
                          selectedCover={selectedCover}
                          selectedPalette={selectedPalette}
                          title={title}
                          subtitle={subtitle}
                          childName={childName}
                          author={author}
                          decorativeFrame={decorativeFrame}
                          orientation={orientation}
                          scale={1.2}
                        />
                      </section>
                    )
                  }

                  if (page.type === "belongs_to") {
                    return (
                      <section
                        key={`${page.type}-${index}`}
                        className="print-page w-full max-w-[794px] min-h-[1123px] bg-white shadow-lg border border-[#E5E7EB] p-8 sm:p-14 flex flex-col items-center justify-center gap-8 text-center"
                      >
                        <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#7D6AF8]">Petit Baobab</p>
                        <div className="rounded-[24px] border-[6px] border-dashed border-[#7D6AF8]/25 px-8 py-10">
                          <p className="text-[16px] font-black uppercase tracking-[0.16em] text-[#64748B]">Ce livre appartient a</p>
                          <h2 className="mt-4 text-[42px] font-black text-[#3B2416]">{childName || "Awa"}</h2>
                        </div>
                        <p className="text-[16px] font-bold text-[#64748B]">Prepare tes crayons et amuse-toi bien.</p>
                      </section>
                    )
                  }

                  return (
                    <section
                      key={`${page.type}-${index}`}
                      className="print-page w-full max-w-[794px] min-h-[1123px] bg-white shadow-lg border border-[#E5E7EB] p-8 sm:p-14 flex flex-col"
                    >
                      <div className="flex items-center justify-between text-[12px] font-black uppercase tracking-[0.14em] text-[#7D6AF8]/60">
                        <span>{title || "Petit Baobab"}</span>
                        {pageNumbers && <span>Page {index + 1}</span>}
                      </div>

                      <div className="relative flex-1 my-8 flex items-center justify-center">
                        <div className="relative w-full h-[820px] max-h-full">
                          <Image
                            src={page.image || "/illustrations/animals/elephant.svg"}
                            alt={page.label}
                            fill
                            unoptimized={page.isPersonal}
                            className={cn(
                              "object-contain",
                              page.isPersonal || drawingStyle === "Version couleur" ? "" : "grayscale contrast-125 brightness-105"
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[14px] font-extrabold text-[#64748B]">
                        <span>{page.label}</span>
                        <span>Petit Baobab</span>
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
