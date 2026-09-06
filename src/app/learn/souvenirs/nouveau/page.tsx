"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/learn/_components/sidebar";
import { Header } from "@/app/learn/_components/header";
import { MobileBottomNav } from "@/components/child-dashboard";
import { useAuthStore } from "@/lib/auth-store";
import { useProfile } from "@/lib/profile-store";
import { AVAILABLE_MEMORY_BOOK_TEMPLATES } from "@/features/memory-book/constants/default-templates";
import { TemplateCard } from "@/features/memory-book/components/common/TemplateCard";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function NewMemoryBookPage() {
  const router = useRouter();
  const { studentSession } = useAuthStore();
  const profile = useProfile();
  const childId = studentSession?.profileId || profile?.id || "default_child";
  const childName = studentSession?.name || profile?.name || "Mon Enfant";

  const [selectedTemplate, setSelectedTemplate] = useState(AVAILABLE_MEMORY_BOOK_TEMPLATES[0]);
  const [bookTitle, setBookTitle] = useState(`Cahier de Souvenirs de ${childName}`);
  const [schoolYear, setSchoolYear] = useState("2025 - 2026");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || isCreating) return;

    try {
      setIsCreating(true);
      const newBook = await memoryBookService.createBook({
        profileId: childId,
        templateId: selectedTemplate.id,
        title: bookTitle.trim() || selectedTemplate.title,
        schoolYear: schoolYear.trim() || "2025 - 2026",
      });

      router.push(`/learn/souvenirs/${newBook.id}`);
    } catch (err) {
      console.error("Erreur lors de la création du cahier:", err);
      setIsCreating(false);
    }
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

          {/* Lien retour */}
          <div>
            <Link
              href="/learn/souvenirs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Retour à mes cahiers</span>
            </Link>
          </div>

          {/* Titre de page */}
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Créer un nouveau cahier de souvenirs ✨
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-medium mt-1">
              Choisis ton modèle et donne un titre à ton album de souvenirs avant de commencer à le remplir.
            </p>
          </div>

          {/* Formulaire de personnalisation */}
          <form onSubmit={handleCreate} className="flex flex-col gap-8 max-w-3xl">
            <div className="bg-white rounded-[28px] border-2 border-purple-100 p-6 md:p-8 shadow-xs flex flex-col gap-5">
              <h2 className="text-lg font-black text-gray-900">
                1. Les informations de ton cahier
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bookTitle" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Titre du cahier
                  </label>
                  <input
                    id="bookTitle"
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-600 outline-none font-bold text-gray-900 text-sm md:text-base transition"
                    placeholder="Ex : Mon Année de CP"
                  />
                </div>

                <div>
                  <label htmlFor="schoolYear" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Année scolaire
                  </label>
                  <input
                    id="schoolYear"
                    type="text"
                    required
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-600 outline-none font-bold text-gray-900 text-sm md:text-base transition"
                    placeholder="2025 - 2026"
                  />
                </div>
              </div>
            </div>

            {/* Choix du modèle */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-gray-900">
                2. Choisis ton modèle de cahier
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {AVAILABLE_MEMORY_BOOK_TEMPLATES.map((tmpl) => (
                  <TemplateCard
                    key={tmpl.id}
                    template={tmpl}
                    isSelected={selectedTemplate.id === tmpl.id}
                    onSelect={setSelectedTemplate}
                  />
                ))}
              </div>
            </div>

            {/* Bouton de confirmation */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création de ton cahier en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Ouvrir et commencer mon cahier →</span>
                  </>
                )}
              </button>
            </div>
          </form>
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
