"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { MemoryBookRecord } from "@/features/memory-book/types/memory-book.types";
import { AuthenticPreview } from "@/features/memory-book/components/authentic/AuthenticPreview";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default function MemoryBookPreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;
  const router = useRouter();

  const [book, setBook] = useState<MemoryBookRecord | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE6D2] flex flex-col items-center justify-center p-6 text-center font-['Quicksand',sans-serif]">
        <Loader2 className="w-12 h-12 text-[#F7941D] animate-spin mb-4" />
        <h2 className="caveat-font text-3xl font-bold text-[#7A3B1D]">Préparation de l&apos;aperçu...</h2>
        <p className="text-sm font-semibold text-[#8a7f66] mt-1">Mise en page des 10 pages souvenirs</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#EFE6D2] flex flex-col items-center justify-center p-6 text-center font-['Quicksand',sans-serif]">
        <h2 className="caveat-font text-3xl font-bold text-[#7A3B1D] mb-2">Cahier introuvable</h2>
        <Link
          href="/learn/souvenirs"
          className="px-6 py-3 rounded-2xl bg-[#F7941D] text-white font-bold text-sm shadow-md"
        >
          Retourner à mes cahiers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE6D2]">
      <AuthenticPreview book={book} />
    </div>
  );
}
