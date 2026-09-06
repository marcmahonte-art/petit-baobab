"use client";

import React from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, Eye, Trash2 } from "lucide-react";

interface BookCardProps {
  book: MemoryBookRecord;
  onDelete?: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
  const pages = book.pages_data || [];
  const photosCount = pages.reduce(
    (acc, page) =>
      acc + page.elements.filter((el) => el.type === "photo" && el.photoData?.url).length,
    0
  );

  const formattedDate = new Date(book.updated_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="group bg-white rounded-[24px] border-2 border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Bandeau d'en-tête de la carte */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base md:text-lg group-hover:text-purple-700 transition">
              {book.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Année {book.school_year}</span>
            </div>
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
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Supprimer ce cahier"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Détails du contenu */}
      <div className="bg-purple-50/60 rounded-xl p-3 mb-4 flex items-center justify-between text-xs font-semibold text-purple-900">
        <span>📖 {pages.length} pages</span>
        <span>📸 {photosCount} photos ajoutées</span>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Link
          href={`/learn/souvenirs/${book.id}`}
          className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
        >
          <span>Ouvrir le cahier</span>
          <ChevronRight className="w-4 h-4" />
        </Link>

        <Link
          href={`/learn/souvenirs/${book.id}/apercu`}
          className="p-2.5 rounded-xl bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 font-bold text-xs transition"
          title="Prévisualiser et exporter en PDF"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
