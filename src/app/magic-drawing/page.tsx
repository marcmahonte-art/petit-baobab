"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  BookOpen,
  Printer,
  ChevronRight,
  Menu,
  Sparkles,
  Check,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCreditStore, getCreditCost, canGenerate, type StyleType } from "@/lib/credit-store";
import { useProfileStore } from "@/lib/profile-store";
import { useAuthStore } from "@/lib/auth-store";
import { drawingService } from "@/features/drawings/DrawingService";
import { useI18n } from "@/lib/i18n-provider";
import { storageService, base64ToBlob } from "@/lib/storageService";

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
/* ================================================================== */
/* PAGE COMPONENT                                                      */
/* ================================================================== */
export default function MagicDrawingPage() {
  const [prompt, setPrompt] = useState("");
  const credits = useCreditStore();
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(credits.plan === "free" ? "contour_simple" : "noir_blanc");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [lastDrawingId, setLastDrawingId] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [bookMessage, setBookMessage] = useState("");
  const [isAddingToBook, setIsAddingToBook] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyDrawings, setHistoryDrawings] = useState<any[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStyle, setPendingStyle] = useState<StyleType | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileName, setProfileName] = useState("Awa");
  const [profileAge, setProfileAge] = useState("6 ans");
  const [profileMascot, setProfileMascot] = useState("awa");
  const maxChars = 200;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryPrompt = params.get("prompt");
      if (queryPrompt) {
        setPrompt(queryPrompt);
      }
    }
  }, []);

  const { t } = useI18n();
  const creditInfo = credits.useCredits();
  const { account } = useAuthStore();
  const starsBalance = account?.stars_balance ?? 0;
  const { profiles, activeProfileId: currentProfileId, switchProfile } = useProfileStore();
  const router = useRouter();

  const getAvatarSrc = (mascot: string) => {
    if (mascot === "lion") return "/illustrations/lion.webp";
    if (mascot === "robot") return "/illustrations/robot.webp";
    return "/illustrations/awa.webp";
  };

  useEffect(() => {
    const active = profiles.find((p) => p.id === currentProfileId);
    if (active) {
      setProfileName(active.name);
      setProfileMascot(active.mascot);
    }
  }, [currentProfileId, profiles]);

  useEffect(() => {
    const handleOutsideClick = () => setShowProfileDropdown(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleGenerate = async (confirmed = false) => {
    if (!prompt.trim() || isGenerating || isOnCooldown) return;

    const cost = getCreditCost(selectedStyle);
    if (cost >= 3 && !confirmed) {
      setPendingStyle(selectedStyle);
      setShowConfirmDialog(true);
      return;
    }

    setShowConfirmDialog(false);
    setPendingStyle(null);

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
          profileId: currentProfileId || "anonymous",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        credits.refund(selectedStyle);
        throw new Error(data?.message || data?.error || "Impossible de créer le dessin.");
      }

      // Update real-time stars balance in store
      if (data.newBalance !== undefined) {
        useAuthStore.getState().setStarsBalance(data.newBalance);
      }

      const returnedImage = data.imageUrl;
      let imageUrl = returnedImage;
      let thumbnailUrl = returnedImage;
      const drawingId = data.drawingId || `magic-${Date.now()}`;

      // If returned image is a base64 string, upload it. Otherwise it is already uploaded by the backend.
      if (currentProfileId && returnedImage && returnedImage.startsWith("data:")) {
        try {
          const imageBlob = base64ToBlob(returnedImage);
          imageUrl = await storageService.uploadDrawingImage(
            imageBlob,
            currentProfileId,
            drawingId,
            "ai"
          );

          const thumbBlob = await storageService.generateThumbnail(imageBlob, 280);
          thumbnailUrl = await storageService.uploadThumbnail(
            thumbBlob,
            currentProfileId,
            drawingId,
            "ai"
          );
        } catch (uploadError) {
          console.error("Failed to upload generated drawing to Supabase Storage, using fallback base64 URL:", uploadError);
        }
      }

      setGeneratedImage(imageUrl);
      setLastDrawingId(drawingId);
      setHasResult(true);

      if (currentProfileId) {
        try {
          await drawingService.saveIA({
            name: prompt.slice(0, 60),
            category: "Mes dessins",
            origin: "ia",
            profileId: currentProfileId,
            image: imageUrl,
            thumbnail: thumbnailUrl,
            template: {
              id: drawingId,
              name: prompt.slice(0, 60),
              image: imageUrl,
            },
            state: {
              canvasJson: "",
              selectedTool: "brush",
              selectedColor: "#FFD95C",
              brushSize: 6,
              usedColors: [],
              filledZones: 0,
            },
          });
        } catch (saveError) {
          console.error("Auto-save failed:", saveError);
        }
      }
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création."
      );
      setHasResult(false);
    } finally {
      setIsGenerating(false);
      setIsOnCooldown(true);
      setTimeout(() => setIsOnCooldown(false), 2000);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  const handleDownload = async () => {
    if (!generatedImage || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const response = await fetch(generatedImage);

      if (!response.ok) throw new Error("Impossible de télécharger l'image.");

      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();

      let blob: Blob;

      if (reader && total > 0) {
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          setDownloadProgress(Math.min(Math.round((received / total) * 45), 45));
        }

        const combined = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        blob = new Blob([combined.buffer], { type: "image/png" });
      } else {
        blob = await response.blob();
        setDownloadProgress(45);
      }

      setDownloadProgress(50);

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Impossible de charger l'image."));
        img.src = URL.createObjectURL(blob);
      });

      setDownloadProgress(65);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      setDownloadProgress(80);

      canvas.toBlob(
        (jpegBlob) => {
          if (jpegBlob) {
            const url = URL.createObjectURL(jpegBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `dessin-magique-petit-baobab.jpg`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          }
          URL.revokeObjectURL(img.src);
          setDownloadProgress(100);
          setTimeout(() => setIsDownloading(false), 1200);
        },
        "image/jpeg",
        0.88
      );
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
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
          imageUrl: generatedImage,
          idea: prompt,
          style: selectedStyle,
          drawingId: lastDrawingId,
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
                <Sparkles className="w-7 h-7 text-[#6D4CFF]" />
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
                    {starsBalance}
                  </span>
                  <span className="text-[10px] font-semibold text-[#7A6A5E]">
                    Mes étoiles
                  </span>
                </div>
              </div>

              {/* History button */}
              <button
                  onClick={async () => {
                  const list = await drawingService.list()
                  const iaDrawings = list.filter((d) => d.origin === "ia")
                  if (iaDrawings.length === 0) {
                    setGenerationError("Aucun dessin magique dans l'historique.")
                    setTimeout(() => setGenerationError(""), 3000)
                    return
                  }
                  setHistoryDrawings(iaDrawings)
                  setIsHistoryOpen(true)
                }}
                className="flex items-center gap-2 h-[48px] px-5 rounded-full border border-[#EFE7DB] bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Clock className="w-5 h-5 text-[#7A6A5E]" />
                <span className="text-sm font-bold text-[#3B2416]">
                  Historique
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="flex items-center gap-2 h-[56px] rounded-full border border-[#EFE7DB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getAvatarSrc(profileMascot)} />
                    <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-sm font-bold text-[#3B2416]">{profileName}</span>
                    <span className="text-[10px] font-bold text-[#7A6A5E] mt-0.5">{profileAge}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#7A6A5E] ml-1 shrink-0" />
                </div>

                {showProfileDropdown && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-16 z-50 w-64 bg-white rounded-2xl border border-[#EFE7DB] shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center gap-3 border-b border-[#F0E7DA] pb-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={getAvatarSrc(profileMascot)} />
                        <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-[#3B2416]">{profileName}</span>
                        <span className="text-[11px] font-bold text-[#7A6A5E]">{profileAge}</span>
                      </div>
                    </div>

                    {profiles.length > 1 && (
                      <div className="mb-3">
                        <span className="text-[10px] font-black text-[#7A6A5E] uppercase tracking-wider block mb-1.5">
                          Changer de profil
                        </span>
                        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                          {profiles.map((p) => {
                            if (p.id === currentProfileId) return null;
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  switchProfile(p.id);
                                  setShowProfileDropdown(false);
                                }}
                                className="flex items-center gap-2 p-1.5 hover:bg-[#FFF9F2] rounded-xl cursor-pointer transition-colors"
                              >
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={getAvatarSrc(p.mascot)} />
                                  <AvatarFallback>{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold text-[#3B2416]">{p.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 pt-1 border-t border-[#F0E7DA]/50">
                      <Link
                        href="/parametres"
                        onClick={() => setShowProfileDropdown(false)}
                        className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
                      >
                        ⚙️ Paramètres
                      </Link>
                      <Link
                        href="/parents"
                        onClick={() => setShowProfileDropdown(false)}
                        className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
                      >
                        👨‍👩‍👧 Espace Parents
                      </Link>
                    </div>
                  </div>
                )}
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
                    aria-label="Menu de navigation"
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
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6D4CFF] text-white text-sm font-extrabold shrink-0">
                    1
                  </span>
                  <h2 className="text-lg font-extrabold text-[#2D1846]">
                    Décris ton dessin
                  </h2>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full h-[120px] p-4 border border-[#EFE7DB] rounded-[18px] bg-[#FAFAF8] text-[15px] font-medium text-[#3B2416] placeholder-[#7A6A5E]/50 focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/30 focus:border-[#6D4CFF] resize-none transition-all"
                    placeholder="Exemple : Une petite fille en Faso Danfani jouant du balafon dans un village africain..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    maxLength={maxChars}
                  />
                  <span className="absolute bottom-3 right-4 text-xs font-semibold text-[#7A6A5E]/60">
                    {prompt.length}/{maxChars}
                  </span>
                </div>

                {/* Suggestion chips */}
                <div className="suggestions-scroll flex items-center gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s.label)}
                      className="flex items-center gap-2 h-[40px] px-3 rounded-full border border-[#EFE7DB] bg-[#FAFAF8] hover:bg-[#F3EFFF] hover:border-[#6D4CFF]/30 transition-all cursor-pointer shrink-0 group"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#FFF5CC] flex items-center justify-center shrink-0">
                        <Image
                          src={s.image}
                          alt=""
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#3B2416] whitespace-nowrap group-hover:text-[#6D4CFF] transition-colors">
                        {s.label}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const el = document.querySelector(".suggestions-scroll");
                      if (el) el.scrollBy({ left: 200, behavior: "smooth" });
                    }}
                    className="w-8 h-8 rounded-full border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#7A6A5E]" />
                  </button>
                </div>
              </div>

              {/* ── STEP 2: Choisis le style ── */}
              <div className="bg-white rounded-[24px] border border-[#EFE7DB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6D4CFF] text-white text-sm font-extrabold shrink-0">
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
                            ? "border-[#6D4CFF] bg-[#F3EFFF] shadow-[0_0_0_3px_rgba(124,87,255,0.15)] cursor-pointer"
                            : "border-[#EFE7DB] bg-white hover:border-[#6D4CFF]/30 hover:bg-[#FAFAF8] cursor-pointer"
                        }`}
                      >
                        {isSelected && !isLocked && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#6D4CFF] flex items-center justify-center">
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
                          {cost} étoile{cost > 1 ? "s" : ""}
                        </span>
                        {isLocked && (
                          <span className="text-[9px] font-semibold text-[#6D4CFF]">
                            Premium · {cost} étoiles
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
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6D4CFF] text-white text-sm font-extrabold shrink-0">
                    3
                  </span>
                  <h2 className="text-lg font-extrabold text-[#2D1846]">
                    Créer le dessin
                  </h2>
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || isOnCooldown}
                  className={`w-full h-[60px] rounded-[18px] font-extrabold text-[16px] text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isGenerating
                      ? "bg-[#6D4CFF]/60 cursor-wait"
                      : "bg-[#6D4CFF] hover:bg-[#5A3EE0] hover:shadow-lg hover:shadow-[#6D4CFF]/25 active:scale-[0.98]"
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
                  Coût : {getCreditCost(selectedStyle)} étoile{getCreditCost(selectedStyle) > 1 ? "s" : ""}
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
                    <Sparkles className="w-5 h-5 text-[#6D4CFF]" />
                    Résultat généré
                  </h2>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FFF0F3] transition-colors cursor-pointer"
                    aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
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
                    <button
                      onClick={() => setShowLightbox(true)}
                      className="w-full h-full relative cursor-pointer"
                      aria-label="Voir en plein écran"
                    >
                      <Image
                        src={generatedImage}
                        alt="Résultat généré"
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-[#F3EFFF] flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-[#6D4CFF]/40" />
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
                      disabled={isDownloading}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#6D4CFF]/20 transition-all cursor-pointer group disabled:cursor-wait disabled:opacity-70"
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-9 h-9 rounded-[10px] bg-[#E8F5E9] flex items-center justify-center relative">
                            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="16" fill="none" stroke="#25C76F" strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 16}`}
                                strokeDashoffset={`${2 * Math.PI * 16 * (1 - downloadProgress / 100)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[8px] font-black text-[#25C76F]">
                              {downloadProgress}%
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#3B2416] text-center leading-tight">
                            Compression...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-[10px] bg-[#E8F5E9] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download className="w-4.5 h-4.5 text-[#25C76F]" />
                          </div>
                          <span className="text-[10px] font-bold text-[#3B2416] text-center leading-tight">
                            Télécharger JPG
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleAddToBook}
                      disabled={isAddingToBook}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#6D4CFF]/20 transition-all cursor-pointer group disabled:cursor-wait disabled:opacity-70"
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
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] border border-[#EFE7DB] bg-white hover:bg-[#F3EFFF] hover:border-[#6D4CFF]/20 transition-all cursor-pointer group"
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
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <p className="text-xs font-bold text-[#25C76F]">
                      {bookMessage}
                    </p>
                    <Link
                      href="/mes-livres"
                      className="text-xs font-bold text-[#6D4CFF] underline hover:no-underline"
                    >
                      Voir mon livre →
                    </Link>
                  </div>
                )}
              </div>

              {/* Variantes section removed — will be re-added with real generation */}
            </div>
          </div>

          {/* Lightbox */}
          {showLightbox && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setShowLightbox(false)}
            >
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl font-bold hover:bg-white/30 cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
              <div className="relative w-full max-w-3xl aspect-[4/3]">
                <Image
                  src={generatedImage}
                  alt="Résultat généré"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Confirm dialog for expensive generations */}
          {showConfirmDialog && pendingStyle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
              <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-xl border border-[#EFE7DB]">
                <h3 className="text-lg font-extrabold text-[#2D1846] text-center mb-2">
                  Génération coûteuse
                </h3>
                <p className="text-sm text-[#7A6A5E] text-center mb-6">
                  Ce style coûte <strong className="text-[#FF8C42]">{getCreditCost(pendingStyle)} étoiles</strong>. Veux-tu continuer ?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setPendingStyle(null);
                    }}
                    className="flex-1 h-12 rounded-full border border-[#EFE7DB] text-[#7A6A5E] font-bold text-sm hover:bg-neutral-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleGenerate(true)}
                    className="flex-1 h-12 rounded-full bg-[#FF8C42] text-white font-bold text-sm hover:bg-[#FF7A2C] cursor-pointer"
                  >
                    Oui, générer
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />

      {/* History sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0 bg-[#FFF9F2]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-[#EFE7DB]">
              <h2 className="text-lg font-extrabold text-[#2D1846] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6D4CFF]" />
                Historique
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {historyDrawings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm font-bold text-[#7A6A5E]">
                    Aucun dessin dans l'historique
                  </p>
                  <p className="text-xs text-[#7A6A5E]/60 mt-1">
                    Génère tes premiers dessins magiques !
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {historyDrawings.map((drawing, i) => (
                    <div
                      key={drawing.id ?? i}
                      className="aspect-square rounded-[14px] overflow-hidden border border-[#EFE7DB] bg-white hover:border-[#6D4CFF]/40 cursor-pointer transition-all hover:shadow-md"
                    >
                      <Image
                        src={drawing.image || drawing.thumbnail || "/placeholder.svg"}
                        alt={`Dessin ${i + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
