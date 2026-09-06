"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useProfile } from "@/lib/profile-store";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { MemoryBookRecord } from "@/features/memory-book/types/memory-book.types";
import { AuthenticNotebook } from "@/features/memory-book/components/authentic/AuthenticNotebook";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function MemoryBookEditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;
  const router = useRouter();

  const { studentSession } = useAuthStore();
  const profile = useProfile();
  const childId = studentSession?.profileId || profile?.id || "default_child";

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
        <h2 className="caveat-font text-3xl font-bold text-[#7A3B1D]">Ouverture de ton cahier de souvenirs...</h2>
        <p className="text-sm font-semibold text-[#8a7f66] mt-1">Chargement des 10 pages et des polaroids</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#EFE6D2] flex flex-col items-center justify-center p-6 text-center font-['Quicksand',sans-serif]">
        <h2 className="caveat-font text-3xl font-bold text-[#7A3B1D] mb-2">Cahier introuvable</h2>
        <p className="text-sm text-[#8a7f66] mb-6">Ce cahier n&apos;existe pas ou a été déplacé.</p>
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
      <AuthenticNotebook initialBook={book} profileId={childId} />
    </div>
  );
}
