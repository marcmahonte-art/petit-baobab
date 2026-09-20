"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Sparkles,
  ArrowUp,
  Plus,
  Wand2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { OpenBookView } from "./OpenBookView"
import { MY_STORIES } from "@/lib/stories/mock-stories"
import { saveCustomStoryLocally } from "@/lib/stories/story-service"
import { useProfile } from "@/lib/hooks/useProfile"
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

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export function StoryStudio({
  initialStory,
  authorName = "MARC MAHONTE",
  onSwitchToWizard,
}: StoryStudioProps) {
  const [activeStory, setActiveStory] = useState<Story>(initialStory || MY_STORIES[0])
  // Conversation vierge au démarrage : aucun message simulé.
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [promptText, setPromptText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStyle, setActiveStyle] = useState<"album-jeunesse" | "petit-baobab-3d" | "aquarelle">("album-jeunesse")
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Vrai profil de l'enfant. Sans lui, la requête ne portait que le prompt :
  // l'API retombait donc sur ses valeurs par défaut (prénom « Milo », 7 ans)
  // et toutes les histoires parlaient du même enfant.
  const profile = useProfile()
  // Message affiché quand le texte ne vient pas d'une IA (transparence).
  const [generationNotice, setGenerationNotice] = useState<string | null>(null)

  const messageIdRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const makeMessage = (role: ChatMessage["role"], content: string): ChatMessage => {
    messageIdRef.current += 1
    return { id: `${role}-${messageIdRef.current}`, role, content }
  }

  // Un chat normal reste calé en bas quand la conversation grandit.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [messages, isGenerating])

  const handleGenerateFromPrompt = async (textToUse?: string) => {
    const text = (textToUse || promptText).trim()
    if (!text || isGenerating) return

    setMessages((prev) => [...prev, makeMessage("user", text)])
    setPromptText("")
    setIsGenerating(true)
    if (isMobileDrawerOpen) setIsMobileDrawerOpen(false)

    try {
      const payload = {
        prompt: text,
        visualStyle: activeStyle,
        authorName,
        // Prénom et âge réels de l'enfant connecté. L'âge est borné : le schéma
        // de l'API n'accepte que 3 à 12 ans.
        name: profile.name ? profile.name.slice(0, 30) : undefined,
        age: profile.age && profile.age >= 3 && profile.age <= 12 ? profile.age : undefined,
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
        // On n'affiche la mention que si le texte ne vient pas d'un modèle.
        setGenerationNotice(
          data.generation?.source === "ai"
            ? null
            : data.generation?.reason || "Texte issu de la bibliothèque Petit Baobab."
        )
        setMessages((prev) => [
          ...prev,
          makeMessage(
            "assistant",
            data.story.description ||
              `J'ai écrit une histoire inspirée de ton idée : « ${data.story.title} ».`
          ),
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          makeMessage(
            "assistant",
            "Je n'ai pas réussi à créer l'histoire. Peux-tu reformuler ou réessayer ?"
          ),
        ])
      }
    } catch (err) {
      console.warn("Erreur génération Studio:", err)
      setMessages((prev) => [
        ...prev,
        makeMessage("assistant", "La connexion a échoué. Réessaie dans un instant."),
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  // Assistant Panel Content Component
  const renderAssistantContent = () => (
    <div className="flex flex-col h-full justify-between p-3 sm:p-3.5 bg-white rounded-[20px] border border-[#F0E7DA] shadow-2xs">
      {/* Scrollable conversation */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {/* État vide : on accueille et on propose des idées, aucun message simulé */}
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center text-center gap-1.5 py-6">
              <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7D6AF8] flex items-center justify-center">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <p className="text-[12px] font-extrabold text-[#3B2416]">
                Commence une nouvelle histoire
              </p>
              <p className="text-[11px] text-[#7A695C] leading-snug max-w-[220px]">
                Décris la situation de ton enfant ou l&apos;aventure que tu imagines.
              </p>
            </div>

            {/* Suggestions Capsules */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#7A695C] uppercase tracking-wider">
                <span className="text-amber-500">💡</span>
                <span>IDÉES D&apos;HISTOIRES EN 1 CLIC</span>
              </div>

              <div className="flex flex-col gap-1">
                {INSPIRATION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleGenerateFromPrompt(chip)}
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
        )}

        {/* Historique de la conversation */}
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex items-start gap-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#F0E7DA] mt-0.5">
                <Image
                  src="/illustrations/premium-boy.webp"
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2.5 sm:p-3 rounded-[16px] rounded-tl-xs bg-[#FDF4EC] text-[#2A180E] text-[12px] font-medium leading-relaxed border border-[#F6E9DE] shadow-2xs flex-1 whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#EDE9FE] text-[#7D6AF8] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="p-2.5 sm:p-3 rounded-[14px] bg-[#FCFAF6] border border-[#F0E7DA] text-[11.5px] sm:text-[12px] text-[#3B2416] leading-[1.5] flex-1 whitespace-pre-wrap break-words">
                <p className="font-normal">{message.content}</p>
              </div>
            </div>
          )
        )}

        {/* Indicateur de rédaction pendant la génération */}
        {isGenerating && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EDE9FE] text-[#7D6AF8] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="px-3 py-2.5 rounded-[14px] bg-[#FCFAF6] border border-[#F0E7DA] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7A9F5] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7A9F5] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7A9F5] animate-bounce" />
            </div>
          </div>
        )}

        {/* Transparence : d'où vient réellement le texte affiché */}
        {generationNotice && !isGenerating && (
          <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-[12px] bg-[#FFF7E6] border border-[#F3E1B4] text-[10.5px] leading-snug text-[#7A5A12]">
            <span className="shrink-0 font-bold">i</span>
            <span>
              Histoire issue de la bibliothèque Petit Baobab, pas encore d&apos;une IA.
              <span className="block opacity-80">{generationNotice}</span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
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
            placeholder={
              messages.length === 0
                ? "Décris l'histoire que tu veux créer..."
                : "Écris ton message..."
            }
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
