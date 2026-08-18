"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, Star, Printer, Trash2, BookOpen, Sparkles, Eye, FileText, CheckCircle2 } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  category: string;
  persona: string;
  target: string;
  date: string;
  stars: number;
  previewText: string;
}

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: "h_1",
    title: "Séquence d'éveil : Les animaux de la savane",
    category: "Pédagogie & Séquences",
    persona: "Maîtresse de maternelle",
    target: "Moyenne Section (4 ans)",
    date: "18 août 2026, 09:40",
    stars: 5,
    previewText: "Objectifs : Découvrir la faune locale, stimuler le langage oral. Matériel : Images d'animaux, calebasses, graines. Déroulé en 3 temps : Accueil, activité tri et imitation, retour au calme.",
  },
  {
    id: "h_2",
    title: "Fiche de graphisme : Lignes et boucles decoratives",
    category: "Activités & Graphisme",
    persona: "Maîtresse de maternelle",
    target: "Grande Section (5 ans)",
    date: "17 août 2026, 15:20",
    stars: 5,
    previewText: "Mise en page A4 noir et blanc économe en encre. 4 lignes d'exercice avec motifs Bogolan et Faso dan fani. Exercices de pré-écriture pour la préparation au CP.",
  },
  {
    id: "h_3",
    title: "Fiche de routine journalière crèche (6 mois - 2 ans)",
    category: "Administration & Routines",
    persona: "Éducatrice de crèche",
    target: "Crèche (6 mois – 2 ans)",
    date: "14 août 2026, 11:05",
    stars: 5,
    previewText: "Tableau horaire avec rythmes de sommeil/sieste, temps chaud entre 12h et 15h, ateliers de manipulation de graines et comptines en Mooré.",
  },
  {
    id: "h_4",
    title: "Évaluation informelle : Langage oral et motricité fine",
    category: "Pédagogie & Séquences",
    persona: "Maîtresse de maternelle",
    target: "Petite Section (3 ans)",
    date: "12 août 2026, 14:15",
    stars: 5,
    previewText: "Grille d'observation de 10 critères simples pour évaluer la compréhension du français langue seconde et la tenue du crayon en milieu d'année.",
  },
  {
    id: "h_5",
    title: "Ordre du jour réunion d'équipe pédagogique",
    category: "Administration & Routines",
    persona: "Directrice",
    target: "Équipe & Gestion",
    date: "10 août 2026, 08:30",
    stars: 5,
    previewText: "Ordre du jour pour réunion de 1h avec 6 éducatrices. Point sur la préparation de la rentrée et répartition du matériel local.",
  },
];

export default function AssistantHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

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
            Retrouvez, réimprimez ou réutilisez toutes les fiches pédagogiques générées.
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

      {/* History Items Grid / Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: History Items List (7 cols or 12 cols) */}
        <div className={selectedItem ? "lg:col-span-6 space-y-3" : "lg:col-span-12 space-y-3"}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
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
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#65A916]">
                          {item.persona}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF9EE] text-[#FF8A00]">
                          {item.target}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-[#35180D]">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#90847B] font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#7A6A5E] line-clamp-2 leading-relaxed">
                    {item.previewText}
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
              <h2 className="text-xl font-extrabold text-[#35180D]">
                {selectedItem.title}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#7A6A5E]">
                <span className="bg-[#FFF8EE] px-2.5 py-1 rounded-lg border border-[#F0E7DA]">
                  {selectedItem.persona}
                </span>
                <span className="bg-[#F4F9E8] px-2.5 py-1 rounded-lg border border-[#D5EAA9] text-[#65A916]">
                  {selectedItem.target}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FFFDF8] border border-[#E8DFC9] rounded-2xl text-xs sm:text-sm text-[#35180D] space-y-3 leading-relaxed">
              <p className="font-bold text-[#6535E8]">Contenu pédagogique complet :</p>
              <p>{selectedItem.previewText}</p>
              <div className="pt-2 border-t border-[#E8DFC9] text-xs text-[#7A6A5E] space-y-1">
                <p>• Objectifs MENA validés</p>
                <p>• Matériel 100% local et accessible</p>
                <p>• Déroulé en 3 étapes avec retour au calme</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6535E8] text-white font-bold text-xs sm:text-sm hover:bg-[#542AC4] transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la fiche A4</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
