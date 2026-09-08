"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { MemoryBookRecord } from "@/features/memory-book/types/memory-book.types";
import { MemoryBookEditor } from "@/features/memory-book/components/editor/MemoryBookEditor";
import { useProfile } from "@/lib/profile-store";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MemoryBookEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const profile = useProfile();
  const childId = profile?.id || "default_child";
  const [book, setBook] = useState<MemoryBookRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await memoryBookService.getById(id);
        if (!data) {
          router.push("/learn/souvenirs/nouveau");
          return;
        }
        setBook(data);
      } catch (e) {
        console.error("Erreur chargement cahier:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void loadBook();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#7D6AF8]" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-gray-500 font-bold">Cahier introuvable.</p>
      </div>
    );
  }

  return <MemoryBookEditor initialBook={book} profileId={childId} />;
}
