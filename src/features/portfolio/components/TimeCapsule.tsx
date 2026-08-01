"use client"

import { motion } from "framer-motion"
import { Lock, Mail, Send } from "lucide-react"
import { useState } from "react"
import { CARD_IN } from "../animations"
import { CAPSULE_OPTIONS } from "../constants"
import type { TimeCapsule } from "../types"
import { cn } from "@/lib/utils"

interface TimeCapsuleProps {
  capsules: TimeCapsule[]
  childName?: string
  onSave: (message: string, years: 1 | 3 | 5, author?: string) => void
  onOpen: (capsuleId: string) => void
}

export function TimeCapsule({ capsules, childName, onSave, onOpen }: TimeCapsuleProps) {
  const [message, setMessage] = useState("")
  const [years, setYears] = useState<1 | 3 | 5>(1)
  const [author, setAuthor] = useState("")

  const now = Date.now()

  const locked = capsules.filter((c) => new Date(c.locked_until).getTime() > now)
  const unlocked = capsules.filter((c) => new Date(c.locked_until).getTime() <= now && !c.opened)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    onSave(message.trim(), years, author.trim() || undefined)
    setMessage("")
    setAuthor("")
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Écrire un message */}
      <motion.form
        variants={CARD_IN}
        initial="hidden"
        animate="visible"
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-2xl border border-[#F1E7DA] bg-white p-5 shadow-sm"
      >
        <p className="flex items-center gap-2 text-sm font-extrabold text-[#3B2416]">
          <Mail className="h-4 w-4 text-[#FF8A00]" aria-hidden="true" />
          Capsule temporelle
        </p>
        <p className="text-xs font-medium text-[#7A6A5E]">
          Écrivez un message pour {childName ?? "votre enfant"} — il sera débloqué plus tard.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Mon petit trésor, je suis si fier de toi…"
          className="w-full resize-none rounded-xl border border-[#F1E7DA] bg-[#FDFAF5] p-3 text-sm font-semibold text-[#3B2416] outline-none transition focus:border-[#FF8A00]"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Signature (optionnel)"
          className="w-full rounded-xl border border-[#F1E7DA] bg-[#FDFAF5] px-3 py-2.5 text-sm font-semibold text-[#3B2416] outline-none transition focus:border-[#FF8A00]"
        />
        <div className="flex items-center gap-2">
          {CAPSULE_OPTIONS.map((option) => (
            <button
              key={option.years}
              type="button"
              onClick={() => setYears(option.years)}
              className={cn(
                "flex-1 cursor-pointer rounded-full px-3 py-2 text-xs font-bold transition",
                years === option.years ? "bg-[#3B2416] text-white" : "bg-[#F5F0EB] text-[#7A6A5E] hover:bg-[#EAD9BF]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#e67d00] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Enfouir le message
        </button>
      </motion.form>

      {/* Messages enfouis */}
      <div className="flex flex-col gap-3">
        {locked.length > 0 && (
          <div className="rounded-2xl border border-[#F1E7DA] bg-white p-5 shadow-sm">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#7A6A5E]">
              Messages enfouis ({locked.length})
            </p>
            <ul className="space-y-2">
              {locked.map((capsule) => (
                <li
                  key={capsule.id}
                  className="flex items-center gap-2 rounded-xl bg-[#FDFAF5] px-3 py-2 text-xs font-semibold text-[#7A6A5E]"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#FF8A00]" aria-hidden="true" />
                  <span className="flex-1 truncate">{capsule.message}</span>
                  <span className="shrink-0 font-bold text-[#FF8A00]">
                    {new Date(capsule.locked_until).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {unlocked.length > 0 && (
          <div className="rounded-2xl border border-[#20C997]/30 bg-gradient-to-br from-[#F2FCF7] to-white p-5 shadow-sm">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#1D9E75]">
              Capsules débloquées 🎉
            </p>
            <ul className="space-y-2">
              {unlocked.map((capsule) => (
                <li key={capsule.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(capsule.id)}
                    className="w-full cursor-pointer rounded-xl bg-white px-3 py-3 text-left text-sm font-bold text-[#3B2416] shadow-sm transition hover:shadow"
                  >
                    « {capsule.message} »
                    {capsule.author && (
                      <span className="mt-0.5 block text-xs font-semibold text-[#7A6A5E]">— {capsule.author}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {locked.length === 0 && unlocked.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#EAD9BF] bg-white p-8 text-center">
            <Lock className="h-8 w-8 text-[#EAD9BF]" aria-hidden="true" />
            <p className="text-sm font-bold text-[#7A6A5E]">Aucune capsule enfouie pour le moment.</p>
            <p className="text-xs font-medium text-[#B4A495]">Écrivez un message : il sera débloqué dans 1, 3 ou 5 ans.</p>
          </div>
        )}
      </div>
    </div>
  )
}
