"use client";

import React, { useState } from "react";
import { PromptTemplate } from "@/lib/assistant/prompts";
import { Sparkles, Save, Printer, PlusCircle, CheckCircle2, Star, BookOpen, Clock, Users, GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface GenerationResultProps {
  prompt: PromptTemplate;
  formValues: Record<string, string>;
  customNeed: string;
  generatedText?: string;
  starCost?: number;
  onSaveHistory: (title: string, details: string) => void;
  onReset: () => void;
}

export default function GenerationResult({
  prompt,
  formValues,
  customNeed,
  generatedText,
  starCost = 5,
  onSaveHistory,
  onReset,
}: GenerationResultProps) {
  const [saved, setSaved] = useState(false);

  const topic = formValues.theme || formValues.sujet_prioritaire || formValues.materiel_disponible || customNeed || "Découverte et éveil";
  const level = formValues.niveau || formValues.tranche_age || (formValues.age_en_mois ? `${formValues.age_en_mois} mois` : `${formValues.age || 4} ans`);
  const duration = formValues.duree || "30";

  const activityTitle = `Fiche Pédagogique : ${prompt.label} — ${topic}`;

  const handleSave = () => {
    onSaveHistory(activityTitle, generatedText || `Niveau: ${level} | Durée: ${duration} min`);
    setSaved(true);
  };

  const handlePrint = () => {
    window.print();
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
              saved
                ? "bg-[#65A916] text-white"
                : "bg-white border border-[#E8DFC9] text-[#35180D] hover:bg-[#F3ECFF] hover:border-[#6535E8]"
            }`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 text-[#6535E8]" />}
            <span>{saved ? "Sauvegardé !" : "Sauvegarder"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8DFC9] text-[#35180D] hover:bg-[#FFF8EE] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#FF8A00]" />
            <span>Imprimer (A4)</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6535E8] text-white font-bold text-xs sm:text-sm hover:bg-[#542AC4] transition-all cursor-pointer shadow-xs"
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
          <>
            {/* Structured Fallback Sections */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-[#35180D] flex items-center gap-2 border-b border-[#F0E7DA] pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6535E8]" />
                1. Objectifs pédagogiques
              </h3>
              <ul className="list-disc list-inside text-sm text-[#544375] space-y-1 pl-2 font-medium">
                <li>Développer l'observation attentive et la curiosité naturelle des enfants.</li>
                <li>Stimuler le langage oral à travers la désignation et le questionnement.</li>
                <li>Favoriser la motricité fine et la coordination geste-regard par la manipulation.</li>
                <li>Renforcer le respect mutuel et l'écoute au sein du groupe classe.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-[#35180D] flex items-center gap-2 border-b border-[#F0E7DA] pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]" />
                2. Matériel nécessaire (100% Local & Accessible)
              </h3>
              <div className="p-4 bg-[#FFFDF8] border border-[#E8DFC9] rounded-2xl text-sm text-[#35180D] font-medium space-y-1">
                <p>• Calebasses, coupelles ou récipients en plastique recyclés.</p>
                <p>• Graines locales (haricot, maïs, neem) ou petits bâtonnets de bois.</p>
                <p>• Bandes de tissus colorés (motifs Faso dan fani ou cotonnade).</p>
                <p>• Fiche imprimée ou ardoises d'exercice.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-base text-[#35180D] flex items-center gap-2 border-b border-[#F0E7DA] pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65A916]" />
                3. Déroulé pas-à-pas en 3 temps
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-[#FFF9EE] border-l-4 border-[#FF8A00] rounded-r-2xl space-y-1">
                  <h4 className="font-bold text-sm text-[#FF8A00]">
                    Étape 1 : Accueil et Regroupement (5 à 10 minutes)
                  </h4>
                  <p className="text-xs sm:text-sm text-[#554A42] font-medium leading-relaxed">
                    Rassemblez les enfants en cercle sur la nappe. Introduisez le sujet avec une devinette ou une comptine courte. Présentez le matériel local posé au centre du cercle et laissez quelques instants d'observation libre.
                  </p>
                </div>

                <div className="p-4 bg-[#F3ECFF] border-l-4 border-[#6535E8] rounded-r-2xl space-y-1">
                  <h4 className="font-bold text-sm text-[#6535E8]">
                    Étape 2 : Activité Guidée & Manipulation (15 à 20 minutes)
                  </h4>
                  <p className="text-xs sm:text-sm text-[#43355C] font-medium leading-relaxed">
                    Invitez les enfants à effectuer le geste demandé (tri, tracés, manipulation ou jeu d'association). Circulez dans le groupe pour encourager la verbalisation : <em>"Qu'as-tu choisi ?"</em>, <em>"De quelle couleur est ton tissu ?"</em>.
                  </p>
                </div>

                <div className="p-4 bg-[#F4F9E8] border-l-4 border-[#65A916] rounded-r-2xl space-y-1">
                  <h4 className="font-bold text-sm text-[#65A916]">
                    Étape 3 : Retour au calme & Rangement (5 minutes)
                  </h4>
                  <p className="text-xs sm:text-sm text-[#2F5204] font-medium leading-relaxed">
                    Proposez un signal sonore doux (tapotement sur calebasse) pour marquer la fin de l'activité. Les enfants rangent le matériel ensemble dans le panier de la classe puis inspirent profondément pour préparer le temps suivant.
                  </p>
                </div>
              </div>
            </div>
          </>
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
