"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, BookOpen } from "lucide-react"
import { Story } from "@/lib/stories/types"

interface StoryReaderModalProps {
  story: Story | null
  onClose: () => void
}

export function StoryReaderModal({ story, onClose }: StoryReaderModalProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Reset page when story changes
  useEffect(() => {
    setCurrentPageIndex(0)
    setIsSpeaking(false)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [story])

  // Stop speech on close
  const handleClose = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    onClose()
  }

  if (!story) return null

  const pages = story.pages || []
  const currentPage = pages[currentPageIndex] || {
    pageNumber: 1,
    text: story.description,
    illustrationUrl: story.coverUrl,
  }

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      setCurrentPageIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      setCurrentPageIndex((prev) => prev - 1)
    }
  }

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(currentPage.text)
      utterance.lang = "fr-FR"
      utterance.rate = 0.95 // slightly gentler for children
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#FFFDF8] rounded-[28px] md:rounded-[36px] border border-[#EFE7DB] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E7DA] bg-[#FFF9F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7D6AF8]/15 text-[#7D6AF8] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#3B2416] leading-tight">
                {story.title}
              </h2>
              <span className="text-xs font-semibold text-[#8C7A6D]">
                {story.country ? `${story.country} · ` : ""}
                {story.ageRange}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio narration button */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSpeaking
                  ? "bg-[#7D6AF8] text-white animate-pulse"
                  : "bg-white border border-[#EFE7DB] text-[#3B2416] hover:bg-[#F9F4EB]"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Arrêter</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#7D6AF8]" />
                  <span>Écouter</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white border border-[#EFE7DB] hover:bg-[#F0E7DA] text-[#6E5A4D] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Large illustration */}
          <div className="relative w-full max-w-lg aspect-[16/10] rounded-[22px] overflow-hidden border border-[#F0E7DA] bg-[#FAF5EE] shadow-xs">
            <Image
              src={currentPage.illustrationUrl || story.coverUrl}
              alt={story.title}
              fill
              sizes="(max-width: 640px) 100vw, 520px"
              className="object-cover"
            />
          </div>

          {/* Page badge */}
          <div className="mt-4 px-3 py-1 rounded-full bg-[#FFF4D6] text-[#B88100] text-xs font-extrabold tracking-wider">
            PAGE {currentPageIndex + 1} / {Math.max(pages.length, 1)}
          </div>

          {/* Story Text */}
          <p className="mt-4 text-base sm:text-lg text-[#3B2416] font-semibold text-center max-w-xl leading-relaxed">
            « {currentPage.text} »
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFF9F2] border-t border-[#F0E7DA]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPageIndex === 0}
            className="px-4 py-2 rounded-full border border-[#EFE7DB] bg-white text-[#3B2416] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 hover:bg-[#F9F4EB] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {/* Pagination dots */}
          <div className="flex items-center gap-1.5">
            {pages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel()
                    setIsSpeaking(false)
                  }
                  setCurrentPageIndex(idx)
                }}
                className={`transition-all rounded-full ${
                  currentPageIndex === idx
                    ? "w-5 h-2 bg-[#7D6AF8]"
                    : "w-2 h-2 bg-[#D9CDC2] hover:bg-[#B5A599]"
                }`}
                aria-label={`Aller à la page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentPageIndex >= pages.length - 1}
            className="px-4 py-2 rounded-full bg-[#7D6AF8] hover:bg-[#6852F6] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <span>Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
