"use client"

import { useState } from "react"
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
  "Mon enfant de 7 ans ne veut pas dormir chez sa grand-mère",
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
    "J'ai écrit une histoire pour un enfant de 7 ans. Elle raconte l'histoire de Milo, un petit garçon qui surmonte son appréhension lors d'une soirée pyjama chez sa grand-mère en découvrant la magie de ses histoires du soir et d'un ours en peluche nommé Barnaby."
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStyle, setActiveStyle] = useState<"album-jeunesse" | "petit-baobab-3d" | "aquarelle">("album-jeunesse")

  const handleGenerateFromPrompt = async (textToUse?: string) => {
    const text = (textToUse || promptText).trim()
    if (!text || isGenerating) return

    setIsGenerating(true)
    setLastUserPrompt(text)

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

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-100px)]">
      {/* Top Studio Nav Switcher */}
      <div className="flex items-center justify-between px-4 py-2 mb-2 border-b border-[#EFE7DB] text-xs font-bold text-[#684C38]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#20C997] animate-pulse" />
          <span className="uppercase tracking-wider font-extrabold text-[#3B2416]">
            Studio Petit Baobab
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] text-[10px]">
            Mode Prompt Libre
          </span>
        </div>

        {onSwitchToWizard && (
          <button
            type="button"
            onClick={onSwitchToWizard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F0E7DA]/60 border border-[#EFE7DB] transition-all cursor-pointer text-[#3B2416]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7D6AF8]" />
            <span>Passer au mode formulaire guidé</span>
          </button>
        )}
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* ========================================================== */}
        {/* LEFT COLUMN : Conversation, Prompts & Suggestions          */}
        {/* ========================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 bg-white rounded-3xl border border-[#F0E7DA] shadow-xs">
          <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {/* User Prompt Bubble */}
            {lastUserPrompt && (
              <div className="flex justify-end">
                <div className="max-w-[90%] sm:max-w-[85%] p-4 rounded-3xl rounded-tr-sm bg-[#F5EFEB] text-[#2A180E] text-sm sm:text-[15px] font-medium leading-relaxed shadow-2xs">
                  {lastUserPrompt}
                </div>
              </div>
            )}

            {/* Assistant Explanation Card */}
            <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E8F0FE] text-[#1967D2]">
                  Livre d&apos;histoires
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#DCD3C4] text-[#6B5A4D]">
                  Expérience
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F0E7DA] text-sm text-[#3B2416] leading-relaxed">
                <p className="font-normal">{assistantExplanation}</p>
              </div>
            </div>

            {/* Suggestions Chips */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-bold text-[#8C7A6D] uppercase tracking-wider">
                Idées d&apos;histoires en 1 clic
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setPromptText(chip)
                      handleGenerateFromPrompt(chip)
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FFF9F2] hover:bg-[#FFEEC9] text-[#684C38] border border-[#F0E7DA] transition-all text-left cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Bar Input Box at Bottom (Gemini style) */}
          <div className="pt-4 mt-4 border-t border-[#F0E7DA]">
            <div className="relative flex flex-col p-3 rounded-2xl bg-[#F8F4ED] border border-[#E8DFC8] focus-within:border-[#7D6AF8] focus-within:bg-white transition-all shadow-xs">
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
                placeholder="Décris ton idée d'histoire ou la situation de ton enfant..."
                className="w-full bg-transparent resize-none focus:outline-none text-sm font-semibold text-[#2A180E] placeholder-[#9E8E81] leading-relaxed"
              />

              {/* Action Toolbar Inside Prompt Box */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#E8DFC8]/40">
                <div className="flex items-center gap-1.5">
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[11px] font-bold text-[#5A4535] border border-[#DCD3C4] hover:bg-[#F2EDE4] transition-colors cursor-pointer"
                    title="Changer de style"
                  >
                    <Wand2 className="w-3 h-3 text-[#7D6AF8]" />
                    <span className="capitalize">{activeStyle.replace("-", " ")}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateFromPrompt()}
                  disabled={isGenerating || !promptText.trim()}
                  className="w-8 h-8 rounded-full bg-[#1194FF] hover:bg-[#007EE5] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  aria-label="Envoyer"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN : Realistic Open Book Preview                 */}
        {/* ========================================================== */}
        <div className="lg:col-span-7 flex flex-col bg-[#F6F1E7] rounded-3xl border border-[#E3D8C6] overflow-hidden shadow-xs">
          <OpenBookView story={activeStory} authorName={authorName} />
        </div>
      </div>
    </div>
  )
}
