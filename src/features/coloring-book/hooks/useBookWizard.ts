"use client"

import { useCallback } from "react"
import type { BookFormat, BookFrame, BookOrientation, BookStep, BookStyle, CoverPalette, CoverTemplate } from "../types"
import { useBookStore } from "../store/useBookStore"
import { useBookAutosave } from "./useBookAutosave"
import { useBookPreview } from "./useBookPreview"

export function useBookWizard() {
  useBookAutosave()

  const store = useBookStore()
  const preview = useBookPreview()

  const canGoToStep = useCallback((step: BookStep) => {
    if (step === 1) return true
    return useBookStore.getState().validate()
  }, [])

  const goToStep = useCallback(
    (step: BookStep) => {
      if (canGoToStep(step)) {
        store.setCurrentStep(step)
      }
    },
    [canGoToStep, store],
  )

  const nextStep = useCallback(() => {
    const next = Math.min(4, store.currentStep + 1) as BookStep
    goToStep(next)
  }, [goToStep, store.currentStep])

  const previousStep = useCallback(() => {
    const previous = Math.max(1, store.currentStep - 1) as BookStep
    store.setCurrentStep(previous)
  }, [store])

  return {
    ...store,
    ...preview,
    activeStep: store.currentStep,
    selectedIds: store.selectedImages,
    searchTerm: store.settings.searchTerm,
    selectedCat: store.settings.selectedCategory,
    title: store.bookInfo.title,
    subtitle: store.bookInfo.subtitle,
    author: store.bookInfo.author,
    childName: store.bookInfo.childName,
    selectedCover: store.cover,
    selectedPalette: store.palette,
    drawingStyle: store.style,
    contourThickness: store.settings.contourThickness,
    bookFormat: store.format,
    orientation: store.orientation,
    decorativeFrame: store.frame,
    pageNumbers: store.options.pageNumbers,
    addTitlePage: store.options.addTitlePage,
    belongsTo: store.options.belongsTo,
    educationalText: store.options.educationalText,
    funFact: store.options.funFact,
    questions: store.options.questions,
    optimizeInk: store.printSettings.optimizeInk,
    rectoOnly: store.printSettings.rectoOnly,
    cutMarks: store.printSettings.cutMarks,
    bindingMargin: store.printSettings.bindingMargin,
    currentChild: store.settings.currentChild,
    isPreviewOpen: store.settings.isPreviewOpen,
    zoomScale: store.settings.zoomScale,
    currentBookPage: store.settings.currentBookPage,
    generationProgress: store.exportSettings.generationProgress,
    isGenerating: store.exportSettings.isGenerating,
    bleed: store.exportSettings.bleed,
    copiesCount: store.exportSettings.copiesCount,
    setActiveStep: goToStep,
    setSearchTerm: (value: string) => store.setSetting("searchTerm", value),
    setSelectedCat: (value: string) => store.setSetting("selectedCategory", value),
    setSelectedIds: store.setSelectedImages,
    setTitle: (value: string) => store.setBookInfoField("title", value),
    setSubtitle: (value: string) => store.setBookInfoField("subtitle", value),
    setAuthor: (value: string) => store.setBookInfoField("author", value),
    setChildName: (value: string) => store.setBookInfoField("childName", value),
    setSelectedCover: (value: string) => store.setCover(value as CoverTemplate),
    setSelectedPalette: (value: string) => store.setPalette(value as CoverPalette),
    setDrawingStyle: (value: string) => store.setStyle(value as BookStyle),
    setContourThickness: (value: number) => store.setSetting("contourThickness", value),
    setBookFormat: (value: string) => store.setFormat(value as BookFormat),
    setOrientation: (value: string) => store.setOrientation(value as BookOrientation),
    setDecorativeFrame: (value: string) => store.setFrame(value as BookFrame),
    setPageNumbers: (value: boolean) => store.setOption("pageNumbers", value),
    setAddTitlePage: (value: boolean) => store.setOption("addTitlePage", value),
    setBelongsTo: (value: boolean) => store.setOption("belongsTo", value),
    setEducationalText: (value: boolean) => store.setOption("educationalText", value),
    setFunFact: (value: boolean) => store.setOption("funFact", value),
    setQuestions: (value: boolean) => store.setOption("questions", value),
    setOptimizeInk: (value: boolean) => store.setPrintSetting("optimizeInk", value),
    setRectoOnly: (value: boolean) => store.setPrintSetting("rectoOnly", value),
    setCutMarks: (value: boolean) => store.setPrintSetting("cutMarks", value),
    setBindingMargin: (value: boolean) => store.setPrintSetting("bindingMargin", value),
    setCurrentChild: (value: string) => store.setSetting("currentChild", value),
    setIsPreviewOpen: (value: boolean) => store.setSetting("isPreviewOpen", value),
    setZoomScale: (value: number | ((current: number) => number)) => store.setSetting("zoomScale", value),
    setCurrentBookPage: (value: number | ((current: number) => number)) => store.setSetting("currentBookPage", value),
    setGenerationProgress: (value: number | ((current: number) => number)) =>
      store.setExportSetting("generationProgress", value),
    setIsGenerating: (value: boolean) => store.setExportSetting("isGenerating", value),
    setBleed: (value: boolean) => store.setExportSetting("bleed", value),
    setCopiesCount: (value: number) => store.setExportSetting("copiesCount", value),
    validate: store.validate,
    canGoToStep,
    beforeLeave: store.validate,
    onEnter: goToStep,
    onExit: previousStep,
    nextStep,
    previousStep,
  }
}
