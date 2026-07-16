"use client"

import { BookOpen, Download, Printer, Trash2, Clock, FileText, Pencil } from "lucide-react"
import { motion } from "framer-motion"
import type { SavedBook } from "@/features/books/types"

interface SavedBookCardProps {
  book: SavedBook
  onModify: (book: SavedBook) => void
  onDownload: (book: SavedBook) => void
  onPrint: (book: SavedBook) => void
  onDelete: (id: string) => void
}

export function SavedBookCard({ book, onModify, onDownload, onPrint, onDelete }: SavedBookCardProps) {
  const isFinalized = book.status === "finalized"
  const date = new Date(book.updatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-[20px] border border-[#E5E7EB]/80 bg-white shadow-sm overflow-hidden flex flex-col"
    >
      {/* Cover preview */}
      <div className="relative h-[140px] md:h-[180px] bg-gradient-to-br from-[#F5F0FF] to-[#EEF7FF] flex items-center justify-center overflow-hidden">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#6D4CFF]/40">
            <BookOpen className="w-8 h-8 md:w-12 md:h-12" />
            <span className="text-xs font-bold">{book.format}</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          isFinalized
            ? "bg-[#25C76F]/15 text-[#18884E]"
            : "bg-[#FBBF24]/15 text-[#B8860B]"
        }`}>
          {isFinalized ? "Terminé" : "Brouillon"}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <h3 className="text-sm font-extrabold text-[#1F2937] leading-tight line-clamp-1">
          {book.title}
        </h3>
        {book.childName && (
          <p className="text-[11px] font-semibold text-[#64748B]">
            pour {book.childName}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] mt-auto pt-2">
          <Clock className="w-3 h-3" />
          <span>{date}</span>
          <span className="mx-1">·</span>
          <FileText className="w-3 h-3" />
          <span>{book.pages.length} pages</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col border-t border-[#E5E7EB]/60">
        <div className="flex">
          <button
            onClick={() => onModify(book)}
            className="flex-1 h-10 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-[#6D4CFF] hover:bg-[#6D4CFF]/5 transition-colors cursor-pointer"
          >
            {isFinalized ? <Pencil className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            {isFinalized ? "Modifier" : "Ouvrir"}
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="flex-1 h-10 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors border-l border-[#E5E7EB]/60 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
        {isFinalized && (
          <div className="flex border-t border-[#E5E7EB]/60">
            <button
              onClick={() => onDownload(book)}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-[#20C997] hover:bg-[#20C997]/5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Télécharger
            </button>
            <button
              onClick={() => onPrint(book)}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-[#1F2937] hover:bg-neutral-50 transition-colors border-l border-[#E5E7EB]/60 cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              Imprimer
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
