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
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Sparkles, Loader2, Printer, Camera } from "lucide-react";

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
    loadBooks();
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
    <div className="min-h-screen bg-[#EFE6D2] relative overflow-hidden pb-16 lg:pb-24 font-['Quicksand',sans-serif]">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          {/* Bannière d'accueil avec style Cahier Papier */}
          <div className="relative rounded-[28px] bg-[#FBF6EC] border-[2.5px] border-[#3A362E] text-[#3A362E] p-6 md:p-10 shadow-lg overflow-hidden">
            {/* Décoration appareil photo & soleil */}
            <div className="absolute top-4 right-6 opacity-30 pointer-events-none hidden md:block">
              <Camera className="w-32 h-32 text-[#7A3B1D]" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#3A362E] text-[#7A3B1D] font-extrabold text-xs mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
                <span>Modèle Officiel 10 Pages — Petit Baobab</span>
              </div>
              <h1 className="caveat-font text-3xl md:text-5xl font-bold tracking-tight text-[#7A3B1D] leading-tight">
                Mon cahier de souvenirs 🌳
              </h1>
              <p className="text-sm md:text-base text-[#5B5648] font-semibold mt-2 leading-relaxed">
                Remplis ton cahier interactif à spirale avec tes 10 pages : ton portrait, ton année, tes
                camarades, tes livres préférés, tes fiertés, tes vacances et tes photos.
                Tu peux ensuite le visualiser en PDF et l&apos;imprimer pour l&apos;emporter partout !
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateFastBook}
                  disabled={isCreatingFast}
                  className="px-6 py-3.5 rounded-2xl bg-[#F7941D] hover:bg-[#e08213] border-2 border-[#3A362E] text-white font-extrabold text-sm md:text-base shadow-md transition active:scale-95 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isCreatingFast ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Ouverture du cahier...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Créer mon cahier de souvenirs (10 pages)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section Liste des cahiers */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="caveat-font text-3xl font-bold text-[#7A3B1D] flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-[#F7941D]" />
                <span>Mes Cahiers de Souvenirs</span>
              </h2>

              {books.length > 0 && (
                <button
                  type="button"
                  onClick={handleCreateFastBook}
                  disabled={isCreatingFast}
                  className="text-xs md:text-sm font-bold text-[#3A362E] bg-white hover:bg-[#F3EBDA] border border-[#3A362E] px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau cahier</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-[#FBF6EC] rounded-[24px] border-2 border-[#3A362E] p-12 flex flex-col items-center justify-center text-center shadow-xs">
                <Loader2 className="w-10 h-10 animate-spin text-[#F7941D] mb-3" />
                <p className="font-bold text-[#5B5648] text-sm">Chargement de tes cahiers...</p>
              </div>
            ) : books.length === 0 ? (
              /* État vide invitant */
              <div className="bg-[#FBF6EC] rounded-[28px] border-2 border-dashed border-[#C9BFA9] p-8 md:p-14 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-[#3A362E] text-[#7A3B1D] flex items-center justify-center mb-4 shadow-sm">
                  <BookOpen className="w-10 h-10" />
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
                  className="px-6 py-3 rounded-2xl bg-[#F7941D] hover:bg-[#e08213] border-2 border-[#3A362E] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Démarrer mon premier cahier (10 pages)</span>
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
