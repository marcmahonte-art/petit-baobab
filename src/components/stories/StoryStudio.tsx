"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Sparkles,
  ArrowUp,
  Mic,
  Plus,
  Compass,
  BookOpen,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { OpenBookView } from "./OpenBookView"
import { MY_STORIES } from "@/lib/stories/mock-stories"
import { saveCustomStoryLocally } from "@/lib/stories/story-service"
import type { Story } from "@/lib/stories/types"

interface StoryStudioProps {
  initialStory?: Story
  authorName?: string
  onSwitchToWizard?: () => void
}

const INSPIRATION_CHIPS = [
  "Mon enfant de 7 ans ne veut pas dormir chez sa grand-mère.",
  "Peur du noir et des bruits de la nuit",
  "La rentrée des classes au village",
  "Partager son goûter avec un nouvel ami",
  "L'aventure magique sous le baobab étoilé",
]

export function StoryStudio({
  initialStory,
  authorName = "MARC MAHONTE",
  onSwitchToWizard,
}: StoryStudioProps) {
  const [activeStory, setActiveStory] = useState<Story>(initialStory || MY_STORIES[0])
  const [promptText, setPromptText] = useState(
    "Mon enfant de 7 ans ne veut pas dormir chez sa grand-mère. Je vais lui créer un livre d'histoires pour l'aider à surmonter cette difficulté."
  )
  const [lastUserPrompt, setLastUserPrompt] = useState(
    "Mon enfant de 7 ans ne veut pas dormir chez sa grand-mère. Je vais lui créer un livre d'histoires pour l'aider à surmonter cette difficulté."
  )
  const [assistantExplanation, setAssistantExplanation] = useState(
    "J'ai écrit une histoire pour un enfant de 7 ans. Elle raconte l'histoire de Milo, un petit garçon qui surmonte son appréhension lors d'une soirée pyjama chez sa grand-mère en découvrant la magie de ses histoires du soir et d'un ours en peluche nommé Barnabé."
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStyle, setActiveStyle] = useState<"album-jeunesse" | "petit-baobab-3d" | "aquarelle">("album-jeunesse")
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const handleGenerateFromPrompt = async (textToUse?: string) => {
    const text = (textToUse || promptText).trim()
    if (!text || isGenerating) return

    setIsGenerating(true)
    setLastUserPrompt(text)
    if (isMobileDrawerOpen) setIsMobileDrawerOpen(false)

    try {
      const payload = {
        prompt: text,
        visualStyle: activeStyle,
        authorName,
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success && data.story) {
        setActiveStory(data.story)
        saveCustomStoryLocally(data.story)
        setAssistantExplanation(
          data.story.description ||
            `J'ai écrit une histoire inspirée de ton idée : "${data.story.title}".`
        )
      }
    } catch (err) {
      console.warn("Erreur génération Studio:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Assistant Panel Content Component
  const renderAssistantContent = () => (
    <div className="flex flex-col h-full justify-between p-3 sm:p-3.5 bg-white rounded-[20px] border border-[#F0E7DA] shadow-2xs">
      {/* Scrollable conversation and inspiration pills */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {/* User Prompt Message with Child Avatar */}
        {lastUserPrompt && (
          <div className="flex items-start gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#F0E7DA] mt-0.5">
              <Image
                src="/illustrations/premium-boy.webp"
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2.5 sm:p-3 rounded-[16px] rounded-tl-xs bg-[#FDF4EC] text-[#2A180E] text-[12px] font-medium leading-relaxed border border-[#F6E9DE] shadow-2xs flex-1">
              {lastUserPrompt}
            </div>
          </div>
        )}

        {/* Categories / Badges */}
        <div className="flex items-center gap-1.5 pl-8">
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7D6AF8]">
            Livre d&apos;histoires
          </span>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-[#E3D9C9] text-[#7A695C] bg-white">
            Expérience
          </span>
        </div>

        {/* Assistant Response with Sparkles badge */}
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#EDE9FE] text-[#7D6AF8] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="p-2.5 sm:p-3 rounded-[14px] bg-[#FCFAF6] border border-[#F0E7DA] text-[11.5px] sm:text-[12px] text-[#3B2416] leading-[1.5] flex-1">
            <p className="font-normal">{assistantExplanation}</p>
          </div>
        </div>

        {/* Suggestions Capsules */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#7A695C] uppercase tracking-wider">
            <span className="text-amber-500">💡</span>
            <span>IDÉES D&apos;HISTOIRES EN 1 CLIC</span>
          </div>

          <div className="flex flex-col gap-1">
            {INSPIRATION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setPromptText(chip)
                  handleGenerateFromPrompt(chip)
                }}
                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-[12px] bg-[#FCFAF6] hover:bg-[#FFF5E6] text-[#4A3525] border border-[#EFE7DB] hover:border-[#FFD95C] transition-all text-left cursor-pointer"
              >
                <div className="w-4 h-4 rounded-md bg-[#FFE9B8] text-[#8A5600] flex items-center justify-center shrink-0 text-[10px]">
                  💡
                </div>
                <span className="text-[11px] font-semibold truncate flex-1">
                  {chip}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Compact Prompt Box */}
      <div className="pt-2.5 mt-2 border-t border-[#F0E7DA]">
        <div className="relative flex flex-col p-2.5 rounded-[14px] bg-white border border-[#E8DFC8] focus-within:border-[#7D6AF8] transition-all shadow-2xs">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleGenerateFromPrompt()
              }
            }}
            rows={2}
            placeholder="Décris une autre histoire ou modifie celle-ci..."
            className="w-full bg-transparent resize-none focus:outline-none text-[12px] font-semibold text-[#2A180E] placeholder-[#A09082] leading-snug"
          />

          {/* Bottom toolbar inside input */}
          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-[#F2ECE1]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="w-6 h-6 rounded-full border border-[#E3D9C9] text-[#7A695C] flex items-center justify-center hover:bg-[#F2EDE4] transition-colors cursor-pointer"
                title="Ajouter des options"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStyle((prev) =>
                    prev === "album-jeunesse"
                      ? "petit-baobab-3d"
                      : prev === "petit-baobab-3d"
                      ? "aquarelle"
                      : "album-jeunesse"
                  )
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[10.5px] font-bold text-[#5A4535] border border-[#E0D5C3] hover:bg-[#F7F3EA] transition-colors cursor-pointer"
                title="Changer de style visuel"
              >
                <Wand2 className="w-3 h-3 text-[#7D6AF8]" />
                <span className="capitalize">{activeStyle.replace("-", " ")}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateFromPrompt()}
              disabled={isGenerating || !promptText.trim()}
              className="w-7 h-7 rounded-full bg-[#7D6AF8] hover:bg-[#6853F2] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              aria-label="Envoyer"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0">
      {/* ------------------------------------------------------------ */}
      {/* Top Studio Bar (Matching Reference Mockup Exactly)          */}
      {/* ------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 mb-2.5 text-xs font-bold shrink-0">
        {/* Left: Studio indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1D9E75] animate-pulse" />
          <span className="uppercase tracking-wider font-extrabold text-[12px] text-[#3B2416]">
            STUDIO PETIT BAOBAB
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7D6AF8] text-[10px] font-extrabold hidden sm:inline-block">
            Mode Prompt Libre
          </span>
        </div>

        {/* Right: Switcher button + Child Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onSwitchToWizard && (
            <button
              type="button"
              onClick={onSwitchToWizard}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#F2ECE1] border border-[#EAE0D0] text-[11px] font-extrabold text-[#4A3525] transition-all cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#7D6AF8]" />
              <span>Passer au mode formulaire guidé</span>
            </button>
          )}

          {/* Child avatar circle */}
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#E0D5C3] shadow-2xs shrink-0">
            <Image
              src="/illustrations/premium-boy.webp"
              alt="Profil"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Main Studio View: Assistant (300–330px) | Storybook (flex: 1) */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-row gap-3 xl:gap-4 flex-1 min-w-0 min-h-0 items-stretch">
        {/* Desktop & Tablet Assistant Panel */}
        <div className="hidden md:flex flex-col shrink-0 md:w-[270px] xl:w-[320px] max-w-[330px] h-[calc(100vh-80px)]">
          {renderAssistantContent()}
        </div>

        {/* Storybook Hero Zone (occupies the majority of space: flex: 1) */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col h-[calc(100vh-80px)]">
          <OpenBookView story={activeStory} authorName={authorName} />
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Mobile Drawer Trigger Button & Bottom Sheet (< 768px)       */}
      {/* ------------------------------------------------------------ */}
      <div className="md:hidden fixed bottom-18 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#7D6AF8] text-white font-extrabold text-xs shadow-lg hover:bg-[#6853F2] active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>✨ Créer une histoire</span>
        </button>
      </div>

      {/* Mobile Assistant Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full bg-[#FFF9F2] rounded-t-[24px] p-3 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#EFE7DB]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
                <span className="text-xs font-black uppercase text-[#3B2416]">Assistant Studio</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#EDE3D3] text-[#5A4535] text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {renderAssistantContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
