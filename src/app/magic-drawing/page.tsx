"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Star,
  Clock,
  ChevronDown,
  Heart,
  Download,
  FileText,
  BookOpen,
  Printer,
  ChevronRight,
  Menu,
  Sparkles,
  Check,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { useCreditStore, getCreditCost, canGenerate, type StyleType } from "@/lib/credit-store";
import { useProfileStore, getActiveProfile } from "@/lib/profile-store";
import { drawingService } from "@/features/drawings/DrawingService";
import { useI18n } from "@/lib/i18n-provider";

/* ------------------------------------------------------------------ */
/* Suggestion chips data                                               */
/* ------------------------------------------------------------------ */
const suggestions = [
  {
    image: "/illustrations/animals/elephant.svg",
    label: "Un éléphant dans la savane",
  },
  {
    image: "/illustrations/village-case-girafe.webp",
    label: "Une maison africaine",
  },
  {
    image: "/illustrations/animals/lion.svg",
    label: "Un lion courageux",
  },
  {
    image: "/illustrations/coloring-balafon.png",
    label: "Un marché africain",
  },
];

/* ------------------------------------------------------------------ */
/* Style cards data                                                    */
/* ------------------------------------------------------------------ */
const styleOptions: { id: StyleType; label: string; image: string; selected: boolean }[] = [
  {
    id: "noir_blanc",
    label: "Coloriage\n(Noir & Blanc)",
    image: "/illustrations/animals/lion.svg",
    selected: true,
  },
  {
    id: "contour_simple",
    label: "Contour simple",
    image: "/illustrations/animals/tortue.svg",
    selected: false,
  },
  {
    id: "dessin_detaille",
    label: "Dessin détaillé",
    image: "/illustrations/animals/girafe.svg",
    selected: false,
  },
  {
    id: "version_couleur",
    label: "Version couleur",
    image: "/illustrations/lion.webp",
    selected: false,
  },
];

/* ------------------------------------------------------------------ */
/* Variante thumbnails (mock using existing assets)                     */
/* ------------------------------------------------------------------ */
const varianteImages = [
  "/illustrations/animals/girafe.svg",
  "/illustrations/village-case-girafe.webp",
  "/illustrations/animals/elephant.svg",
  "/illustrations/coloring-baobab.png",
];

