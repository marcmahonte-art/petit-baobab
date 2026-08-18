"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, Star, Printer, Trash2, BookOpen, Sparkles, Eye, FileText, CheckCircle2, Loader2, FileDown, Share2 } from "lucide-react";
import { listSheets, toggleFavorite, deleteSheet, isContentTextual, PedagogicalSheetRow } from "@/lib/assistant/queries";
import { useAuthStore } from "@/lib/auth-store";

export default function AssistantHistoryPage() {
  const user = useAuthStore((s) => s.user);

  const [sheets, setSheets] = useState<PedagogicalSheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<PedagogicalSheetRow | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [loadingDocx, setLoadingDocx] = useState<string | null>(null);
  const [loadingWa, setLoadingWa] = useState<string | null>(null);

  // Load sheets from Supabase
  const loadHistory = async () => {
    setLoading(true);
    const result = await listSheets(user?.id);
    if (result.data && result.data.length > 0) {
      setSheets(result.data);
    } else {
      // Fallback mock items if table empty or guest mode
      setSheets(FALLBACK_MOCK_SHEETS);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Handler: Toggle Favorite
  const handleToggleFavorite = async (sheetId: string, currentFav: boolean) => {
    const nextFav = !currentFav;
    // Optimistic UI update
    setSheets((prev) =>
      prev.map((s) => (s.id === sheetId ? { ...s, is_favorite: nextFav } : s))
    );
    if (selectedItem?.id === sheetId) {
      setSelectedItem((prev) => (prev ? { ...prev, is_favorite: nextFav } : null));
    }

    await toggleFavorite(sheetId, nextFav);
  };

  // Handler: Delete Sheet
  const handleDelete = async (sheetId: string) => {
    // Optimistic UI update
    setSheets((prev) => prev.filter((s) => s.id !== sheetId));
    if (selectedItem?.id === sheetId) {
      setSelectedItem(null);
    }

    await deleteSheet(sheetId);
  };

  // Handler: Export PDF
  const handleExportPdf = async (sheetId: string) => {
    setLoadingPdf(sheetId);
    try {
      const res = await fetch(`/api/assistant/export/pdf?sheet_id=${sheetId}`);
      if (res.headers.get("content-type")?.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Petit_Baobab_${sheetId.slice(0, 8)}.pdf`;
        a.click();
      } else {
        const data = await res.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoadingPdf(null);
    }
  };

  // Handler: Export Word (DOCX)
  const handleExportDocx = async (sheetId: string) => {
    setLoadingDocx(sheetId);
    try {
      const res = await fetch(`/api/assistant/export/docx?sheet_id=${sheetId}`);
      if (res.headers.get("content-type")?.includes("officedocument")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Petit_Baobab_${sheetId.slice(0, 8)}.docx`;
        a.click();
      } else {
        const data = await res.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("DOCX export failed:", err);
    } finally {
      setLoadingDocx(null);
    }
  };

  // Handler: WhatsApp Share (wa.me link with 7-day signed PDF URL)
  const handleWhatsAppShare = async (sheetId: string, title: string) => {
    setLoadingWa(sheetId);
    try {
      let shareUrl = window.location.href;
      const res = await fetch(`/api/assistant/export/pdf?sheet_id=${sheetId}&share=true`);
      const data = await res.json();
      if (data.downloadUrl) {
        shareUrl = data.downloadUrl;
      }
      const message = `Voici une fiche pédagogique Petit Baobab : ${title}\n\n${shareUrl}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("WhatsApp share failed:", err);
    } finally {
      setLoadingWa(null);
    }
  };

  const filteredItems = sheets.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.persona.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-12">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EDE3D5] rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <Link
            href="/school/assistant"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6535E8] hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'assistant pédagogique
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#35180D] flex items-center gap-2">
            <span>Historique des activités</span>
            <span className="text-[#FF8A00]">📋</span>
          </h1>
          <p className="text-sm text-[#7A6A5E] font-medium">
            Retrouvez, réimprimez ou réutilisez toutes les fiches pédagogiques enregistrées.
          </p>
        </div>

        <Link
          href="/school/assistant"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#6535E8] text-white font-bold text-sm shadow-md shadow-[#6535E8]/20 hover:bg-[#542AC4] transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Créer une activité</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#EDE3D5] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#90847B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, niveau ou catégorie..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E8DFC9] bg-[#FFFDF8] text-sm text-[#35180D] font-medium focus:outline-none focus:border-[#6535E8] focus:ring-2 focus:ring-[#6535E8]/20 transition-all"
          />
        </div>

        <div className="text-xs font-bold text-[#90847B]">
          {filteredItems.length} fiche{filteredItems.length > 1 ? "s" : ""} trouvée{filteredItems.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-[#EDE3D5] rounded-3xl space-y-3">
          <Loader2 className="w-8 h-8 text-[#6535E8] animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#7A6A5E]">Chargement de votre historique Supabase...</p>
        </div>
      ) : (
        /* History Items Grid / Preview Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: History Items List (7 cols or 12 cols) */}
          <div className={selectedItem ? "lg:col-span-6 space-y-3" : "lg:col-span-12 space-y-3"}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const showDocx = isContentTextual(item.tool_id);
                const formattedDate = new Date(item.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-xs space-y-3 ${
                      isSelected
                        ? "border-2 border-[#6535E8] bg-[#F3ECFF]/30"
                        : "border-[#EDE3D5] hover:border-[#6535E8]/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#65A916] capitalize">
                            {item.persona.replace("_", " ")}
                          </span>
                          {item.category && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF9EE] text-[#FF8A00] capitalize">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-[#35180D] flex items-center gap-2">
                          <span>{item.title}</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Favorite Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(item.id, item.is_favorite)}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            item.is_favorite
                              ? "bg-amber-100 text-amber-500 scale-110"
                              : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"
                          }`}
                          title={item.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Star className={`w-5 h-5 ${item.is_favorite ? "fill-amber-400" : ""}`} />
                        </button>

                        <span className="flex items-center gap-1 text-xs text-[#90847B] font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#7A6A5E] line-clamp-2 leading-relaxed">
                      {item.generated_content}
                    </p>

                    <div className="pt-3 border-t border-[#F0E7DA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3ECFF] text-[#6535E8] hover:bg-[#6535E8] hover:text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aperçu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8EE] text-[#FF8A00] hover:bg-[#FF8A00] hover:text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer</span>
                        </button>

                        {/* Export PDF Button */}
                        <button
                          type="button"
                          onClick={() => handleExportPdf(item.id)}
                          disabled={loadingPdf === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F9E8] text-[#65A916] hover:bg-[#65A916] hover:text-white font-bold text-xs transition-all cursor-pointer"
                          title="Télécharger la fiche au format PDF A4"
                        >
                          {loadingPdf === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                          <span>PDF</span>
                        </button>

                        {/* Export Word (DOCX) Button - Conditional on isContentTextual */}
                        {showDocx && (
                          <button
                            type="button"
                            onClick={() => handleExportDocx(item.id)}
                            disabled={loadingDocx === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3ECFF] text-[#6535E8] hover:bg-[#6535E8] hover:text-white font-bold text-xs transition-all cursor-pointer"
                            title="Exporter la fiche au format Microsoft Word (.docx)"
                          >
                            {loadingDocx === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            <span>Word (.docx)</span>
                          </button>
                        )}

                        {/* WhatsApp Share Button */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppShare(item.id, item.title)}
                          disabled={loadingWa === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white font-bold text-xs transition-all cursor-pointer"
                          title="Partager le lien de la fiche sur WhatsApp"
                        >
                          {loadingWa === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span>WhatsApp</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                        title="Supprimer la fiche"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white border border-dashed border-[#E8DFC9] rounded-3xl space-y-2">
                <BookOpen className="w-8 h-8 text-[#90847B] mx-auto" />
                <p className="font-bold text-base text-[#35180D]">
                  Aucune fiche trouvée dans votre historique.
                </p>
                <p className="text-xs text-[#7A6A5E]">
                  Essayez de modifier votre recherche ou génerer une nouvelle activité.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Document Preview Modal/Card when selected */}
          {selectedItem && (
            <div className="lg:col-span-6 bg-white border border-[#EDE3D5] rounded-3xl p-6 shadow-sm space-y-4 sticky top-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#EDE3D5] pb-3">
                <span className="text-xs font-bold text-[#6535E8] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Détail de la fiche sélectionnée
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-xs font-bold text-[#90847B] hover:text-[#35180D] cursor-pointer"
                >
                  Fermer ✕
                </button>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-[#35180D] flex items-center gap-2">
                  <span>{selectedItem.title}</span>
                  {selectedItem.is_favorite && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#7A6A5E]">
                  <span className="bg-[#FFF8EE] px-2.5 py-1 rounded-lg border border-[#F0E7DA] capitalize">
                    {selectedItem.persona.replace("_", " ")}
                  </span>
                  {selectedItem.category && (
                    <span className="bg-[#F4F9E8] px-2.5 py-1 rounded-lg border border-[#D5EAA9] text-[#65A916] capitalize">
                      {selectedItem.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[#FFFDF8] border border-[#E8DFC9] rounded-2xl text-xs sm:text-sm text-[#35180D] space-y-3 leading-relaxed whitespace-pre-line">
                <p className="font-bold text-[#6535E8]">Contenu de la fiche :</p>
                <p>{selectedItem.generated_content}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(selectedItem.id, selectedItem.is_favorite)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedItem.is_favorite
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${selectedItem.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    <span>{selectedItem.is_favorite ? "Favori ⭐" : "Mettre en favori"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6535E8] text-white font-bold text-xs sm:text-sm hover:bg-[#542AC4] transition-all cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer (A4)</span>
                  </button>
                </div>

                {/* Export & Share Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[#F0E7DA] pt-3">
                  {/* Export PDF Button */}
                  <button
                    type="button"
                    onClick={() => handleExportPdf(selectedItem.id)}
                    disabled={loadingPdf === selectedItem.id}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F9E8] text-[#65A916] hover:bg-[#65A916] hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                    title="Télécharger la fiche au format PDF A4"
                  >
                    {loadingPdf === selectedItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                    <span>PDF</span>
                  </button>

                  {/* Export Word (DOCX) Button - Conditional on isContentTextual */}
                  {isContentTextual(selectedItem.tool_id) && (
                    <button
                      type="button"
                      onClick={() => handleExportDocx(selectedItem.id)}
                      disabled={loadingDocx === selectedItem.id}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F3ECFF] text-[#6535E8] hover:bg-[#6535E8] hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                      title="Exporter la fiche au format Microsoft Word (.docx)"
                    >
                      {loadingDocx === selectedItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      <span>Word (.docx)</span>
                    </button>
                  )}

                  {/* WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppShare(selectedItem.id, selectedItem.title)}
                    disabled={loadingWa === selectedItem.id}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366] hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                    title="Partager le lien de la fiche sur WhatsApp"
                  >
                    {loadingWa === selectedItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Données de secours si aucune fiche n'est trouvée dans la base
const FALLBACK_MOCK_SHEETS: PedagogicalSheetRow[] = [
  {
    id: "h_1",
    teacher_id: "demo",
    title: "Séquence d'éveil — Maternelle",
    persona: "maitresse_maternelle",
    tool_id: "sequence_eveil_maternelle",
    category: "pedagogie",
    domaine_eveil: "Cognitif",
    input_values: { theme: "les animaux de la savane" },
    generated_content: "Objectifs : Découvrir la faune locale, stimuler le langage oral. Matériel : Images d'animaux, calebasses, graines. Déroulé en 3 temps : Accueil, activité tri et imitation, retour au calme.",
    stars_cost: 5,
    is_favorite: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "h_2",
    teacher_id: "demo",
    title: "Fiche de graphisme — Maternelle",
    persona: "maitresse_maternelle",
    tool_id: "fiche_graphisme",
    category: "activites",
    domaine_eveil: "Psychomoteur",
    input_values: { motif: "Bogolan" },
    generated_content: "Mise en page A4 noir et blanc économe en encre. 4 lignes d'exercice avec motifs Bogolan et Faso dan fani. Exercices de pré-écriture pour la préparation au CP.",
    stars_cost: 5,
    is_favorite: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
