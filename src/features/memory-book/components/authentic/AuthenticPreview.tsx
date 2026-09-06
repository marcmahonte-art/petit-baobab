"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { ArrowLeft, Printer, Download, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface AuthenticPreviewProps {
  book: MemoryBookRecord;
}

export const AuthenticPreview: React.FC<AuthenticPreviewProps> = ({ book }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Extraire les réponses enregistrées
  const answers: Record<string, string> =
    (book as any).answers_data ||
    (Array.isArray(book.pages_data) && (book.pages_data as any).answers) ||
    {};

  // Si des données étaient stockées au format page[] antérieur :
  if (Array.isArray(book.pages_data)) {
    book.pages_data.forEach((p) => {
      p.elements?.forEach((el) => {
        if (el.textData?.value && !answers[el.id]) {
          answers[el.id] = el.textData.value;
        }
        if (el.photoData?.url && !answers[el.id]) {
          answers[el.id] = el.photoData.url;
        }
      });
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfDownloaded(false);
      setProgress(10);
      setStatusMsg("Préparation du document PDF...");

      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const convertImgSrcToDataUrl = async (container: HTMLElement) => {
        const imgEls = container.querySelectorAll('img');
        const promises = Array.from(imgEls).map(async (img) => {
          const src = img.getAttribute('src') || '';
          if (src.startsWith('data:')) return;
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            const reader = new FileReader();
            const dataUrl: string = await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            img.setAttribute('src', dataUrl);
          } catch (e) {
            console.warn('Impossible de convertir l\'image en data URL', src, e);
          }
        });
        await Promise.all(promises);
      };

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageElements = document.querySelectorAll(".preview-page-sheet");
      const total = pageElements.length;

      for (let i = 0; i < total; i++) {
        const el = pageElements[i] as HTMLElement;
        await convertImgSrcToDataUrl(el);

        setProgress(Math.round(((i + 1) / total) * 90));
        setStatusMsg(`Capture de la page ${i + 1}/${total}...`);

        try {
          const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#FBF6EC",
            logging: false,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, Math.min(297, imgHeight));
        } catch (e) {
          console.error(`Erreur lors de la capture de la page ${i + 1}`, e);
        }
      }

      setProgress(100);
      setStatusMsg("Finalisation...");
      const cleanTitle = (answers["p-prenom"] ? `Cahier_de_${answers["p-prenom"]}` : book.title || "Mon_cahier_de_souvenirs").replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`${cleanTitle}.pdf`);

      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error("Erreur PDF:", err);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setIsGeneratingPdf(false);
      setProgress(0);
      setStatusMsg("");
    }
  };

  return (
    <div className="w-full min-h-screen py-6 px-3 md:px-6 flex flex-col items-center select-none font-['Quicksand',sans-serif] bg-[#EFE6D2]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Quicksand:wght@400;500;600;700&display=swap');

        .caveat-font {
          font-family: 'Caveat', cursive, sans-serif;
        }

        .quicksand-font {
          font-family: 'Quicksand', sans-serif;
        }

        .preview-page-sheet {
          width: 100%;
          max-width: 800px;
          min-height: 1050px;
          background: #fbf6ec;
          border-radius: 14px;
          box-shadow: 0 16px 40px -10px rgba(58, 54, 46, 0.25);
          border: 2px solid #3a362e;
          padding: 44px 48px;
          position: relative;
          overflow: hidden;
          margin-bottom: 40px;
        }

        @media print {
          body, html, .preview-page-sheet {
            background: #fbf6ec !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .preview-page-sheet {
            page-break-after: always;
            break-after: page;
            min-height: 100vh;
            padding: 30px;
          }
        }
      `}</style>

      {/* Barre d'outils (masquée lors de l'impression) */}
      <div className="no-print sticky top-3 z-40 w-full max-w-[800px] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-[#3A362E] shadow-lg mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/learn/souvenirs/${book.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3EBDA] text-[#3A362E] font-bold text-xs md:text-sm border-2 border-[#3A362E] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Éditer le cahier</span>
        </Link>

        <div className="text-center">
          <span className="caveat-font text-2xl font-bold text-[#7A3B1D]">
            Aperçu des 10 pages
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Imprimer */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border-2 border-[#3A362E] hover:bg-[#F3EBDA] text-[#3A362E] font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>

          {/* Bouton PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 rounded-xl bg-[#F7941D] hover:bg-[#e08213] border-2 border-[#3A362E] text-white font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 disabled:opacity-60"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>PDF ({progress}%)</span>
              </>
            ) : pdfDownloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Téléchargé !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message de chargement PDF */}
      {isGeneratingPdf && (
        <div className="no-print w-full max-w-[800px] mb-6 p-4 rounded-2xl bg-white border-2 border-[#F7941D] shadow-md flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#F7941D]" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-[#3A362E] mb-1">
              <span>{statusMsg || "Génération du PDF..."}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#F3EBDA] rounded-full overflow-hidden">
              <div className="h-full bg-[#F7941D] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RENDU DES 10 PAGES DU CAHIER EN FEUILLES PLEINE PAGE POUR VISUALISATION & IMPRESSION
      ========================================================================= */}

      {/* 1. COUVERTURE */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-16 h-12 absolute top-6 right-8 opacity-90" viewBox="0 0 64 48">
            <rect x="2" y="12" width="60" height="32" rx="4" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
            <rect x="20" y="4" width="14" height="10" rx="2" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
            <circle cx="32" cy="28" r="11" stroke="#3A362E" strokeWidth="2" fill="#fff" />
            <circle cx="32" cy="28" r="5" fill="#3A362E" />
            <circle cx="52" cy="18" r="3" fill="#F7941D" stroke="#3A362E" />
          </svg>

          <div className="w-[260px] h-[260px] rounded-full bg-white border-[5px] border-[#3A362E] flex flex-col items-center justify-center text-center mx-auto mt-6 shadow-md">
            <div className="caveat-font text-4xl font-bold text-[#7A3B1D] leading-tight">
              Mon cahier<br />de souvenirs
            </div>
            <div className="text-[#FBB03B] tracking-[4px] text-sm mt-2">♦ ♦ ♦ ♦ ♦ ♦ ♦</div>
            <div className="caveat-font text-2xl font-bold text-[#F7941D] mt-2">
              {answers["cover-year"] || book.school_year || "2025 - 2026"}
            </div>
          </div>

          <div className="flex justify-center gap-10 mt-14">
            {/* Polaroid Mes amis */}
            <div className="bg-white border-2 border-[#3A362E] p-2.5 pb-7 w-[160px] shadow-md transform -rotate-3 text-center">
              <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-xs text-[#8a7f66]">
                {answers["cover-friends"] ? (
                  <img src={answers["cover-friends"]} alt="Mes amis" className="w-full h-full object-cover" />
                ) : (
                  <span>Mes amis</span>
                )}
              </div>
              <div className="caveat-font font-bold text-base text-[#5B5648] mt-2">Mes amis</div>
            </div>

            {/* Polaroid Ma maîtresse / Mon maître */}
            <div className="bg-white border-2 border-[#3A362E] p-2.5 pb-7 w-[160px] shadow-md transform rotate-2 text-center">
              <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-xs text-[#8a7f66]">
                {answers["cover-teacher"] ? (
                  <img src={answers["cover-teacher"]} alt="Ma maîtresse / Mon maître" className="w-full h-full object-cover" />
                ) : (
                  <span>Photo</span>
                )}
              </div>
              <div className="caveat-font font-bold text-base text-[#5B5648] mt-2">
                {answers["cover-teacher-label"] || "Ma maîtresse / Mon maître"}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-10">
          Petit Baobab — Page 1 / 10
        </div>
      </div>

      {/* 2. MON PORTRAIT */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-6 h-14 absolute top-6 right-8 rotate-12 opacity-90" viewBox="0 0 24 60">
            <rect x="6" y="4" width="12" height="44" rx="2" stroke="#3A362E" strokeWidth="2" fill="#fff" />
            <path d="M6 48 L12 58 L18 48 Z" stroke="#3A362E" strokeWidth="2" fill="#FBB03B" />
          </svg>

          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] mb-1">Mon portrait</h1>
          <div className="text-sm font-semibold text-[#8a7f66] mb-6">Complète les pointillés — clique sur le polaroid pour ta photo</div>

          <div className="flex gap-8 items-start mb-8">
            <div className="flex-1">
              {[
                { label: "Mon prénom :", val: answers["p-prenom"] },
                { label: "Mon anniversaire :", val: answers["p-anniv"] },
                { label: "Mon âge :", val: answers["p-age"] },
                { label: "Ma taille :", val: answers["p-taille"] },
                { label: "Couleur préférée :", val: answers["p-couleur"] },
                { label: "Plat préféré :", val: answers["p-plat"] },
                { label: "Animal préféré :", val: answers["p-animal"] },
                { label: "Plus tard, je serai :", val: answers["p-metier"] },
              ].map((row, idx) => (
                <div key={idx} className="flex items-baseline gap-2 mb-2">
                  <span className="font-bold text-[#5B5648] text-base">{row.label}</span>
                  <span className="caveat-font font-bold text-2xl text-[#0F8B8C] border-b-2 border-dotted border-[#C9BFA9] flex-1 pb-0.5 px-2">
                    {row.val || "…………………………………………"}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-[170px] flex justify-center">
              <div className="bg-white border-2 border-[#3A362E] p-2.5 pb-7 w-full shadow-md transform rotate-2 text-center">
                <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-xs text-[#8a7f66]">
                  {answers["portrait-photo"] ? (
                    <img src={answers["portrait-photo"]} alt="Mon portrait" className="w-full h-full object-cover" />
                  ) : (
                    <span>Ma photo</span>
                  )}
                </div>
                <div className="caveat-font font-bold text-base text-[#5B5648] mt-2">Moi !</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="bg-white border-2 border-[#4C9A2A] rounded-xl p-4 shadow-sm min-h-[140px]">
              <div className="caveat-font font-bold text-2xl text-[#4C9A2A] mb-1">J&apos;adore ❤️</div>
              <p className="caveat-font text-xl text-[#0F8B8C] leading-relaxed">
                {answers["p-adore"] || "……………………………………………………………………………………"}
              </p>
            </div>
            <div className="bg-white border-2 border-[#F7941D] rounded-xl p-4 shadow-sm min-h-[140px]">
              <div className="caveat-font font-bold text-2xl text-[#F7941D] mb-1">Je déteste ❌</div>
              <p className="caveat-font text-xl text-[#0F8B8C] leading-relaxed">
                {answers["p-deteste"] || "……………………………………………………………………………………"}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 2 / 10
        </div>
      </div>

      {/* 3. MON ANNÉE */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-14 h-14 absolute top-6 right-8 opacity-90" viewBox="0 0 60 60">
            <rect x="8" y="10" width="44" height="34" rx="3" stroke="#3A362E" strokeWidth="2" fill="#FBB03B" />
            <rect x="20" y="42" width="20" height="8" fill="#7CC142" stroke="#3A362E" strokeWidth="2" />
          </svg>

          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] mb-1">Mon année</h1>
          <div className="text-sm font-semibold text-[#8a7f66] mb-6">Une année à raconter…</div>

          {[
            { label: "Cette année, classe de :", val: answers["a-classe"] },
            { label: "Ma matière préférée :", val: answers["a-matiere"] },
            { label: "Mon projet préféré :", val: answers["a-projet"] },
            { label: "Ma maîtresse / mon maître était :", val: answers["a-maitresse"] },
          ].map((r, i) => (
            <div key={i} className="flex items-baseline gap-2 mb-3">
              <span className="font-bold text-[#5B5648] text-base">{r.label}</span>
              <span className="caveat-font font-bold text-2xl text-[#0F8B8C] border-b-2 border-dotted border-[#C9BFA9] flex-1 pb-0.5 px-2">
                {r.val || "…………………………………………"}
              </span>
            </div>
          ))}

          <div className="mt-8 space-y-6">
            <div>
              <span className="font-extrabold text-[#5b5648] text-sm block">Mon meilleur souvenir 🌟</span>
              <div className="caveat-font text-2xl text-[#0F8B8C] border-b-2 border-dotted border-[#C9BFA9] min-h-[44px] pt-1">
                {answers["a-souvenir"] || "………………………………………………………………………………………………………………………………"}
              </div>
            </div>

            <div>
              <span className="font-extrabold text-[#5b5648] text-sm block">Le moment le plus rigolo 😂</span>
              <div className="caveat-font text-2xl text-[#0F8B8C] border-b-2 border-dotted border-[#C9BFA9] min-h-[44px] pt-1">
                {answers["a-rigolo"] || "………………………………………………………………………………………………………………………………"}
              </div>
            </div>

            <div>
              <span className="font-extrabold text-[#5b5648] text-sm block">Ce que j&apos;ai appris cette année 💡</span>
              <div className="caveat-font text-2xl text-[#0F8B8C] border-b-2 border-dotted border-[#C9BFA9] min-h-[44px] pt-1">
                {answers["a-appris"] || "………………………………………………………………………………………………………………………………"}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 3 / 10
        </div>
      </div>

      {/* 4. MES CAMARADES (9 polaroids) */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-10 h-8 absolute top-6 right-8 opacity-90" viewBox="0 0 40 30">
            <path d="M10 6 C6 2 0 4 0 10 C0 16 10 22 10 22 C10 22 20 16 20 10 C20 4 14 2 10 6Z" fill="none" stroke="#3A362E" strokeWidth="1.6" />
            <path d="M26 4 C22 0 16 2 16 8 C16 14 26 20 26 20 C26 20 36 14 36 8 C36 2 30 0 26 4Z" fill="#F7941D" stroke="#3A362E" strokeWidth="1.6" />
          </svg>

          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] mb-1">Mes camarades</h1>
          <div className="text-sm font-semibold text-[#8a7f66] mb-6">Une photo pour chaque copain(e) !</div>

          <div className="grid grid-cols-3 gap-6 justify-items-center mt-6">
            {[
              { key: "c-rigolo", label: "Le plus rigolo", rot: "-rotate-2" },
              { key: "c-serieux", label: "Le plus sérieux", rot: "rotate-2" },
              { key: "c-discret", label: "Le plus discret", rot: "-rotate-1" },
              { key: "c-air", label: "Tête en l'air", rot: "rotate-3" },
              { key: "c-genereux", label: "Le plus généreux", rot: "-rotate-2" },
              { key: "c-filou", label: "Le plus filou", rot: "rotate-1" },
              { key: "c-gourmand", label: "Le plus gourmand", rot: "-rotate-3" },
              { key: "c-gentil", label: "Le plus gentil", rot: "rotate-2" },
              { key: "c-best", label: "Mon bestfriend", rot: "-rotate-1" },
            ].map((item) => (
              <div key={item.key} className={`bg-white border-2 border-[#3A362E] p-2 pb-5 w-[140px] shadow-sm transform ${item.rot} text-center`}>
                <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-[11px] text-[#8a7f66]">
                  {answers[item.key] ? (
                    <img src={answers[item.key]} alt={item.label} className="w-full h-full object-cover" />
                  ) : (
                    <span>Photo</span>
                  )}
                </div>
                <div className="caveat-font font-bold text-sm text-[#5B5648] mt-1.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 4 / 10
        </div>
      </div>

      {/* 5. LES PETITS MOTS */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-10 h-10 absolute top-6 left-8 opacity-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="10" fill="#FBB03B" stroke="#3A362E" strokeWidth="2" />
          </svg>
          <svg className="w-14 h-14 absolute top-6 right-8 opacity-90" viewBox="0 0 60 60">
            <path d="M6 26 A24 24 0 0 1 54 26 Z" fill="#F7941D" stroke="#3A362E" strokeWidth="2" />
            <line x1="30" y1="26" x2="30" y2="54" stroke="#3A362E" strokeWidth="2" />
          </svg>

          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] text-center mb-1">Les petits mots</h1>
          <div className="text-sm font-semibold text-[#8a7f66] text-center mb-6">Colle ou écris ici les petits mots de tes copains, de ta famille…</div>

          <div className="caveat-font text-2xl text-[#0F8B8C] leading-[36px] bg-[repeating-linear-gradient(transparent,transparent_34px,#c9bfa9_36px)] min-h-[560px] p-4">
            {answers["mots"] || "………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………"}
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 5 / 10
        </div>
      </div>

      {/* 6. MES LIVRES PRÉFÉRÉS */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] text-center mb-1">Mes livres préférés</h1>
          <div className="text-sm font-semibold text-[#8a7f66] text-center mb-8">Note les histoires que tu as adorées cette année</div>

          <div className="flex justify-center gap-12 mt-10">
            <div className="w-[200px] min-h-[300px] border-[3px] border-[#3A362E] rounded-2xl bg-white p-5 text-center relative shadow-md">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F3EBDA] border-2 border-[#3A362E] absolute top-3 left-1/2 -translate-x-1/2" />
              <div className="text-4xl mt-4 mb-2">📚</div>
              <div className="caveat-font font-bold text-2xl text-[#7A3B1D] border-b-2 border-dotted border-[#C9BFA9] pb-1 mb-3">
                {answers["tag-livres-title"] ?? "Mes livres préférés"}
              </div>
              <div className="caveat-font text-xl text-[#0F8B8C] leading-relaxed">
                {answers["tag-livres-text"] || "……………………………………………………………………………………"}
              </div>
            </div>

            <div className="w-[200px] min-h-[300px] border-[3px] border-[#3A362E] rounded-2xl bg-white p-5 text-center relative shadow-md">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F3EBDA] border-2 border-[#3A362E] absolute top-3 left-1/2 -translate-x-1/2" />
              <div className="text-4xl mt-4 mb-2">✏️</div>
              <div className="caveat-font font-bold text-2xl text-[#7A3B1D] border-b-2 border-dotted border-[#C9BFA9] pb-1 mb-3">
                {answers["tag-livres2-title"] || "Mes lectures"}
              </div>
              <div className="caveat-font text-xl text-[#0F8B8C] leading-relaxed">
                {answers["tag-livres2-text"] || "……………………………………………………………………………………"}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 6 / 10
        </div>
      </div>

      {/* 7. MES FIERTÉS */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] text-center mb-1">Mes fiertés</h1>
          <div className="text-sm font-semibold text-[#8a7f66] text-center mb-8">Ce dont tu es fier(ère) cette année</div>

          <div className="flex justify-center gap-12 mt-10">
            <div className="w-[200px] min-h-[300px] border-[3px] border-[#3A362E] rounded-2xl bg-white p-5 text-center relative shadow-md">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F3EBDA] border-2 border-[#3A362E] absolute top-3 left-1/2 -translate-x-1/2" />
              <div className="text-4xl mt-4 mb-2">🏅</div>
              <div className="caveat-font font-bold text-2xl text-[#7A3B1D] border-b-2 border-dotted border-[#C9BFA9] pb-1 mb-3">
                {answers["tag-fiertes-title"] ?? "Mes fiertés"}
              </div>
              <div className="caveat-font text-xl text-[#0F8B8C] leading-relaxed">
                {answers["tag-fiertes-text"] || "……………………………………………………………………………………"}
              </div>
            </div>

            <div className="w-[200px] min-h-[300px] border-[3px] border-[#3A362E] rounded-2xl bg-white p-5 text-center relative shadow-md">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F3EBDA] border-2 border-[#3A362E] absolute top-3 left-1/2 -translate-x-1/2" />
              <div className="text-4xl mt-4 mb-2">⭐</div>
              <div className="caveat-font font-bold text-2xl text-[#7A3B1D] border-b-2 border-dotted border-[#C9BFA9] pb-1 mb-3">
                {answers["tag-fiertes2-title"] || "Mes réussites"}
              </div>
              <div className="caveat-font text-xl text-[#0F8B8C] leading-relaxed">
                {answers["tag-fiertes2-text"] || "……………………………………………………………………………………"}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 7 / 10
        </div>
      </div>

      {/* 8. PROGRAMME DES VACANCES */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] text-center mb-1">Mon programme des vacs</h1>
          <div className="text-sm font-semibold text-[#8a7f66] text-center mb-8">Qu&apos;est-ce que tu as prévu pour les vacances ?</div>

          <div className="flex flex-col items-center gap-8 mt-6">
            <div className="w-[260px] h-[260px] rounded-full border-[5px] border-[#3A362E] bg-white flex items-center justify-center p-6 text-center shadow-md">
              <span className="caveat-font font-bold text-2xl text-[#0F8B8C]">
                {answers["vac-1"] || "🌞 Mes aventures des vacances…"}
              </span>
            </div>
            <div className="w-[260px] h-[260px] rounded-full border-[5px] border-[#3A362E] bg-white flex items-center justify-center p-6 text-center shadow-md">
              <span className="caveat-font font-bold text-2xl text-[#0F8B8C]">
                {answers["vac-2"] || "Et encore plein de beaux projets…"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 8 / 10
        </div>
      </div>

      {/* 9. MES PHOTOS */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-16 h-12 absolute top-6 right-8 opacity-90" viewBox="0 0 64 48">
            <rect x="2" y="12" width="60" height="32" rx="4" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
            <rect x="20" y="4" width="14" height="10" rx="2" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
            <circle cx="32" cy="28" r="11" stroke="#3A362E" strokeWidth="2" fill="#fff" />
            <circle cx="32" cy="28" r="5" fill="#3A362E" />
            <circle cx="52" cy="18" r="3" fill="#F7941D" stroke="#3A362E" />
          </svg>

          <h1 className="caveat-font text-5xl font-bold text-[#7A3B1D] mb-1">Mes photos</h1>
          <div className="text-sm font-semibold text-[#8a7f66] mb-8">Ajoute jusqu&apos;à 6 photos souvenirs de ton année</div>

          <div className="grid grid-cols-3 gap-6 justify-items-center mt-6">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const key = `photo-${num}`;
              return (
                <div key={key} className="bg-white border-2 border-[#3A362E] p-2.5 pb-6 w-[160px] shadow-sm text-center">
                  <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-xs text-[#8a7f66]">
                    {answers[key] ? (
                      <img src={answers[key]} alt={`Photo ${num}`} className="w-full h-full object-cover" />
                    ) : (
                      <span>Photo {num}</span>
                    )}
                  </div>
                  <div className="caveat-font font-bold text-base text-[#5B5648] mt-2">Photo {num}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 9 / 10
        </div>
      </div>

      {/* 10. SECRETS */}
      <div className="preview-page-sheet flex flex-col justify-between">
        <div>
          <svg className="w-10 h-14 absolute bottom-12 left-8 opacity-90" viewBox="0 0 40 60">
            <rect x="12" y="46" width="16" height="12" fill="#3A362E" />
            <path d="M18 46 V16 M18 30 h-8 v-10 M18 24 h8 v-8" stroke="#7CC142" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>

          <h1 className="caveat-font text-5xl font-bold text-[#8a2f33] mb-1">Mes petits secrets</h1>
          <div className="text-sm font-semibold text-[#8a7f66] mb-8">Top secret… 🤫</div>

          <div className="caveat-font text-2xl text-[#0F8B8C] leading-[38px] border-2 border-dashed border-[#C9BFA9] rounded-2xl p-6 min-h-[460px] bg-white/70">
            {answers["secrets"] || "…………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………"}
          </div>
        </div>

        <div className="text-center text-xs font-bold text-[#8a7f66] mt-8">
          Petit Baobab — Page 10 / 10
        </div>
      </div>
    </div>
  );
};
