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
import { BookOpen, Plus, Sparkles, Loader2, HeartHandshake } from "lucide-react";

export default function MemoryBooksListPage() {
  const { studentSession } = useAuthStore();
  const profile = useProfile();
  const childId = studentSession?.profileId || profile?.id || "default_child";

  const [books, setBooks] = useState<MemoryBookRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          {/* Bannière d'accueil de la section Souvenirs */}
          <div className="relative rounded-[28px] md:rounded-[36px] bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white p-6 md:p-10 shadow-xl overflow-hidden">
            {/* Décorations d'arrière-plan */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-amber-300 font-extrabold text-xs mb-3 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nouveauté — Mon Cahier de Souvenirs</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                Garde pour toujours tes plus beaux moments ! 🌳
              </h1>
              <p className="text-sm md:text-base text-purple-100 font-medium mt-2 leading-relaxed">
                Crée ton grand cahier de souvenirs d’école : ajoute tes photos, tes copains, tes victoires
                et tes rêves, puis télécharge-le en PDF pour l’imprimer et le garder toute ta vie.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/learn/souvenirs/nouveau"
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm md:text-base shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Créer mon cahier de souvenirs</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section Liste des cahiers */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <span>Mes Cahiers de Souvenirs</span>
              </h2>

              {books.length > 0 && (
                <Link
                  href="/learn/souvenirs/nouveau"
                  className="text-xs md:text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-100/70 hover:bg-purple-200/70 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau</span>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-[28px] border-2 border-purple-100 p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-3" />
                <p className="font-bold text-gray-700 text-sm">Chargement de tes cahiers...</p>
              </div>
            ) : books.length === 0 ? (
              /* État vide chaleureux */
              <div className="bg-white rounded-[32px] border-2 border-dashed border-purple-200 p-8 md:p-14 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
                <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 shadow-inner">
                  <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Tu n’as pas encore créé de cahier de souvenirs !
                </h3>
                <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
                  C’est le moment d’immortaliser ton année scolaire, tes photos de classe et tes plus
                  beaux moments avec tes camarades.
                </p>
                <Link
                  href="/learn/souvenirs/nouveau"
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Démarrer mon premier cahier (9 pages)</span>
                </Link>
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
