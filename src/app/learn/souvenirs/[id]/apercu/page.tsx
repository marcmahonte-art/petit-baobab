"use client";

import React, { useCallback, useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { MemoryBookRecord } from "@/features/memory-book/types/memory-book.types";
import { BookPrint } from "@/features/memory-book/components/editor/BookPrint";
import { ArrowLeft, Printer, Download, Loader2, CheckCircle2 } from "lucide-react";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

/** Largeur d'une feuille A4 en pixels CSS (210 mm à 96 dpi). */
const A4_WIDTH_PX = 794;

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "Mon_cahier_de_souvenirs"
  );
}

export default function MemoryBookPreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;
  const router = useRouter();

  const [book, setBook] = useState<MemoryBookRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [scale, setScale] = useState(1);

  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    memoryBookService
      .getById(bookId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setBook(data);
        } else {
          router.push("/learn/souvenirs");
        }
      })
      .catch((e) => {
        console.error("Erreur lors de la récupération du cahier:", e);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookId, router]);

  // Met les feuilles A4 à l'échelle de la largeur disponible, sans jamais agrandir.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !book) return;

    const compute = () => {
      const available = el.clientWidth - 24;
      const next = Math.min(1, Math.max(0.35, available / A4_WIDTH_PX));
      setScale(Number(next.toFixed(3)));
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [book]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/memory-books/${bookId}/pdf`);
      if (!res.ok) throw new Error(`Réponse ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(book?.title || "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 4000);
    } catch (err) {
      // La génération serveur peut échouer (Playwright indisponible, hors ligne).
      // On retombe sur l'impression navigateur, qui produit le même rendu.
      console.warn("Téléchargement PDF impossible, repli sur l'impression:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [bookId, book]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3E4] flex flex-col items-center justify-center p-6 text-center font-nunito">
        <Loader2 className="w-10 h-10 text-[#16866B] animate-spin mb-4" />
        <h2 className="font-baloo text-2xl font-bold text-[#61351F]">
          Préparation de l&apos;aperçu…
        </h2>
        <p className="text-sm text-[#61351F]/70 mt-1">Mise en page du cahier</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FAF3E4] flex flex-col items-center justify-center p-6 text-center font-nunito">
        <h2 className="font-baloo text-2xl font-bold text-[#61351F] mb-4">
          Cahier introuvable
        </h2>
        <Link
          href="/learn/souvenirs"
          className="px-6 py-3 rounded-2xl bg-[#16866B] text-white font-bold text-sm"
        >
          Retourner à mes cahiers
        </Link>
      </div>
    );
  }

  const pageCount = book.pages_data?.length || 0;

  return (
    <div className="min-h-screen bg-[#FAF3E4] font-nunito">
      <style>{`
        @media screen {
          .mb-preview-pages .print-page {
            margin-bottom: 24px;
            border-radius: 10px;
            box-shadow: 0 12px 32px -12px rgba(97, 53, 31, 0.35);
            outline: 1px solid rgba(97, 53, 31, 0.10);
            outline-offset: -1px;
          }
        }
        @media print {
          .mb-preview-chrome { display: none !important; }
          .mb-preview-stage { padding: 0 !important; }
          .mb-preview-pages { zoom: 1 !important; width: 210mm !important; }
        }
      `}</style>

      <div className="mb-preview-chrome sticky top-0 z-40 border-b border-[#61351F]/10 bg-[#FFFDF8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/learn/souvenirs/${bookId}`}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-[#61351F] transition hover:bg-[#FAF3E4]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour à l&apos;éditeur</span>
            </Link>
            <div className="min-w-0">
              <p className="truncate font-baloo text-base font-bold leading-tight text-[#61351F]">
                {book.title || "Mon cahier de souvenirs"}
              </p>
              <p className="text-xs text-[#61351F]/60">
                Aperçu — {pageCount} page{pageCount > 1 ? "s" : ""} au format A4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-[#61351F]/25 px-4 py-2 text-sm font-bold text-[#61351F] transition hover:bg-[#FAF3E4]"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl bg-[#16866B] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0F6E56] disabled:opacity-70"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : downloaded ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {downloading ? "Génération…" : downloaded ? "Téléchargé" : "Télécharger le PDF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div ref={stageRef} className="mb-preview-stage mx-auto max-w-6xl px-3 py-6">
        <div
          className="mb-preview-pages mx-auto w-[210mm]"
          style={{ zoom: scale }}
        >
          <BookPrint book={book} />
        </div>
      </div>
    </div>
  );
}
