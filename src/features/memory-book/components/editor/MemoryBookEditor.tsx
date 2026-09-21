"use client";

import React, { useEffect, useState, useRef } from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { CanvasZone } from "./CanvasZone";
import { Inspector } from "./Inspector";
import { PreviewModal } from "./PreviewModal";
import { useRouter } from "next/navigation";
import { BookOpen, Pencil, Eye, X } from "lucide-react";

interface MemoryBookEditorProps {
  initialBook: MemoryBookRecord;
  profileId: string;
}

export const MemoryBookEditor: React.FC<MemoryBookEditorProps> = ({
  initialBook,
}) => {
  const router = useRouter();
  const {
    currentBook,
    setBook,
    previewOpen,
    setPreviewOpen,
    activeTab,
    setActiveTab,
    updatePagePhoto,
    activePageIndex,
  } = useMemoryBookStore();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<"none" | "pages" | "edit">("none");
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBook(initialBook);
  }, [initialBook, setBook]);

  const activeBook = currentBook || initialBook;
  const childAvatar =
    activeBook.child_data?.photoUrl ||
    activeBook.pages_data?.[1]?.data?.photoUrl ||
    "/cahier-souvenirs/child.png";

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await fetch(`/api/memory-books/${activeBook.id}/pdf`);
      if (!res.ok) {
        throw new Error("Échec génération distante PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(activeBook.title || "Mon_Cahier_de_Souvenirs").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Playwright distant indisponible, ouverture de la vue impression directe:", err);
      // Fallback direct vers la page d'impression A4
      window.open(`/learn/souvenirs/${activeBook.id}/imprimer`, "_blank");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleGlobalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("L'image est trop volumineuse. Taille maximale recommandée : 10 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && activeBook.pages_data?.[activePageIndex]) {
        updatePagePhoto(activeBook.pages_data[activePageIndex].id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen w-screen bg-[#FAF3E4] text-[#61351F] font-nunito flex flex-col overflow-hidden select-none">
      {/* Input de fichier global pour la caméra */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleGlobalPhotoUpload}
        className="hidden"
      />

      {/* TopBar officielle conforme au prototype */}
      <TopBar
        onBack={() => router.push("/learn/souvenirs")}
        onPreview={() => setPreviewOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        childAvatarUrl={childAvatar}
      />

      {/* Workspace 3 colonnes : Sidebar | CanvasZone | Inspector */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[230px_minmax(400px,1fr)_340px] xl:grid-cols-[280px_minmax(520px,1fr)_450px] gap-3 p-3 sm:p-4 pb-20 md:pb-4 overflow-hidden">
        {/* Sidebar gauche */}
        <div className="hidden md:block h-full min-h-0 overflow-hidden">
          <Sidebar />
        </div>

        {/* Canvas central A4 */}
        <div className="h-full min-h-0 overflow-hidden">
          <CanvasZone onRequestPhotoUpload={() => hiddenFileInputRef.current?.click()} />
        </div>

        {/* Inspector droit */}
        <div className="hidden md:block h-full min-h-0 overflow-hidden">
          <Inspector onPhotoUploadClick={() => hiddenFileInputRef.current?.click()} />
        </div>
      </main>

      {/* Barre de navigation mobile (responsive < 768px) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 bg-[#FFFDF9] border border-[#eadfd2] shadow-[0_10px_30px_rgba(50,35,20,0.15)] rounded-[17px] p-2 z-40 flex justify-around items-center">
        <button
          type="button"
          onClick={() => setMobileDrawer(mobileDrawer === "pages" ? "none" : "pages")}
          className={`px-4 py-2 rounded-[12px] font-extrabold text-xs transition inline-flex items-center gap-1.5 ${
            mobileDrawer === "pages" ? "bg-[#F0EBFF] text-[#7658E8]" : "text-[#5f554d]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" strokeWidth={2.4} />
          Pages
        </button>
        <button
          type="button"
          onClick={() => setMobileDrawer(mobileDrawer === "edit" ? "none" : "edit")}
          className={`px-4 py-2 rounded-[12px] font-extrabold text-xs transition inline-flex items-center gap-1.5 ${
            mobileDrawer === "edit" ? "bg-[#F0EBFF] text-[#7658E8]" : "text-[#5f554d]"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2.4} />
          Éditer
        </button>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="px-4 py-2 rounded-[12px] font-extrabold text-xs text-[#5f554d] hover:bg-gray-100 inline-flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" strokeWidth={2.4} />
          Aperçu
        </button>
      </div>

      {/* Tiroir mobile (Drawer) */}
      {mobileDrawer !== "none" && (
        <div className="md:hidden fixed inset-x-0 bottom-[68px] top-24 bg-[#FFFDF8] z-30 rounded-t-[24px] border-t border-[#E8DED0] p-4 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E8DED0]">
            <span className="font-baloo font-bold text-sm text-[#61351F]">
              {mobileDrawer === "pages" ? "Navigation des pages" : "Inspecteur & Outils"}
            </span>
            <button
              type="button"
              onClick={() => setMobileDrawer("none")}
              className="text-xs font-bold text-[#91877D] px-2 py-1 bg-[#F1EEE9] rounded-lg inline-flex items-center gap-1"
            >
              Fermer
              <X className="w-3 h-3" strokeWidth={2.6} />
            </button>
          </div>
          {mobileDrawer === "pages" ? <Sidebar /> : <Inspector />}
        </div>
      )}

      {/* Modal de prévisualisation */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />
    </div>
  );
};
