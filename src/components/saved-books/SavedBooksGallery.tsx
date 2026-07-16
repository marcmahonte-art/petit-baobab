"use client"

import { BookOpen, Search } from "lucide-react"
import { useState } from "react"
import type { SavedBook } from "@/features/books/types"
import { SavedBookCard } from "./SavedBookCard"

interface SavedBooksGalleryProps {
  books: SavedBook[]
  onModify: (book: SavedBook) => void
  onDownload: (book: SavedBook) => void
  onPrint: (book: SavedBook) => void
  onDelete: (id: string) => void
}

export function SavedBooksGallery({ books, onModify, onDownload, onPrint, onDelete }: SavedBooksGalleryProps) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? books.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.childName.toLowerCase().includes(search.toLowerCase())
      )
    : books

  if (books.length === 0) {
    return (
      <div className="rounded-[24px] border border-[#E5E7EB]/80 bg-white p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#6D4CFF]/10 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#6D4CFF]" />
        </div>
        <h3 className="text-lg font-extrabold text-[#1F2937]">Aucun livre pour le moment</h3>
        <p className="text-sm font-semibold text-[#64748B] max-w-sm">
          Crée ton premier livre de coloriage personnalisé et il apparaîtra ici !
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Rechercher un livre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-[14px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#1F2937] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-[#E5E7EB]/80 bg-white p-12 flex flex-col items-center justify-center gap-3 text-center">
          <Search className="w-8 h-8 text-[#64748B]" />
          <p className="text-sm font-bold text-[#64748B]">Aucun livre ne correspond à ta recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((book) => (
            <SavedBookCard
              key={book.id}
              book={book}
              onModify={onModify}
              onDownload={onDownload}
              onPrint={onPrint}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
