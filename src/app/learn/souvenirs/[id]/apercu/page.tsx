"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { MemoryBookRecord } from "@/features/memory-book/types/memory-book.types";
import { MemoryBookPreview } from "@/features/memory-book/components/preview/MemoryBookPreview";
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
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-gray-900">Préparation de l&apos;aperçu...</h2>
        <p className="text-sm text-gray-500 mt-1">Génération de la vue de ton cahier</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black text-gray-900 mb-2">Cahier introuvable</h2>
        <Link
          href="/learn/souvenirs"
          className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-sm shadow-md"
        >
          Retourner à mes cahiers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] pb-16">
      <MemoryBookPreview book={book} />
    </div>
  );
}
