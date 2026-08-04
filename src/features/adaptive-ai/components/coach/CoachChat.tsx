"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles } from "lucide-react"
import type { CoachMessageUI } from "@/stores/coach-store"

interface CoachChatProps {
  messages: CoachMessageUI[]
  onSend: (content: string) => Promise<string | null>
  disabled?: boolean
}

const SUGGESTIONS = [
  "Que dois-je faire aujourd'hui ?",
  "Comment gagner des étoiles ?",
  "J'ai envie d'un coloriage d'animal !",
  "Raconte-moi pourquoi lire c'est bien",
]

const AVATARS: Record<string, string> = {
  child: "🧒",
  coach: "🤖",
}

/** Dialogue avec le coach IA (Section 10) — messages optimistes + réponses. */
export function CoachChat({ messages, onSend, disabled }: CoachChatProps) {
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const handleSend = async (content: string) => {
    const text = content.trim()
    if (!text || sending) return
    setInput("")
    setSending(true)
    try {
      await onSend(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${msg.role === "child" ? "flex-row-reverse" : "flex-row"}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF9F2] text-sm shadow-sm">
                {AVATARS[msg.role] ?? "🤖"}
              </span>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                  msg.role === "child"
                    ? "rounded-tr-sm bg-[#7D6AF8] text-white"
                    : "rounded-tl-sm border border-[#F1E7DA] bg-white text-[#3B2416]"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs font-bold text-[#7A6A5E]"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#7D6AF8]" />
            Le coach réfléchit…
          </motion.div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && !sending && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              disabled={disabled || sending}
              className="rounded-full border border-[#F1E7DA] bg-[#FFF9F2] px-3 py-1.5 text-[11px] font-bold text-[#5B4AE0] transition-colors hover:bg-[#F7F4FF] disabled:opacity-50 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSend(input)
        }}
        className="mt-3 flex items-center gap-2 rounded-full border border-[#F1E7DA] bg-white p-1.5 pl-4 shadow-sm focus-within:ring-1 focus-within:ring-[#FFD95C]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris à ton coach…"
          maxLength={240}
          disabled={disabled || sending}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#3B2416] placeholder-[#7A6A5E]/60 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || sending || !input.trim()}
          aria-label="Envoyer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7D6AF8] to-[#20C997] text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer border-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
