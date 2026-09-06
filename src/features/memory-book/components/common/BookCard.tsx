"use client";

import React from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, Eye, Trash2, Camera, Printer } from "lucide-react";

interface BookCardProps {
  book: MemoryBookRecord;
  onDelete?: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
  const answers: Record<string, string> =
    (book as any).answers_data ||
    (Array.isArray(book.pages_data) && (book.pages_data as any).answers) ||
    {};

  // Compter les photos enregistrées
  const photosCount = Object.keys(answers).filter(
    (k) => (k.startsWith("photo-") || k.includes("photo") || k === "cover-friends" || k === "cover-teacher" || k.startsWith("c-")) && !!answers[k]
  ).length;

  const childName = answers["p-prenom"] || "";

  return (
    <div className="group bg-[#FBF6EC] rounded-2xl border-2 border-[#3A362E] hover:border-[#7A3B1D] shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden font-['Quicksand',sans-serif]">
      {/* Spirale décorative sur le bord gauche */}
      <div className="absolute top-0 bottom-0 left-0 w-3 bg-[#F3EBDA] border-r border-dashed border-[#C9BFA9] flex flex-col justify-evenly py-2 items-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white border border-[#3A362E]" />
        ))}
      </div>

      <div className="pl-3">
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="caveat-font font-bold text-2xl text-[#7A3B1D] group-hover:text-[#F7941D] transition leading-tight">
              {childName ? `Cahier de ${childName}` : book.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#8a7f66] font-bold mt-1">
              <Calendar className="w-3.5 h-3.5 text-[#F7941D]" />
              <span>Année {answers["cover-year"] || book.school_year || "2025 - 2026"}</span>
            </div>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Es-tu sûr(e) de vouloir supprimer ce cahier de souvenirs ?")) {
                  onDelete(book.id);
                }
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Supprimer ce cahier"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Détails du contenu */}
        <div className="bg-[#F3EBDA] rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs font-bold text-[#5B5648]">
          <span>📖 10 pages complètes</span>
          <span className="flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-[#0F8B8C]" />
            {photosCount > 0 ? `${photosCount} photo(s)` : "Photos à ajouter"}
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#C9BFA9]/60">
          <Link
            href={`/learn/souvenirs/${book.id}`}
            className="flex-1 py-2 px-3 rounded-xl bg-[#F7941D] hover:bg-[#e08213] border border-[#3A362E] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition active:scale-98"
          >
            <span>Ouvrir le cahier</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href={`/learn/souvenirs/${book.id}/apercu`}
            className="p-2 rounded-xl bg-white hover:bg-[#F3EBDA] border border-[#3A362E] text-[#3A362E] font-bold text-xs transition flex items-center gap-1"
            title="Aperçu PDF et impression"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
