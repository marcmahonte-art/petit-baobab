"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Hash,
  User,
  Loader2,
  School,
  AlertCircle,
  Shield,
  CheckCircle,
} from "lucide-react"
import confetti from "canvas-confetti"
import { useAuthStore } from "@/lib/auth-store"
import { getMascotImage } from "@/lib/mascots"
import type { StudentLoginInput, StudentLoginResponse, MultipleStudentsResponse } from "@/types/school"

type Status = "idle" | "loading" | "success"

export function StudentLoginForm() {
  const router = useRouter()
  const setStudentSession = useAuthStore((s) => s.setStudentSession)

  const [classCode, setClassCode] = useState("")
  const [firstName, setFirstName] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<MultipleStudentsResponse["students"] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const resetHomonymes = useCallback(() => setCandidates(null), [])

  const doLogin = useCallback(
    async (body: StudentLoginInput) => {
      setStatus("loading")
      setError(null)
      try {
        const res = await fetch("/api/auth/student-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Connexion impossible, réessaie dans quelques secondes")
          setStatus("idle")
          return
        }

        if (data.multiple) {
          setCandidates(data.students)
          setStatus("idle")
          return
        }

        const payload = data as StudentLoginResponse
        setStudentSession({
          type: "student",
          name: payload.name,
          mascot: payload.mascot,
          profileId: payload.profile_id,
          classroomId: payload.classroom_id,
          classroomName: payload.classroom_name,
          accountId: payload.account_id,
          starsBalance: payload.stars_balance,
        })

        setStatus("success")
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
        setTimeout(() => router.push("/dashboardstudent"), 800)
      } catch {
        setError("Connexion impossible, réessaie dans quelques secondes")
        setStatus("idle")
      }
    },
    [router, setStudentSession]
  )

  const handleSubmit = () => {
    resetHomonymes()
    setSelectedId(null)
    doLogin({
      class_code: classCode.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
      first_name: firstName.trim(),
    })
  }

  const handlePickCandidate = (studentId: string) => {
    setSelectedId(studentId)
    doLogin({ class_code: classCode, first_name: firstName, student_id: studentId })
  }

  if (status === "success") {
    return (
      <div className="text-center flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center"
        >
          <CheckCircle className="w-11 h-11 text-[#1D9E75]" />
        </motion.div>
        <p className="text-xl md:text-2xl font-extrabold text-[#1C1C3A]">
          Bonjour {firstName.trim()} !
        </p>
      </div>
    )
  }

  return (
    <div>
      {candidates ? (
        <>
          <h1 className="text-3xl md:text-[40px] font-extrabold text-[#1C1C3A] leading-tight mb-2.5 text-center">
            Qui es-tu ?
          </h1>
          <p className="text-sm font-semibold text-[#64748B] leading-relaxed text-center mb-7">
            Plusieurs élèves ont le même prénom dans ta classe.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {candidates.map((c, i) => {
              const isSelected = selectedId === c.id
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.35, ease: "easeOut" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePickCandidate(c.id)}
                  disabled={status === "loading"}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors cursor-pointer disabled:opacity-60 ${
                    isSelected
                      ? "border-[#7D6AF8] bg-[#EEEDFE]"
                      : "border-[#E8E8EF] hover:border-[#7D6AF8] hover:bg-[#EEEDFE]"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-[#7D6AF8]">
                      <CheckCircle className="w-5 h-5" />
                    </span>
                  )}
                  <img src={getMascotImage(c.mascot)} alt={c.display_name} className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-[13px] font-medium text-[#1C1C3A] text-center">
                    {c.display_name}
                  </span>
                </motion.button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={resetHomonymes}
            disabled={status === "loading"}
            className="w-full text-sm font-bold text-[#64748B] hover:text-[#1C1C3A] bg-transparent border-none cursor-pointer disabled:opacity-60"
          >
            ← Recommencer
          </button>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#EEEDFE] flex items-center justify-center">
              <School className="w-8 h-8 text-[#7D6AF8]" />
            </div>
            <h1 className="text-3xl md:text-[40px] font-extrabold text-[#1C1C3A] leading-tight mb-2.5">
              Espace élève
            </h1>
            <p className="text-sm font-semibold text-[#64748B] leading-relaxed">
              Entre ton code de classe et ton prénom
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Champ Code de classe */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="w-full flex flex-col gap-1.5 text-left"
            >
              <label
                htmlFor="class-code-input"
                className="text-xs font-bold text-[#64748B] uppercase tracking-wider select-none"
              >
                Code de ta classe
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none z-10">
                  <Hash className="w-5 h-5" />
                </div>
                <input
                  id="class-code-input"
                  value={classCode}
                  onChange={(e) =>
                    setClassCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))
                  }
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Ex : BAOBAB-CE1A"
                  className="w-full h-[46px] md:h-14 pl-11 md:pl-12 pr-4 rounded-xl md:rounded-2xl border-2 bg-white text-[#1C1C3A] font-semibold text-base transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed border-[#E8E8EF] hover:border-[#7D6AF8] focus:border-[#7D6AF8] focus:ring-[#7D6AF8]/20"
                />
              </div>
            </motion.div>

            {/* Champ Prénom */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="w-full flex flex-col gap-1.5 text-left"
            >
              <label
                htmlFor="first-name-input"
                className="text-xs font-bold text-[#64748B] uppercase tracking-wider select-none"
              >
                Ton prénom
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none z-10">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="first-name-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  autoComplete="given-name"
                  placeholder="Awa, Kofi, Aminata..."
                  className="w-full h-[46px] md:h-14 pl-11 md:pl-12 pr-4 rounded-xl md:rounded-2xl border-2 bg-white text-[#1C1C3A] font-semibold text-base transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed border-[#E8E8EF] hover:border-[#7D6AF8] focus:border-[#7D6AF8] focus:ring-[#7D6AF8]/20"
                />
              </div>
            </motion.div>

            {error && (
              <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-[#FCEBEB] text-[#E24B4A] text-[13px] font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={status === "loading" || (!classCode && !firstName)}
              className="w-full h-[52px] bg-[#7D6AF8] text-white font-bold text-sm md:text-base rounded-full shadow-[0_4px_12px_rgba(125,106,248,0.15)] flex items-center justify-center gap-2 transition-all hover:shadow-[0_6px_20px_rgba(125,106,248,0.25)] focus:outline-none focus:ring-2 focus:ring-[#7D6AF8]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> On te cherche...
                </>
              ) : (
                "C'est parti ! →"
              )}
            </motion.button>
          </div>

          {/* Bandeau bas : espace sécurisé */}
          <div className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl bg-[#F6F6F9] border border-[#E8E8EF] py-3 px-4">
            <Shield className="w-4 h-4 text-[#1D9E75]" />
            <span className="text-xs font-semibold text-[#64748B]">
              Espace sécurisé pour les enfants
            </span>
          </div>
        </>
      )}
    </div>
  )
}
