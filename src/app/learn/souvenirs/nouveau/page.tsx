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
import { ArrowLeft, Sparkles, Loader2, BookOpen, CalendarDays, ChevronRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#F3EDE4] relative overflow-hidden pb-16 lg:pb-24 text-[#3B2416]">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#F0E7DA] text-[#3B2416] font-bold text-sm hover:bg-[#FFF9F2] transition shadow-[0_2px_10px_rgba(59,36,22,0.06)]"
            >
              <ArrowLeft className="w-4 h-4 text-[#7D6AF8]" />
              <span>Retour à mes cahiers</span>
            </Link>
          </div>

          {/* Titre de page */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F0E7DA] bg-white px-3 py-1 text-xs font-extrabold text-[#7A3B1D] shadow-[0_2px_10px_rgba(59,36,22,0.06)]">
              <Sparkles className="h-3.5 w-3.5 text-[#7D6AF8]" />
              <span>Format A4 Petit Baobab</span>
            </div>
            <h1 className="caveat-font mt-3 text-4xl md:text-5xl font-bold text-[#3B2416] tracking-normal">
              Créer un nouveau cahier de souvenirs
            </h1>
            <p className="text-sm md:text-base text-[#6F604F] font-semibold mt-2 leading-relaxed">
              Choisis ton modèle et donne un titre à ton album de souvenirs avant de commencer à le remplir.
            </p>
          </div>

          {/* Formulaire de personnalisation */}
          <form onSubmit={handleCreate} className="flex flex-col gap-8 max-w-3xl">
            <div className="bg-[#FFF9F2] rounded-[28px] border border-[#F0E7DA] p-6 md:p-8 shadow-[0_10px_30px_-14px_rgba(59,36,22,0.18)] flex flex-col gap-5">
              <h2 className="caveat-font text-3xl font-bold text-[#3B2416] flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#7D6AF8]" />
                <span>Les informations de ton cahier</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bookTitle" className="block text-xs font-bold text-[#6F604F] uppercase tracking-wider mb-1.5">
                    Titre du cahier
                  </label>
                  <input
                    id="bookTitle"
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#F0E7DA] focus:border-[#7D6AF8] focus:ring-4 focus:ring-[#7D6AF8]/10 outline-none font-bold text-[#3B2416] bg-white text-sm md:text-base transition shadow-[0_2px_10px_rgba(59,36,22,0.06)]"
                    placeholder="Ex : Mon Année de CP"
                  />
                </div>

                <div>
                  <label htmlFor="schoolYear" className="block text-xs font-bold text-[#6F604F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-[#13C6A2]" />
                    Année scolaire
                  </label>
                  <input
                    id="schoolYear"
                    type="text"
                    required
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#F0E7DA] focus:border-[#7D6AF8] focus:ring-4 focus:ring-[#7D6AF8]/10 outline-none font-bold text-[#3B2416] bg-white text-sm md:text-base transition shadow-[0_2px_10px_rgba(59,36,22,0.06)]"
                    placeholder="2025 - 2026"
                  />
                </div>
              </div>
            </div>

            {/* Choix du modèle */}
            <div className="flex flex-col gap-4">
              <h2 className="caveat-font text-3xl font-bold text-[#3B2416]">
                Choisis ton modèle de cahier
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
                className="w-full md:w-auto px-8 py-4 rounded-full bg-[#7D6AF8] hover:bg-[#6d59ef] text-white font-black text-base shadow-[0_8px_18px_-8px_rgba(125,106,248,.55)] transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création de ton cahier en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Ouvrir et commencer mon cahier</span>
                    <ChevronRight className="w-5 h-5" />
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
