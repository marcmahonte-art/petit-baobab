"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  Minimize2,
  Share2,
  RotateCcw,
  RotateCw,
  X,
  BookOpen,
} from "lucide-react"
import type { Story } from "@/lib/stories/types"
import { generateStoryPdf } from "@/lib/stories/pdf-generator"

interface OpenBookViewProps {
  story: Story
  onClose?: () => void
  authorName?: string
  compact?: boolean
}

export function OpenBookView({
  story,
  onClose,
  authorName = "MARC MAHONTE",
  compact = false,
}: OpenBookViewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const bookContainerRef = useRef<HTMLDivElement>(null)

  const pages = story.pages || []
  const currentPage = pages[currentPageIndex] || {
    pageNumber: 1,
    text: story.description,
    illustrationUrl: story.coverUrl,
  }

  // Audio speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
    }
  }, [currentPageIndex])

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(currentPage.text)
      utterance.lang = "fr-FR"
      utterance.rate = 0.92
      utterance.pitch = 1.02
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
      setIsPlayingAudio(true)
    }
  }

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      bookContainerRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true)
    try {
      const doc = await generateStoryPdf(story)
      doc.save(`${story.title.replace(/\s+/g, "_")}_PetitBaobab.pdf`)
    } catch {
      window.open(`/api/stories/${story.id}/pdf`, "_blank")
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div
      ref={bookContainerRef}
      className={`flex flex-col w-full h-full select-none ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#F2EDE4] p-6 justify-between" : ""
      }`}
    >
      {/* ------------------------------------------------------------ */}
      {/* Top Controls Bar (Exact Gemini Storybook layout)              */}
      {/* ------------------------------------------------------------ */}
      <div className="flex items-center justify-between gap-3 px-2 sm:px-4 py-3 border-b border-[#E8DFC8]/60 bg-transparent text-[#3B2416]">
        {/* Left: Title + undo/redo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="font-bold text-sm sm:text-base text-[#2A180E] truncate max-w-[180px] sm:max-w-[280px]">
            {story.title}
          </h2>
          <div className="hidden sm:flex items-center gap-1 text-[#A8988B]">
            <button
              type="button"
              className="p-1 hover:text-[#3B2416] transition-colors cursor-pointer"
              title="Précédent"
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-[#3B2416] transition-colors cursor-pointer"
              title="Suivant"
              onClick={handleNext}
              disabled={currentPageIndex >= pages.length - 1}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Pagination < 1/10 > */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A4535]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPageIndex === 0}
            className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 cursor-pointer transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="tabular-nums tracking-wide">
            {currentPageIndex + 1} / {Math.max(pages.length, 1)}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPageIndex >= pages.length - 1}
            className="p-1.5 rounded-full hover:bg-black/5 disabled:opacity-30 cursor-pointer transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: Fullscreen, PDF, Share, Audio, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-black/5 text-[#5A4535] transition-colors cursor-pointer hidden sm:inline-flex"
            title="Plein écran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="p-2 rounded-full hover:bg-black/5 text-[#5A4535] transition-colors cursor-pointer disabled:opacity-40"
            title="Télécharger le livre PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSpeech}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-[#1194FF] text-white shadow-xs animate-pulse"
                : "bg-[#BFE5FF] hover:bg-[#AEE0FF] text-[#0060A8]"
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{isPlayingAudio ? "Arrêter" : "Écouter"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-[#5A4535] transition-colors cursor-pointer ml-1"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Realistic Open Book Spread Container                         */}
      {/* ------------------------------------------------------------ */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 min-h-[460px]">
        {/* The Open Book Mockup */}
        <div className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9.5] rounded-[22px] sm:rounded-[30px] shadow-[0_20px_50px_rgba(40,25,15,0.18)] bg-[#FDFBF7] border border-[#E3D8C6] overflow-hidden flex flex-col md:flex-row">
          
          {/* Background Realistic Page Stack Depth Effect */}
          <div className="absolute inset-x-0 bottom-0 h-2 bg-[#EFE7D8] border-t border-[#DFD3BE]" />

          {/* ======================================================== */}
          {/* LEFT PAGE : Full Illustration                            */}
          {/* ======================================================== */}
          <div className="relative flex-1 p-3 sm:p-5 md:p-6 flex items-center justify-center bg-[#FAF6EE]">
            <div className="relative w-full h-full rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-xs border border-[#EDE3CF] bg-[#F3ECE0]">
              <Image
                src={currentPage.illustrationUrl || story.coverUrl}
                alt={currentPage.title || story.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            </div>

            {/* Left page curl / fold shadow near spine */}
            <div className="absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-black/10 via-black/3 to-transparent pointer-events-none" />
          </div>

          {/* ======================================================== */}
          {/* CENTRAL BOOK SPINE / FOLD                                */}
          {/* ======================================================== */}
          <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 z-20 pointer-events-none bg-gradient-to-r from-black/12 via-black/2 to-black/12" />
          <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#D4C5AD] z-20 pointer-events-none" />

          {/* ======================================================== */}
          {/* RIGHT PAGE : Story Text & Author Header                  */}
          {/* ======================================================== */}
          <div className="relative flex-1 p-5 sm:p-8 md:p-10 flex flex-col justify-between bg-[#FCFAF5]">
            {/* Right page fold shadow near spine */}
            <div className="hidden md:block absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-black/10 via-black/3 to-transparent pointer-events-none" />

            {/* Header: Author / Child Name in small caps */}
            <div className="flex items-center justify-end w-full">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.18em] text-[#8C7A6D]">
                {authorName}
              </span>
            </div>

            {/* Main Story Narrative */}
            <div className="my-auto py-3 sm:py-6 max-w-md">
              <p className="text-[15px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-normal text-[#2A180E] leading-[1.65] sm:leading-[1.7] tracking-normal font-serif antialiased">
                {currentPage.text}
              </p>
            </div>

            {/* Bottom: Page Folio Number */}
            <div className="flex items-center justify-end w-full">
              <span className="text-xs sm:text-sm font-bold text-[#8C7A6D] tabular-nums">
                {currentPage.pageNumber || currentPageIndex + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
