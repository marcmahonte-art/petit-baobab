"use client";

import React, { useState } from "react";
import { PromptTemplate } from "@/lib/assistant/prompts";
import { isContentTextual } from "@/lib/assistant/queries";
import { Sparkles, Save, Printer, PlusCircle, CheckCircle2, Star, BookOpen, Clock, Users, GraduationCap, ShieldCheck, FileDown, FileText, Share2, Loader2 } from "lucide-react";
import Link from "next/link";

interface GenerationResultProps {
  prompt: PromptTemplate;
  formValues: Record<string, string>;
  customNeed: string;
  generatedText?: string;
  starCost?: number;
  sheetId?: string | null;
  onSaveHistory: (title: string, details: string) => void;
  onReset: () => void;
}

export default function GenerationResult({
  prompt,
  formValues,
  customNeed,
  generatedText,
  starCost = 5,
  sheetId,
  onSaveHistory,
  onReset,
}: GenerationResultProps) {
  const [saved, setSaved] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [loadingWa, setLoadingWa] = useState(false);

  const topic = formValues.theme || formValues.sujet_prioritaire || formValues.materiel_disponible || customNeed || "Découverte et éveil";
  const level = formValues.niveau || formValues.tranche_age || (formValues.age_en_mois ? `${formValues.age_en_mois} mois` : `${formValues.age || 4} ans`);
  const duration = formValues.duree || "30";

  const activityTitle = `Fiche Pédagogique : ${prompt.label} — ${topic}`;
  const showDocx = isContentTextual(prompt.id);

  const handleSave = () => {
    onSaveHistory(activityTitle, generatedText || `Niveau: ${level} | Durée: ${duration} min`);
    setSaved(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Handler: Export PDF
  const handleExportPdf = async () => {
    if (!sheetId) {
      // Direct print fallback if not yet saved to DB
      window.print();
      return;
    }
    setLoadingPdf(true);
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
      window.print();
    } finally {
      setLoadingPdf(false);
    }
  };

  // Handler: Export Word (DOCX)
  const handleExportDocx = async () => {
    if (!sheetId) return;
    setLoadingDocx(true);
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
      setLoadingDocx(false);
    }
  };

  // Handler: WhatsApp Share (wa.me link with 7-day signed PDF URL)
  const handleWhatsAppShare = async () => {
    setLoadingWa(true);
    try {
      let shareUrl = window.location.href;
      if (sheetId) {
        const res = await fetch(`/api/assistant/export/pdf?sheet_id=${sheetId}&share=true`);
        const data = await res.json();
        if (data.downloadUrl) {
          shareUrl = data.downloadUrl;
        }
      }
      const message = `Voici une fiche pédagogique Petit Baobab : ${activityTitle}\n\n${shareUrl}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("WhatsApp share failed:", err);
    } finally {
      setLoadingWa(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Banner Confirmation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F4F9E8] border border-[#65A916]/40 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#65A916] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#2F5204]">
              Votre contenu pédagogique est prêt !
            </h3>
            <p className="text-xs text-[#4F7817] font-medium flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#FF8A00] text-[#FF8A00]" />
              {starCost} étoiles consommées • Fiche IA générée avec succès
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
              saved
                ? "bg-[#65A916] text-white"
                : "bg-white border border-[#E8DFC9] text-[#35180D] hover:bg-[#F3ECFF] hover:border-[#6535E8]"
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 text-[#6535E8]" />}
            <span>{saved ? "Sauvegardé !" : "Sauvegarder"}</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={loadingPdf}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8DFC9] text-[#35180D] hover:bg-[#F4F9E8] hover:border-[#65A916] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            title="Télécharger la fiche au format PDF A4"
          >
            {loadingPdf ? <Loader2 className="w-4 h-4 animate-spin text-[#65A916]" /> : <FileDown className="w-4 h-4 text-[#65A916]" />}
            <span>PDF</span>
          </button>

          {/* Export Word (DOCX) Button - Conditional on isContentTextual */}
          {showDocx && (
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={loadingDocx}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8DFC9] text-[#35180D] hover:bg-[#F3ECFF] hover:border-[#6535E8] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              title="Exporter la fiche au format Microsoft Word (.docx)"
            >
              {loadingDocx ? <Loader2 className="w-4 h-4 animate-spin text-[#6535E8]" /> : <FileText className="w-4 h-4 text-[#6535E8]" />}
              <span>Word (.docx)</span>
            </button>
          )}

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            disabled={loadingWa}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366] hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            title="Partager le lien de la fiche sur WhatsApp"
          >
            {loadingWa ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            <span>WhatsApp</span>
          </button>

          {/* New Activity Reset */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#6535E8] text-white font-bold text-xs sm:text-sm hover:bg-[#542AC4] transition-all cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle activité</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="bg-white border border-[#EDE3D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-[#EDE3D5] pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F9E8] text-[#65A916] rounded-full text-xs font-bold border border-[#65A916]/30">
              <GraduationCap className="w-3.5 h-3.5" />
              Programme Officiel MENA Burkina Faso
            </span>
            <span className="text-xs font-bold text-[#90847B]">
              Format A4 Imprimable Noir & Blanc
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#35180D] leading-tight">
            {activityTitle}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[#7A6A5E] pt-1">
            <span className="flex items-center gap-1.5 bg-[#FFF8EE] px-3 py-1 rounded-xl border border-[#F0E7DA]">
              <Users className="w-4 h-4 text-[#FF8A00]" />
              Cible : <strong className="text-[#35180D]">{level}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-[#F3ECFF] px-3 py-1 rounded-xl border border-[#E0D2FC]">
              <Clock className="w-4 h-4 text-[#6535E8]" />
              Durée : <strong className="text-[#35180D]">{duration} minutes</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-[#F4F9E8] px-3 py-1 rounded-xl border border-[#D5EAA9]">
              <ShieldCheck className="w-4 h-4 text-[#65A916]" />
              Généré par Petit Baobab AI
            </span>
          </div>
        </div>

        {/* Real Generated Content from OpenAI */}
        {generatedText ? (
          <div className="p-5 bg-[#FFFDF8] border border-[#E8DFC9] rounded-2xl text-sm text-[#35180D] font-medium leading-relaxed whitespace-pre-line space-y-4">
            {generatedText}
          </div>
        ) : (
          <div className="p-5 bg-[#FFFDF8] border border-[#E8DFC9] rounded-2xl text-sm text-[#35180D] font-medium leading-relaxed">
            Contenu pédagogique prêt à l'exportation.
          </div>
        )}

        {/* Footer Link to History */}
        {saved && (
          <div className="text-center pt-2">
            <Link
              href="/school/assistant/history"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6535E8] hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              Retrouver cette fiche dans votre Historique →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
