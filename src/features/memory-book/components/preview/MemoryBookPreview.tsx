"use client";

import React, { useState } from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { BookPageRenderer } from "../editor/BookPageRenderer";
import { memoryBookPdfExporter } from "../../services/memoryBookPdfExporter";
import Link from "next/link";
import { ArrowLeft, Printer, Download, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface MemoryBookPreviewProps {
  book: MemoryBookRecord;
}

export const MemoryBookPreview: React.FC<MemoryBookPreviewProps> = ({ book }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const pages = book.pages_data || [];

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setDownloadSuccess(false);
      await memoryBookPdfExporter.downloadPdf(book, {
        onProgress: (percent, text) => {
          setExportProgress(percent);
          setExportStatus(text);
        },
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Erreur lors de la génération PDF:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Barre d'actions supérieure (masquée lors de l'impression) */}
      <div className="print:hidden sticky top-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-purple-100 shadow-lg mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/learn/souvenirs/${book.id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continuer à modifier</span>
        </Link>

        <div className="flex items-center gap-2 text-center">
          <span className="font-extrabold text-gray-900 text-base md:text-lg">
            Aperçu de ton cahier ({pages.length} pages)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Impression */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white border-2 border-purple-200 hover:bg-purple-50 text-purple-700 font-bold text-sm flex items-center gap-2 shadow-xs transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>

          {/* Bouton Export PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-60"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>PDF ({exportProgress}%)</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Téléchargé !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger en PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message de progression de génération PDF */}
      {isExportingPdf && (
        <div className="print:hidden mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-purple-900 mb-1">
              <span>{exportStatus || "Préparation du PDF..."}</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Affichage de toutes les pages (Format document feuilletable / imprimable) */}
      <div className="flex flex-col gap-10 print:gap-0 print:block">
        {pages.map((page) => (
          <div
            key={page.id}
            className="w-full flex justify-center print:break-after-page print:m-0 print:p-0 print:shadow-none"
          >
            <BookPageRenderer
              page={page}
              totalPages={pages.length}
              profileId={book.profile_id}
              bookId={book.id}
              onUpdateText={() => {}}
              onUpdatePhoto={() => {}}
              isReadOnly={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