/* ================================================================== */
/* PAGE COMPONENT                                                      */
/* ================================================================== */
export default function MagicDrawingPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("noir_blanc");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [bookMessage, setBookMessage] = useState("");
  const [isAddingToBook, setIsAddingToBook] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const maxChars = 200;

  const credits = useCreditStore();
  const profileId = useProfileStore((s) => s.activeProfileId);
  const { t } = useI18n();
  const creditInfo = credits.useCredits();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const check = canGenerate(selectedStyle);
    if (!check.allowed) {
      setGenerationError(check.reason || "Impossible de créer le dessin.");
      return;
    }

    const consumeResult = credits.consume(selectedStyle);
    if (!consumeResult.success) {
      setGenerationError(consumeResult.reason || "Impossible de créer le dessin.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");
    setBookMessage("");
    try {
      const response = await fetch("/api/magic-drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: prompt,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        credits.refund(selectedStyle);
        throw new Error(data?.error || "Impossible de créer le dessin.");
      }

      setGeneratedImage(data.imageUrl);
      setHasResult(true);

      if (profileId) {
        try {
          await drawingService.saveIA(
            {
              name: prompt.slice(0, 60),
              category: "Mes dessins",
              origin: "ia",
              profileId,
              image: data.imageUrl,
              thumbnail: data.imageUrl,
              template: {
                id: `magic-${Date.now()}`,
                name: prompt.slice(0, 60),
                image: data.imageUrl,
              },
              state: {
                canvasJson: "",
                selectedTool: "brush",
                selectedColor: "#FFD95C",
                brushSize: 6,
                usedColors: [],
                filledZones: 0,
              },
            },
            profileId,
          );
        } catch (saveError) {
          console.error("Auto-save failed:", saveError);
        }
      }
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le dessin pour le moment."
      );
      setHasResult(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "dessin-magique-petit-baobab.png";
    link.click();
  };

  const handlePrint = () => {
    if (!generatedImage) return;

    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      setGenerationError("Autorise les pop-ups pour imprimer ton dessin.");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Dessin magique Petit Baobab</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: white;
            }
            img {
              display: block;
              width: 100%;
              max-width: 180mm;
              max-height: 265mm;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${generatedImage}" alt="Dessin magique Petit Baobab" />
          <script>
            const image = document.querySelector("img");
            image.onload = () => {
              window.focus();
              window.print();
              window.close();
            };
            image.onerror = () => window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddToBook = async () => {
    if (!generatedImage || isAddingToBook) return;

    setIsAddingToBook(true);
    setBookMessage("");

    try {
      const response = await fetch("/api/magic-drawing/book/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo-user",
          imageUrl: generatedImage,
          idea: prompt,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Impossible d'ajouter au livre.");
      }

      setBookMessage(`Ajouté au livre (${data.totalPages} page${data.totalPages > 1 ? "s" : ""})`);
    } catch (error) {
      setBookMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter au livre."
      );
    } finally {
      setIsAddingToBook(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-0">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        {/* ============ SIDEBAR (desktop) ============ */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          {/* ---------- TOP HEADER BAR ---------- */}
          <header className="h-[72px] flex items-center justify-between gap-4 select-none">
            {/* Page Title */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-[#7C57FF]" />
                <h1 className="text-2xl md:text-[28px] font-extrabold text-[#2D1846] leading-tight">
                  Dessin Magique
                </h1>
              </div>
              <p className="text-sm md:text-[15px] font-medium text-[#7A6A5E] ml-9">
                Décris ce que tu imagines et Petit Baobab crée un dessin à
                colorier rien que pour toi !
              </p>
            </div>

            {/* Right: Stars + Credits + History + Avatar */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Stars badge */}
              <div className="flex items-center gap-2 h-[48px] px-4 rounded-full bg-[#FFF5CC] border border-[#FFE08A]">
                <Star className="w-5 h-5 text-[#FFB300] fill-[#FFB300]" />
                <div className="flex flex-col leading-none">
                  <span className="text-[17px] font-extrabold text-[#3B2416]">
                    125
                  </span>
                  <span className="text-[10px] font-semibold text-[#7A6A5E]">
                    Mes étoiles
                  </span>
                </div>
              </div>

              {/* Credits badge */}
              <div className="flex items-center gap-2 h-[48px] px-4 rounded-full bg-[#F3EFFF] border border-[#D4C8FF]">
                <Sparkles className="w-5 h-5 text-[#7C57FF]" />
                <div className="flex flex-col leading-none">
                  <span className="text-[17px] font-extrabold text-[#3B2416]">
                    {creditInfo.remaining}
                  </span>
                  <span className="text-[10px] font-semibold text-[#7A6A5E]">
                    Crédits
                  </span>
                </div>
              </div>

              {/* History button */}
              <button className="flex items-center gap-2 h-[48px] px-5 rounded-full border border-[#EFE7DB] bg-white hover:bg-neutral-50 transition-colors cursor-pointer">
                <Clock className="w-5 h-5 text-[#7A6A5E]" />
                <span className="text-sm font-bold text-[#3B2416]">
                  Historique
                </span>
              </button>

              {/* Avatar */}
              <div className="flex items-center gap-2 h-[56px] rounded-full border border-[#EFE7DB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=child" />
                  <AvatarFallback>AW</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-[#7A6A5E]" />
              </div>
            </div>

            {/* Mobile menu */}
            <div className="flex md:hidden items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-[#7A6A5E]"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-4 w-[280px]">
                  <Sidebar />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {/* ---------- TWO-COLUMN LAYOUT: Wizard + Result ---------- */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
            {/* ====== LEFT: 3-Step Wizard ====== */}
            <div className="flex flex-col gap-5">
              {/* ── STEP 1: Décris ton dessin ── */}
              <div className="bg-white rounded-[24px] border border-[#EFE7DB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7C57FF] text-white text-sm font-extrabold shrink-0">
                    1
                  </span>
                  <h2 className="text-lg font-extrabold text-[#2D1846]">
                    Décris ton dessin
                  </h2>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full h-[120px] p-4 border border-[#EFE7DB] rounded-[18px] bg-[#FAFAF8] text-[15px] font-medium text-[#3B2416] placeholder-[#7A6A5E]/50 focus:outline-none focus:ring-2 focus:ring-[#7C57FF]/30 focus:border-[#7C57FF] resize-none transition-all"
                    placeholder="Exemple : Une petite fille en Faso Danfani jouant du balafon dans un village africain..."
                    value={prompt}
                    onChange={(e) =>
                      setPrompt(e.target.value.slice(0, maxChars))
                    }
                    maxLength={maxChars}
                  />
                  <span className="absolute bottom-3 right-4 text-xs font-semibold text-[#7A6A5E]/60">
                    {prompt.length}/{maxChars}
                  </span>
                </div>

                {/* Suggestion chips */}
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s.label)}
                      className="flex items-center gap-2 h-[40px] px-3 rounded-full border border-[#EFE7DB] bg-[#FAFAF8] hover:bg-[#F3EFFF] hover:border-[#7C57FF]/30 transition-all cursor-pointer shrink-0 group"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#FFF5CC] flex items-center justify-center shrink-0">
                        <Image
                          src={s.image}
                          alt={s.label}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#3B2416] whitespace-nowrap group-hover:text-[#7C57FF] transition-colors">
                        {s.label}
                      </span>
                    </button>
                  ))}
                  <button className="w-8 h-8 rounded-full border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] flex items-center justify-center shrink-0 cursor-pointer transition-colors">
                    <ChevronRight className="w-4 h-4 text-[#7A6A5E]" />
                  </button>
                </div>
              </div>

              {/* ── STEP 2: Choisis le style ── */}
              <div className="bg-white rounded-[24px] border border-[#EFE7DB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7C57FF] text-white text-sm font-extrabold shrink-0">
                    2
                  </span>
                  <h2 className="text-lg font-extrabold text-[#2D1846]">
                    Choisis le style du dessin
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {styleOptions.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    const cost = getCreditCost(style.id);
                    const isLocked = credits.plan === "free" && style.id !== "contour_simple";
                    return (
                      <button
                        key={style.id}
                        onClick={() => {
                          if (!isLocked) setSelectedStyle(style.id);
                        }}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-[18px] border-2 transition-all group ${
                          isLocked
                            ? "border-[#EFE7DB] bg-white opacity-55 cursor-not-allowed"
                            : isSelected
                            ? "border-[#7C57FF] bg-[#F3EFFF] shadow-[0_0_0_3px_rgba(124,87,255,0.15)] cursor-pointer"
                            : "border-[#EFE7DB] bg-white hover:border-[#7C57FF]/30 hover:bg-[#FAFAF8] cursor-pointer"
                        }`}
                      >
                        {isSelected && !isLocked && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C57FF] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isLocked && (
                          <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#7A6A5E]/60 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="w-[80px] h-[80px] rounded-[12px] overflow-hidden bg-[#F9F7F4] flex items-center justify-center">
                          <Image
                            src={style.image}
                            alt={style.label}
                            width={80}
                            height={80}
                            className={`w-full h-full object-contain ${
                              style.id !== "version_couleur"
                                ? "grayscale opacity-80"
                                : ""
                            }`}
                          />
                        </div>
                        <span className="text-xs font-bold text-center text-[#3B2416] whitespace-pre-line leading-tight">
                          {style.label}
                        </span>
                        <span className="text-[10px] font-semibold text-[#7A6A5E]">
                          {cost} crédit{cost > 1 ? "s" : ""}
                        </span>
                        {isLocked && (
                          <span className="text-[9px] font-semibold text-[#7C57FF]">
                            Réservé aux abonnés
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── STEP 3: Créer le dessin ── */}
              <div className="bg-white rounded-[24px] border border-[#EFE7DB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7C57FF] text-white text-sm font-extrabold shrink-0">
                    3
                  </span>
                  <h2 className="text-lg font-extrabold text-[#2D1846]">
                    Créer le dessin
                  </h2>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full h-[60px] rounded-[18px] font-extrabold text-[16px] text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isGenerating
                      ? "bg-[#7C57FF]/60 cursor-wait"
                      : "bg-[#7C57FF] hover:bg-[#6A45E8] hover:shadow-lg hover:shadow-[#7C57FF]/25 active:scale-[0.98]"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          fill="currentColor"
                          className="opacity-75"
                        />
                      </svg>
                      La magie opère...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Créer mon dessin magique
                    </>
                  )}
                </button>
                {generationError && (
                  <p className="text-center text-xs font-bold text-[#D43C3C] mt-3">
                    {generationError}
                  </p>
                )}
                <p className="text-center text-xs font-semibold text-[#7A6A5E] mt-2">
                  Coût : {getCreditCost(selectedStyle)} crédit{getCreditCost(selectedStyle) > 1 ? "s" : ""}
                </p>
              </div>

              {/* ── Safety banner ── */}
              <div className="flex items-center gap-3 bg-[#F0FFF4] border border-[#25C76F]/20 rounded-[18px] px-5 py-3.5">
                <div className="w-7 h-7 rounded-full bg-[#25C76F] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#25C76F]">
                    Contenu sûr et adapté aux enfants
                  </p>
                  <p className="text-xs font-medium text-[#3B2416]/60 mt-0.5">
                    Toutes les images sont filtrées et adaptées aux enfants de 3
                    à 7 ans.
                  </p>
                </div>
                <div className="ml-auto hidden sm:block">
                  <Image
                    src="/illustrations/awa.webp"
                    alt="Awa"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* ====== RIGHT: Result Panel ====== */}
            <div className="flex flex-col gap-5">
              {/* ── Result Card ── */}
              <div className="bg-white rounded-[24px] border border-[#EFE7DB] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold text-[#2D1846] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#7C57FF]" />
                    Résultat généré
                  </h2>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FFF0F3] transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isFavorite
                          ? "text-[#FF5E83] fill-[#FF5E83]"
                          : "text-[#FF5E83]"
                      }`}
                    />
                  </button>
                </div>

                {/* Preview area */}
                <div className="w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-[#F9F7F4] border border-[#EFE7DB]/60 flex items-center justify-center relative">
                  {hasResult ? (
                    <Image
                      src={generatedImage}
                      alt="Résultat généré"
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-[#F3EFFF] flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-[#7C57FF]/40" />
                      </div>
                      <p className="text-sm font-bold text-[#7A6A5E]">
                        Ton dessin apparaîtra ici
                      </p>
                      <p className="text-xs text-[#7A6A5E]/60">
                        Décris ce que tu veux et clique sur le bouton magique !
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {hasResult && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <button
                      onClick={handleDownload}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#7C57FF]/20 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-[#E8F5E9] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="w-4.5 h-4.5 text-[#25C76F]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#3B2416] text-center leading-tight">
                        Télécharger PNG
                      </span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#7C57FF]/20 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-[#FFF0E6] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-4.5 h-4.5 text-[#FF8C42]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#3B2416] text-center leading-tight">
                        Télécharger PDF
                      </span>
                    </button>

                    <button
                      onClick={handleAddToBook}
                      disabled={isAddingToBook}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#7C57FF]/20 transition-all cursor-pointer group disabled:cursor-wait disabled:opacity-70"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-[#FFF5CC] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4.5 h-4.5 text-[#FFB300]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#3B2416] text-center leading-tight">
                        {isAddingToBook ? "Ajout..." : "Ajouter à mon livre"}
                      </span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#7C57FF]/20 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-[10px] bg-[#E8F0FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Printer className="w-4.5 h-4.5 text-[#1194FF]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#3B2416] text-center leading-tight">
                        Imprimer
                      </span>
                    </button>
                  </div>
                )}
                {bookMessage && (
                  <p className="text-center text-xs font-bold text-[#25C76F] mt-3">
                    {bookMessage}
                  </p>
                )}
              </div>

              {/* ── Variantes Card ── */}
              {hasResult && (
                <div className="bg-white rounded-[24px] border border-[#EFE7DB] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-extrabold text-[#2D1846]">
                      Variantes
                    </h3>
                    <button className="text-xs font-bold text-[#7C57FF] hover:underline cursor-pointer px-3 py-1 rounded-full border border-[#7C57FF]/20 hover:bg-[#F3EFFF] transition-all">
                      Voir tout
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {varianteImages.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-[14px] overflow-hidden border border-[#EFE7DB] hover:border-[#7C57FF]/40 cursor-pointer transition-all hover:shadow-md hover:scale-[1.03] relative bg-[#F9F7F4]"
                      >
                        <Image
                          src={img}
                          alt={`Variante ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
