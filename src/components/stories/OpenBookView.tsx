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
  className?: string
}

export function OpenBookView({
  story,
  onClose,
  authorName = "MARC MAHONTE",
  className,
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
      className={`relative flex flex-col w-full h-full min-h-0 select-none bg-[#FFF9F2] rounded-[24px] border border-[#F0E7DA] overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none p-4 justify-between" : ""
      } ${className || ""}`}
    >
      {/* ------------------------------------------------------------ */}
      {/* Decorative Botanical Elements (Petit Baobab leaves in corners) */}
      {/* ------------------------------------------------------------ */}
      <div className="absolute top-10 -left-6 w-24 h-24 pointer-events-none opacity-40 select-none z-0">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#8DAA72]">
          <path
            d="M20,60 C10,40 30,20 60,30 C70,45 50,65 20,60 Z"
            fill="currentColor"
          />
          <path
            d="M35,80 C25,65 40,50 65,55 C70,70 55,85 35,80 Z"
            fill="currentColor"
            opacity="0.8"
          />
        </svg>
      </div>
      <div className="absolute top-12 -right-8 w-28 h-28 pointer-events-none opacity-35 select-none z-0">
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full text-[#8DAA72]">
          <path
            d="M40,20 C70,10 90,35 80,65 C60,75 40,55 40,20 Z"
            fill="currentColor"
          />
          <path
            d="M20,45 C45,35 65,55 55,80 C40,90 25,75 20,45 Z"
            fill="currentColor"
            opacity="0.75"
          />
        </svg>
      </div>
      <div className="absolute bottom-4 -left-6 w-24 h-24 pointer-events-none opacity-40 select-none z-0">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#8DAA72]">
          <path
            d="M30,85 C15,65 30,40 60,45 C68,60 52,85 30,85 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="absolute bottom-2 -right-6 w-32 h-32 pointer-events-none opacity-45 select-none z-0">
        <svg viewBox="0 0 130 130" fill="none" className="w-full h-full text-[#8DAA72]">
          <path
            d="M50,90 C30,70 50,45 80,50 C95,70 75,100 50,90 Z"
            fill="currentColor"
          />
          <path
            d="M85,110 C65,95 80,75 105,80 C115,95 100,115 85,110 Z"
            fill="currentColor"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 1. Discreet Compact Toolbar (Height ≈ 42–46px)               */}
      {/* ------------------------------------------------------------ */}
      <div className="relative z-10 h-[44px] shrink-0 flex items-center justify-between px-3 sm:px-4 border-b border-[#F0E7DA]/70 bg-transparent text-[#3B2416]">
        {/* Left: Back button & Story Title (13–14px) */}
        <div className="flex items-center gap-2 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F2EDE4] text-[#5A4535] transition-colors cursor-pointer"
              title="Retour"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="font-bold text-[13px] sm:text-[14px] text-[#2A180E] truncate max-w-[150px] sm:max-w-[260px] md:max-w-[340px]">
            {story.title}
          </h2>
        </div>

        {/* Center: Pagination (< 1/3 >) */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A4535]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPageIndex === 0}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F2EDE4] disabled:opacity-30 cursor-pointer transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="tabular-nums tracking-wider text-[12px] px-1 font-extrabold text-[#3B2416]">
            {currentPageIndex + 1} / {Math.max(pages.length, 1)}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPageIndex >= pages.length - 1}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F2EDE4] disabled:opacity-30 cursor-pointer transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Tools: Fullscreen, PDF, Audio (buttons 28–32px, icons 15–16px) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F2EDE4] text-[#6B5A4D] transition-colors cursor-pointer hidden sm:inline-flex"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-[15px] h-[15px]" /> : <Maximize2 className="w-[15px] h-[15px]" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F2EDE4] text-[#6B5A4D] transition-colors cursor-pointer disabled:opacity-40"
            title="Télécharger le livre PDF"
          >
            <Download className="w-[15px] h-[15px]" />
          </button>

          {/* Audio Pill Button */}
          <button
            type="button"
            onClick={toggleSpeech}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-[#1194FF] text-white shadow-xs animate-pulse"
                : "bg-[#BFE5FF] hover:bg-[#AEE0FF] text-[#0060A8]"
            }`}
            title={isPlayingAudio ? "Arrêter la lecture" : "Écouter l'histoire"}
          >
            {isPlayingAudio ? <VolumeX className="w-[15px] h-[15px]" /> : <Volume2 className="w-[15px] h-[15px]" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 2. Main Centered Book Stage (.book-stage)                    */}
      {/* ------------------------------------------------------------ */}
      <div className="book-stage relative z-10 flex-1 min-w-0 min-h-0 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
        
        {/* Floating Left Page Turn Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPageIndex === 0}
          className="absolute left-2 sm:left-4 z-30 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/95 hover:bg-white border border-[#EDE3CF] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#5A4535] hover:text-[#2A180E] disabled:opacity-20 cursor-pointer transition-all hover:scale-105 active:scale-95"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Floating Right Page Turn Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPageIndex >= pages.length - 1}
          className="absolute right-2 sm:right-4 z-30 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-white/95 hover:bg-white border border-[#EDE3CF] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#5A4535] hover:text-[#2A180E] disabled:opacity-20 cursor-pointer transition-all hover:scale-105 active:scale-95"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Open Book Spread (Strictly preserving aspect ratio, centered in soft cream space) */}
        <div
          className="relative w-full max-w-[680px] xl:max-w-[740px] aspect-[16/10.5] max-h-[58vh] rounded-[18px] sm:rounded-[24px] bg-[#FFFDF9] border border-[#E8DFC8] shadow-[0_14px_38px_rgba(60,35,18,0.12)] flex flex-row overflow-hidden transition-all"
        >
          {/* Subtle realistic book page edge at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#EAE2D2] border-t border-[#DBD0BE] z-10" />

          {/* ======================================================== */}
          {/* LEFT PAGE : Illustration with soft frame                */}
          {/* ======================================================== */}
          <div className="relative flex-1 p-3 sm:p-4 md:p-5 flex items-center justify-center bg-[#FAF6EE]">
            <div className="relative w-full h-full rounded-[14px] sm:rounded-[16px] overflow-hidden border border-[#E9DFCE] bg-[#F2EDE2] shadow-2xs">
              <Image
                src={currentPage.illustrationUrl || story.coverUrl}
                alt={currentPage.title || story.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
            </div>

            {/* Subtle inner spine shadow on left page */}
            <div className="absolute inset-y-0 right-0 w-8 sm:w-10 bg-gradient-to-l from-black/8 via-black/2 to-transparent pointer-events-none" />
          </div>

          {/* ======================================================== */}
          {/* CENTRAL SPINE / SEAM                                    */}
          {/* ======================================================== */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 z-20 pointer-events-none bg-gradient-to-r from-black/10 via-black/2 to-black/10" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#D8CCB7] z-20 pointer-events-none" />

          {/* ======================================================== */}
          {/* RIGHT PAGE : Story Text, Author, Floral Accent & Folio    */}
          {/* ======================================================== */}
          <div className="relative flex-1 p-4 sm:p-6 md:p-7 flex flex-col justify-between bg-[#FFFEFC]">
            {/* Spine shadow on right page */}
            <div className="absolute inset-y-0 left-0 w-8 sm:w-10 bg-gradient-to-r from-black/8 via-black/2 to-transparent pointer-events-none" />

            {/* Top: Author in small caps */}
            <div className="flex items-center justify-end w-full">
              <span className="text-[9.5px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9A8778]">
                {authorName}
              </span>
            </div>

            {/* Middle: Story Text in elegant readable serif typography */}
            <div className="my-auto py-1 sm:py-2 max-w-sm overflow-hidden">
              <p className="text-[13px] sm:text-[15px] md:text-[17px] font-normal text-[#2A180E] leading-[1.65] sm:leading-[1.7] tracking-normal font-serif antialiased line-clamp-8">
                {currentPage.text}
              </p>
            </div>

            {/* Bottom: Petit Baobab Floral Ornament */}
            <div className="flex flex-col items-center justify-center gap-1 w-full mt-auto">
              <div className="flex items-center justify-center gap-1 text-[#C49B3E]">
                <svg className="w-5 h-3.5 fill-current opacity-85" viewBox="0 0 24 16">
                  <path d="M12,8 C9,3 4,4 2,7 C5,10 10,10 12,8 Z M12,8 C15,3 20,4 22,7 C19,10 14,10 12,8 Z" />
                </svg>
              </div>
              <div className="w-16 h-[1px] bg-[#E8DFC8]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
