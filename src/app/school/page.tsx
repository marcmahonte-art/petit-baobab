"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, LogIn, School } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuthStore } from "@/lib/auth-store";
import type { StudentLoginInput, StudentLoginResponse, MultipleStudentsResponse } from "@/types/school";

const SCHOOL_GREEN = "#1D9E75";
const SCHOOL_GREEN_LIGHT = "#E1F5EE";

export default function SchoolLoginPage() {
  const router = useRouter();
  const setStudentSession = useAuthStore((s) => s.setStudentSession);

  const [classCode, setClassCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [candidates, setCandidates] = useState<MultipleStudentsResponse["students"] | null>(null);

  const resetHomonymes = useCallback(() => setCandidates(null), []);

  const doLogin = useCallback(
    async (body: StudentLoginInput) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/student-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Une erreur est survenue. Réessaie !");
          setLoading(false);
          return;
        }

        if (data.multiple) {
          setCandidates(data.students);
          setLoading(false);
          return;
        }

        const payload = data as StudentLoginResponse;
        setStudentSession({
          type: "student",
          name: payload.name,
          mascot: payload.mascot,
          profileId: payload.profile_id,
          classroomId: payload.classroom_id,
          starsBalance: payload.stars_balance,
        });

        setSuccess(true);
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: [SCHOOL_GREEN, "#7D6AF8", "#FFB300"] });
        setTimeout(() => router.push("/dashboard"), 1000);
      } catch (e) {
        setError("Une erreur est survenue. Réessaie !");
        setLoading(false);
      }
    },
    [router, setStudentSession]
  );

  const handleSubmit = () => {
    resetHomonymes();
    doLogin({ class_code: classCode, first_name: firstName });
  };

  const handlePickCandidate = (studentId: string) => {
    doLogin({ class_code: classCode, first_name: firstName, student_id: studentId });
  };

  // Après un succès, on évite tout rendu de formulaire
  if (success) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-xl md:text-2xl font-extrabold text-[#1C1C3A]">
            Bonjour {firstName} !
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] flex flex-col">
      {/* Header minimal */}
      <header className="flex items-center justify-between px-5 md:px-10 py-5">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-petit-baobab.svg" alt="Petit Baobab" className="h-9 w-auto" />
        </div>
        <a
          href="/login"
          className="text-sm font-bold text-[#7A6A5E] hover:text-[#1C1C3A] transition-colors"
        >
          Espace adulte →
        </a>
      </header>

      {/* Zone centrale */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.08)] p-6 md:p-8 border border-[#EFE7DB]">
            {candidates ? (
              <>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1C3A] text-center mb-1">
                  Qui es-tu ?
                </h1>
                <p className="text-sm font-semibold text-[#7A6A5E] text-center mb-6">
                  Plusieurs élèves portent ce prénom.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {candidates.map((c, i) => (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handlePickCandidate(c.id)}
                      disabled={loading}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-[#E8E8EF] hover:border-[#1D9E75] hover:bg-[#E1F5EE] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="text-5xl">{mascotEmoji(c.mascot)}</span>
                      <span className="text-sm font-bold text-[#1C1C3A] text-center">{c.display_name}</span>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={resetHomonymes}
                  disabled={loading}
                  className="mt-4 w-full text-sm font-bold text-[#7A6A5E] hover:text-[#1C1C3A] cursor-pointer bg-transparent border-none"
                >
                  ← Recommencer
                </button>
              </>
            ) : (
              <>
                {/* Illustration mascotte */}
                <div className="flex justify-center mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/illustrations/awa.webp"
                    alt="Awa fait coucou"
                    className="h-28 w-28 object-contain"
                  />
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C1C3A] text-center mb-1">
                  Rejoins ta classe !
                </h1>
                <p className="text-sm font-semibold text-[#7A6A5E] text-center mb-6">
                  Ton maître t&apos;a donné un code ? C&apos;est parti !
                </p>

                {/* Champ Code de classe */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <label className="block text-sm font-bold text-[#3B2416] mb-1.5">
                    Code de ta classe
                  </label>
                  <input
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    placeholder="Ex : BAOBAB-CE1A"
                    className="w-full h-12 px-4 rounded-full border-2 bg-white text-[#1C1C3A] font-bold placeholder:text-[#B7A99A] outline-none transition-colors focus:border-[#1D9E75]"
                    style={classCode ? { borderColor: SCHOOL_GREEN } : { borderColor: "#E8E8EF" }}
                  />
                </motion.div>

                {/* Champ Prénom */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-5"
                >
                  <label className="block text-sm font-bold text-[#3B2416] mb-1.5">
                    Ton prénom
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder="Awa, Kofi, Aminata..."
                    className="w-full h-12 px-4 rounded-full border-2 border-[#E8E8EF] bg-white text-[#1C1C3A] font-bold placeholder:text-[#B7A99A] outline-none transition-colors focus:border-[#1D9E75]"
                  />
                </motion.div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-sm font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 md:h-14 rounded-full font-bold text-white text-sm md:text-base flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 cursor-pointer"
                  style={{ backgroundColor: SCHOOL_GREEN }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> On te cherche...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" /> C&apos;est parti !
                    </>
                  )}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function mascotEmoji(mascot: string): string {
  if (mascot === "lion") return "🦁";
  if (mascot === "robot") return "🤖";
  return "🐵";
}
