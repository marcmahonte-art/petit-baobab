"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Send } from "lucide-react";

const BOT_ICON = "/illustrations/zuri-galop-boucle.webp";

interface ChatMsg {
  role: "bot" | "user";
  text: string;
}

const MARKETING_ROOTS = [
  "/fonctionnalites",
  "/tarification",
  "/about",
  "/boutique",
  "/confidentialite",
  "/coloriage",
  "/livres-de-coloriage",
];

function isMarketingPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return MARKETING_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

const QUICK_QUESTIONS = [
  "Comment commencer ?",
  "Quels sont les tarifs ?",
  "Comment payer ?",
  "Où sont mes téléchargements ?",
];

const GREETING =
  "Bonjour ! 👋 Je suis l'assistant Petit Baobab. Tu as une question sur l'inscription, les tarifs, les livres ou la boutique ?";

export default function HelpBot() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "bot", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isMarketingPath(pathname)) return;
    if (greetedRef.current) return;
    greetedRef.current = true;
    const t = setTimeout(() => {
      if (!open) setShowGreeting(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [mounted, pathname, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  if (!mounted || !isMarketingPath(pathname)) return null;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    setShowGreeting(false);
    setMessages((prev) => [...prev, { role: "user", text: content }]);
    setLoading(true);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      const reply =
        typeof data?.reply === "string"
          ? data.reply
          : "Désolé, une erreur est survenue. Réessaie plus tard.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bulle flottante */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
          {showGreeting && (
            <button
              onClick={() => {
                setOpen(true);
                setShowGreeting(false);
              }}
              className="max-w-[240px] rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-[#3B2416] shadow-xl border border-[#E5E0D5] hover:bg-[#FFF9F2] transition-colors"
            >
              {GREETING}
            </button>
          )}
          <button
            aria-label="Ouvrir l'assistant d'aide"
            onClick={() => {
              setOpen(true);
              setShowGreeting(false);
            }}
            className="block transition-transform hover:scale-105"
          >
            <img
              src={BOT_ICON}
              alt="Assistant Petit Baobab"
              className="h-40 w-40 object-contain drop-shadow-xl"
            />
          </button>
        </div>
      )}

      {/* Panneau */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] flex h-[min(70vh,560px)] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#7D6AF8] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20">
                <img
                  src={BOT_ICON}
                  alt="Assistant Petit Baobab"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold">Assistant Petit Baobab</p>
                <p className="text-[11px] text-white/80">On t'aide quand tu veux</p>
              </div>
            </div>
            <button
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#FFF9F2] px-4 py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-[#7D6AF8] text-white"
                      : "bg-white text-[#3B2416] border border-[#E5E0D5]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-[#E5E0D5] bg-white px-3 py-2 text-sm text-[#3B2416]/60">
                  … je réfléchis
                </div>
              </div>
            )}

            {/* Questions rapides */}
            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-[#7D6AF8]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#7D6AF8] hover:bg-[#7D6AF8]/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-[#E5E0D5] bg-white px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ta question…"
              className="flex-1 rounded-full border border-[#E5E0D5] bg-[#FFF9F2] px-4 py-2 text-sm text-[#3B2416] outline-none focus:border-[#7D6AF8]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Envoyer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7D6AF8] text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
