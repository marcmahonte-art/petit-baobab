"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/app/learn/_components/sidebar";
import { Header } from "@/app/learn/_components/header";
import { MobileBottomNav } from "@/components/child-dashboard";
import { useAuthStore } from "@/lib/auth-store";
import { useProfile } from "@/lib/profile-store";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { MemoryBookRecord } from "@/features/memory-book/types/memory-book.types";
import { BookCard } from "@/features/memory-book/components/common/BookCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Sparkles, Loader2, CheckCircle2, PenLine, Images, Leaf } from "lucide-react";

const memorySteps = [
  "Couverture",
  "Portrait",
  "Année",
  "Camarades",
  "Mots",
  "Livres",
  "Fiertés",
  "Vacances",
  "Photos",
  "Secrets",
];

export default function MemoryBooksListPage() {
  const router = useRouter();
  const { studentSession } = useAuthStore();
  const profile = useProfile();
  const childId = studentSession?.profileId || profile?.id || "default_child";
  const childName = studentSession?.name || profile?.name || "Mon Enfant";

  const [books, setBooks] = useState<MemoryBookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingFast, setIsCreatingFast] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const list = await memoryBookService.listByProfile(childId);
      setBooks(list);
    } catch (e) {
      console.error("Erreur lors du chargement des cahiers de souvenirs:", e);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBooks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBooks]);

  const handleDelete = async (id: string) => {
    await memoryBookService.deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleCreateFastBook = async () => {
    if (isCreatingFast) return;
    try {
      setIsCreatingFast(true);
      const newBook = await memoryBookService.createBook({
        profileId: childId,
        templateId: "cahier_10_pages_marketing_v1",
        title: `Cahier de souvenirs de ${childName}`,
        schoolYear: "2025 - 2026",
      });
      router.push(`/learn/souvenirs/${newBook.id}`);
    } catch (e) {
      console.error("Erreur création rapide:", e);
      setIsCreatingFast(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EDE4] relative overflow-hidden pb-16 lg:pb-24 font-['Quicksand',sans-serif] text-[#3B2416]">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          <div className="relative overflow-hidden rounded-[32px] border border-[#F0E7DA] bg-[#FFF9F2] p-5 shadow-[0_10px_30px_-14px_rgba(59,36,22,0.18)] md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/logo/logo-petit-baobab.svg"
                alt="Petit Baobab"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
              <div>
                <div className="text-sm font-extrabold text-[#3B2416]">Petit Baobab</div>
                <div className="text-xs font-semibold text-[#9c8a76]">Cahier de souvenirs</div>
              </div>
            </div>

            <div className="mb-5 rounded-[24px] border border-[#F0E7DA] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(59,36,22,0.06)]">
              <div className="mb-3 flex items-baseline gap-2 caveat-font text-xl font-bold">
                <span className="text-[#7D6AF8]">1</span>
                <span>/10</span>
                <span className="text-[#9c8a76]">Couverture</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {memorySteps.map((step, index) => (
                  <span
                    key={step}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                      index === 0
                        ? "scale-110 border-[#7D6AF8] bg-[#7D6AF8] text-white"
                        : index < 3
                          ? "border-[#20C997] bg-[#20C997] text-white"
                          : "border-[#F0E7DA] bg-white text-[#9c8a76]"
                    }`}
                    title={step}
                  >
                    {index < 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-[1fr_300px]">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#F0E7DA] bg-white px-3 py-1 text-xs font-extrabold text-[#7A3B1D] shadow-[0_2px_10px_rgba(59,36,22,0.06)]">
                  <Sparkles className="h-3.5 w-3.5 text-[#7D6AF8]" />
                  <span>Modèle officiel 10 pages Petit Baobab</span>
                </div>
                <h1 className="caveat-font mt-3 text-4xl font-bold leading-tight tracking-normal text-[#3B2416] md:text-6xl">
                  Mon cahier de souvenirs
                </h1>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-[#6F604F] md:text-base">
                  Remplis ton cahier interactif à spirale avec tes 10 pages : ton portrait, ton année, tes
                  camarades, tes livres préférés, tes fiertés, tes vacances et tes photos. Tu peux ensuite
                  le visualiser en PDF et l&apos;imprimer pour l&apos;emporter partout.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCreateFastBook}
                    disabled={isCreatingFast}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-[#7D6AF8] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(125,106,248,.55)] transition hover:bg-[#6d59ef] active:scale-95 disabled:opacity-60 md:text-base"
                  >
                    {isCreatingFast ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Ouverture du cahier...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Créer mon cahier de souvenirs</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8a7f66]">
                    <PenLine className="h-4 w-4 text-[#13C6A2]" />
                    <span>Format A4 prêt à imprimer</span>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto hidden w-full max-w-[300px] lg:block">
                <div className="absolute -left-2 top-8 z-10 flex h-[250px] flex-col justify-evenly">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className="h-3 w-3 rounded-full border-2 border-[#3B2416] bg-[#F3EDE4]" />
                  ))}
                </div>
                <div className="relative min-h-[390px] rounded-[28px] border border-[#F0E7DA] bg-white px-8 py-9 text-center shadow-[0_10px_30px_-14px_rgba(59,36,22,0.18)]">
                  <Leaf className="mx-auto h-16 w-16 text-[#20C997]" />
                  <div className="mx-auto my-5 flex max-w-[170px] justify-center gap-1.5">
                    {["#7D6AF8", "#20C997", "#FFD95C", "#FFB300", "#1194FF"].map((color) => (
                      <span key={color} className="h-3 w-3 rotate-45 rounded-[3px]" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="caveat-font text-5xl font-bold leading-none text-[#3B2416]">
                    Cahier de souvenirs
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#9c8a76]">10 pages à compléter</div>
                  <div className="mt-8 grid grid-cols-2 gap-3 text-xs font-extrabold text-[#5B5648]">
                    <span className="rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-3 py-3">Portrait</span>
                    <span className="rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-3 py-3">Année</span>
                    <span className="rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-3 py-3">Photos</span>
                    <span className="rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-3 py-3">Secrets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Liste des cahiers */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="caveat-font text-3xl font-bold text-[#3B2416] flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-[#7D6AF8]" />
                <span>Mes cahiers de souvenirs</span>
              </h2>

              {books.length > 0 && (
                <button
                  type="button"
                  onClick={handleCreateFastBook}
                  disabled={isCreatingFast}
                  className="text-xs md:text-sm font-bold text-[#3B2416] bg-white hover:bg-[#FFF9F2] border border-[#F0E7DA] px-4 py-2 rounded-full transition flex items-center gap-1.5 shadow-[0_2px_10px_rgba(59,36,22,0.06)] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau cahier</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-[#FFF9F2] rounded-[24px] border border-[#F0E7DA] p-12 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(59,36,22,0.06)]">
                <Loader2 className="w-10 h-10 animate-spin text-[#7D6AF8] mb-3" />
                <p className="font-bold text-[#5B5648] text-sm">Chargement de tes cahiers...</p>
              </div>
            ) : books.length === 0 ? (
              /* État vide invitant */
              <div className="bg-[#FFF9F2] rounded-[28px] border border-dashed border-[#C9BFA9] p-8 md:p-14 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-[0_10px_30px_-14px_rgba(59,36,22,0.18)]">
                <div className="w-20 h-20 rounded-full bg-white border border-[#F0E7DA] text-[#7D6AF8] flex items-center justify-center mb-4 shadow-sm">
                  <Images className="w-10 h-10" />
                </div>
                <h3 className="caveat-font text-3xl font-bold text-[#7A3B1D] mb-2">
                  Tu n’as pas encore créé de cahier de souvenirs !
                </h3>
                <p className="text-sm text-[#5B5648] font-semibold max-w-md mb-6 leading-relaxed">
                  Immortalise ton année scolaire, tes meilleurs moments, tes copains et tes photos dans ton album interactif.
                </p>
                <button
                  type="button"
                  onClick={handleCreateFastBook}
                  disabled={isCreatingFast}
                  className="px-6 py-3 rounded-full bg-[#7D6AF8] hover:bg-[#6d59ef] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Démarrer mon premier cahier</span>
                </button>
              </div>
            ) : (
              /* Grille des cahiers existants */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav homeHref="/learn/dashboard" />

      {/* Decorative Grassy Footer Background */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 hidden lg:block select-none pointer-events-none">
        <Image
          src="/illustrations/footer_bas.webp"
          alt="Grass Footer"
          width={1920}
          height={346}
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}
