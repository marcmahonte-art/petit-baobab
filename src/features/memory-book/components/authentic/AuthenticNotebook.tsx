"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { memoryBookService } from "../../services/memoryBookService";
import { memoryStorageService } from "../../services/memoryStorageService";
import { ArrowLeft, Eye, Printer, Save, Loader2, Sparkles, Trash2, Camera } from "lucide-react";

interface AuthenticNotebookProps {
  initialBook: MemoryBookRecord;
  profileId: string;
}

export const PAGES_CONFIG = [
  { id: "cover", label: "Couverture" },
  { id: "portrait", label: "Mon portrait" },
  { id: "annee", label: "Mon année" },
  { id: "camarades", label: "Camarades" },
  { id: "mots", label: "Petits mots" },
  { id: "livres", label: "Mes livres" },
  { id: "fiertes", label: "Mes fiertés" },
  { id: "vacances", label: "Programme vacs" },
  { id: "photos", label: "Mes photos" },
  { id: "secrets", label: "Secrets" },
];

export const AuthenticNotebook: React.FC<AuthenticNotebookProps> = ({
  initialBook,
  profileId,
}) => {
  const [activePage, setActivePage] = useState("cover");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Tes réponses sont enregistrées automatiquement");
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Charger les données initiales du livre
  useEffect(() => {
    if (initialBook) {
      const existingAnswers: Record<string, string> =
        (initialBook as any).answers_data ||
        (Array.isArray(initialBook.pages_data) && (initialBook.pages_data as any).answers) ||
        {};

      // Si pages_data contenait des données structurées antérieures, on fait le pont
      if (Array.isArray(initialBook.pages_data)) {
        initialBook.pages_data.forEach((p) => {
          p.elements?.forEach((el) => {
            if (el.textData?.value) {
              existingAnswers[el.id] = el.textData.value;
            }
            if (el.photoData?.url) {
              existingAnswers[el.id] = el.photoData.url;
            }
          });
        });
      }

      if (initialBook.school_year && !existingAnswers["cover-year"]) {
        existingAnswers["cover-year"] = initialBook.school_year;
      }

      setAnswers(existingAnswers);
    }
  }, [initialBook]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      await saveBook();
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasChanges, answers]);

  const saveBook = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("Enregistrement...");

      const updated = await memoryBookService.updateBook(initialBook.id, {
        school_year: answers["cover-year"] || initialBook.school_year,
        pages_data: { answers } as any,
        status: "in_progress",
      });

      // Synchroniser également dans answers_data si applicable
      (updated as any).answers_data = answers;

      setHasChanges(false);
      setSaveStatus("Enregistré ✓");
      setTimeout(() => {
        setSaveStatus("Tes réponses sont enregistrées automatiquement");
      }, 2500);
    } catch (e) {
      console.error("Erreur de sauvegarde:", e);
      setSaveStatus("Erreur de sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingKey(key);
      const res = await memoryStorageService.uploadPhoto(file, profileId, initialBook.id, key);
      handleChange(key, res.url);
    } catch (err) {
      console.error("Erreur upload:", err);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRemovePhoto = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange(key, "");
  };

  return (
    <div className="authentic-cahier-container w-full min-h-screen py-6 px-3 md:px-6 flex flex-col items-center select-none font-['Quicksand',sans-serif]">
      <style jsx global>{`
        :root {
          --pb-paper: #fbf6ec;
          --pb-paper-dark: #f3ebda;
          --pb-ink: #3a362e;
          --pb-brown: #7a3b1d;
          --pb-orange: #f7941d;
          --pb-gold: #fbb03b;
          --pb-leaf: #7cc142;
          --pb-leaf-dark: #4c9a2a;
          --pb-teal: #0f8b8c;
          --pb-olive: #8bc34a;
          --pb-line: #c9bfa9;
          --pb-tab-bg: #ffffff;
        }

        .caveat-font {
          font-family: 'Caveat', cursive, sans-serif;
        }

        .quicksand-font {
          font-family: 'Quicksand', sans-serif;
        }

        .cahier-book {
          position: relative;
          background: var(--pb-paper);
          border-radius: 16px;
          box-shadow: 0 20px 50px -15px rgba(58, 54, 46, 0.35), 0 2px 0 rgba(58, 54, 46, 0.06) inset;
          min-height: 680px;
          display: flex;
          overflow: hidden;
          border: 2.5px solid var(--pb-ink);
        }

        .cahier-spiral {
          width: 38px;
          background: linear-gradient(90deg, var(--pb-paper-dark), var(--pb-paper) 60%);
          border-right: 2px dashed var(--pb-line);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          padding: 24px 0;
          flex-shrink: 0;
        }

        .cahier-spiral-ring {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--pb-ink);
          box-shadow: inset 0 0 0 3px var(--pb-paper);
        }

        .cahier-page-area {
          flex: 1;
          position: relative;
          padding: 32px 36px 40px 34px;
          min-width: 0;
          background: var(--pb-paper);
        }

        .cahier-title {
          font-family: 'Caveat', cursive;
          font-weight: 700;
          font-size: 42px;
          line-height: 1;
          margin: 0 0 4px 0;
          color: var(--pb-brown);
        }

        .cahier-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: #8a7f66;
          margin-bottom: 20px;
        }

        .cahier-field-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 11px 0;
          font-size: 15px;
        }

        .cahier-field-row label {
          white-space: nowrap;
          font-weight: 700;
          color: #5b5648;
        }

        .cahier-fill {
          flex: 1;
          min-width: 40px;
          border: none;
          background: transparent;
          border-bottom: 2px dotted var(--pb-line);
          font-family: 'Caveat', cursive;
          font-weight: 700;
          font-size: 23px;
          color: var(--pb-teal);
          padding: 2px 6px;
          outline: none;
          transition: border-color 0.2s;
        }

        .cahier-fill:focus {
          border-bottom-color: var(--pb-orange);
        }

        .cahier-fill::placeholder {
          font-weight: 400;
          font-size: 14px;
          color: #b9b09c;
          font-family: 'Quicksand', sans-serif;
        }

        .cahier-fill-block {
          display: block;
          width: 100%;
          min-height: 60px;
          resize: vertical;
          border: none;
          border-bottom: 2px dotted var(--pb-line);
          background: transparent;
          font-family: 'Caveat', cursive;
          font-weight: 700;
          font-size: 21px;
          color: var(--pb-teal);
          outline: none;
          padding: 4px 6px;
          margin-top: 4px;
        }

        .cahier-polaroid {
          background: #fff;
          border: 1.5px solid #ddd6c4;
          box-shadow: 0 6px 14px -5px rgba(0, 0, 0, 0.22);
          padding: 8px 8px 26px 8px;
          width: 146px;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s;
          display: inline-block;
          border-radius: 3px;
        }

        .cahier-polaroid:hover {
          transform: translateY(-3px) rotate(0deg) !important;
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
        }

        .cahier-polaroid .cahier-frame {
          width: 100%;
          aspect-ratio: 1/1;
          background: #f2efe6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #a89f88;
          font-size: 11px;
          text-align: center;
          font-weight: 700;
          border-radius: 2px;
          position: relative;
        }

        .cahier-polaroid .cahier-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cahier-polaroid .cahier-cap {
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 12px;
          font-weight: 800;
          color: #5b5648;
          font-family: 'Caveat', cursive;
        }

        .cahier-tag-card {
          width: 160px;
          min-height: 220px;
          border: 3px solid var(--pb-ink);
          border-radius: 16px;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          padding: 16px 12px 14px 12px;
          position: relative;
          box-shadow: 0 6px 0 rgba(58, 54, 46, 0.08);
        }

        .cahier-tag-card .cahier-hole {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: var(--pb-paper-dark);
          border: 2px solid var(--pb-ink);
          position: absolute;
          top: 10px;
          left: calc(50% - 6.5px);
        }

        .cahier-tag-title {
          border: none;
          background: transparent;
          text-align: center;
          font-family: 'Caveat', cursive;
          font-weight: 700;
          font-size: 21px;
          color: var(--pb-brown);
          width: 100%;
          outline: none;
          border-bottom: 2px dotted var(--pb-line);
          margin-bottom: 8px;
          padding-bottom: 4px;
        }

        .cahier-vac-circle {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          border: 5px solid var(--pb-ink);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 12px auto;
          box-shadow: 0 8px 16px -6px rgba(58, 54, 46, 0.15);
        }

        .cahier-tabs {
          width: 154px;
          border-left: 2px dashed var(--pb-line);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          gap: 7px;
          background: var(--pb-paper-dark);
          overflow-y: auto;
          flex-shrink: 0;
        }

        .cahier-tab-btn {
          background: var(--pb-tab-bg);
          border: 2.5px solid var(--pb-ink);
          border-right: none;
          border-radius: 12px 0 0 12px;
          margin-left: 14px;
          padding: 8px 6px 8px 14px;
          font-family: 'Caveat', cursive;
          font-weight: 700;
          font-size: 19px;
          text-align: left;
          cursor: pointer;
          color: var(--pb-ink);
          transition: transform 0.15s, background 0.15s;
        }

        .cahier-tab-btn:hover {
          transform: translateX(-4px);
        }

        .cahier-tab-btn.active {
          background: #fff;
          transform: translateX(-8px);
          box-shadow: -4px 4px 0 rgba(58, 54, 46, 0.12);
          color: var(--pb-brown);
        }

        .cahier-deco {
          position: absolute;
          opacity: 0.95;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .cahier-book {
            flex-direction: column;
          }
          .cahier-spiral {
            display: none;
          }
          .cahier-tabs {
            flex-direction: row;
            width: 100%;
            overflow-x: auto;
            border-left: none;
            border-top: 2px dashed var(--pb-line);
            padding: 10px 8px;
          }
          .cahier-tab-btn {
            margin-left: 0;
            border-radius: 10px;
            border-right: 2px solid var(--pb-ink);
            white-space: nowrap;
            padding: 6px 12px;
          }
          .cahier-tab-btn.active {
            transform: translateY(-4px);
          }
          .cahier-page-area {
            padding: 24px 18px;
          }
        }
      `}</style>

      {/* Barre d'outils supérieure */}
      <div className="w-full max-w-[960px] flex flex-wrap items-center justify-between gap-3 mb-4 px-2">
        <Link
          href="/learn/souvenirs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-[#3A362E] font-bold text-xs md:text-sm text-[#3A362E] hover:bg-[#F3EBDA] transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mes Cahiers</span>
        </Link>

        {/* Titre central avec police manuscrite Caveat */}
        <div className="text-center">
          <h2 className="caveat-font text-2xl md:text-3xl font-bold text-[#7A3B1D] leading-none">
            {answers["p-prenom"] ? `Cahier de ${answers["p-prenom"]}` : initialBook.title}
          </h2>
          <span className="text-[11px] font-bold text-[#8a7f66]">10 pages souvenirs Petit Baobab</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Sauvegarder */}
          <button
            type="button"
            onClick={saveBook}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#3A362E] font-bold text-xs text-[#3A362E] hover:bg-[#F3EBDA] transition flex items-center gap-1.5 shadow-xs"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F7941D]" /> : <Save className="w-3.5 h-3.5" />}
            <span>Sauvegarder</span>
          </button>

          {/* Bouton Aperçu PDF & Impression */}
          <Link
            href={`/learn/souvenirs/${initialBook.id}/apercu`}
            className="px-4 py-2 rounded-xl bg-[#F7941D] hover:bg-[#e08213] border-2 border-[#3A362E] font-bold text-xs md:text-sm text-white flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu PDF & Impression</span>
          </Link>
        </div>
      </div>

      {/* Conteneur principal du cahier */}
      <div className="w-full max-w-[960px] cahier-book">
        {/* Spirale reliée à gauche */}
        <div className="cahier-spiral" id="spiral">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="cahier-spiral-ring" />
          ))}
        </div>

        {/* Zone de la page active */}
        <div className="cahier-page-area">
          {/* ========================================================
              PAGE 1: COUVERTURE
          ======================================================== */}
          {activePage === "cover" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-16 h-12 top-2 right-4" viewBox="0 0 64 48">
                <rect x="2" y="12" width="60" height="32" rx="4" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
                <rect x="20" y="4" width="14" height="10" rx="2" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
                <circle cx="32" cy="28" r="11" stroke="#3A362E" strokeWidth="2" fill="#fff" />
                <circle cx="32" cy="28" r="5" fill="#3A362E" />
                <circle cx="52" cy="18" r="3" fill="#F7941D" stroke="#3A362E" />
              </svg>

              {/* Grand badge rond de couverture */}
              <div className="w-[230px] h-[230px] rounded-full bg-white border-[5px] border-[#3A362E] flex flex-col items-center justify-center text-center mx-auto my-3 shadow-md">
                <div className="caveat-font text-3xl md:text-4xl font-bold text-[#7A3B1D] leading-tight">
                  Mon cahier<br />de souvenirs
                </div>
                <div className="text-[#FBB03B] tracking-[4px] text-xs mt-1">♦ ♦ ♦ ♦ ♦ ♦ ♦</div>
                <input
                  type="text"
                  className="cahier-fill text-center border-none w-[170px] text-lg text-[#F7941D] mt-1 font-bold"
                  placeholder="Année ex : 2025 - 2026"
                  value={answers["cover-year"] || ""}
                  onChange={(e) => handleChange("cover-year", e.target.value)}
                />
              </div>

              {/* Deux polaroids centraux */}
              <div className="flex flex-wrap gap-6 justify-center mt-6">
                {/* Polaroid Mes amis */}
                <label className="cahier-polaroid transform -rotate-2">
                  <div className="cahier-frame">
                    {uploadingKey === "cover-friends" ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#F7941D]" />
                    ) : answers["cover-friends"] ? (
                      <>
                        <img src={answers["cover-friends"]} alt="Mes amis" />
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto("cover-friends", e)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 p-2">
                        <Camera className="w-5 h-5 text-[#8a7f66]" />
                        <span>Mes amis (photo)</span>
                      </div>
                    )}
                  </div>
                  <div className="cahier-cap">Mes amis</div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload("cover-friends", e)}
                  />
                </label>

                {/* Polaroid Ma maîtresse / Mon maître */}
                <label className="cahier-polaroid transform rotate-2">
                  <div className="cahier-frame">
                    {uploadingKey === "cover-teacher" ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#F7941D]" />
                    ) : answers["cover-teacher"] ? (
                      <>
                        <img src={answers["cover-teacher"]} alt="Ma maîtresse / Mon maître" />
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto("cover-teacher", e)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 p-2">
                        <Camera className="w-5 h-5 text-[#8a7f66]" />
                        <span>Ma maîtresse / Mon maître</span>
                      </div>
                    )}
                  </div>
                  <input
                    className="cahier-fill absolute bottom-1 left-2 right-2 text-center border-none text-xs text-[#5B5648] font-bold"
                    placeholder="Ma maîtresse / Mon maître"
                    value={answers["cover-teacher-label"] || ""}
                    onChange={(e) => handleChange("cover-teacher-label", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload("cover-teacher", e)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 2: MON PORTRAIT
          ======================================================== */}
          {activePage === "portrait" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-6 h-14 top-2 right-6 rotate-12" viewBox="0 0 24 60">
                <rect x="6" y="4" width="12" height="44" rx="2" stroke="#3A362E" strokeWidth="2" fill="#fff" />
                <path d="M6 48 L12 58 L18 48 Z" stroke="#3A362E" strokeWidth="2" fill="#FBB03B" />
              </svg>

              <h1 className="cahier-title">Mon portrait</h1>
              <div className="cahier-subtitle">Complète les pointillés — clique sur le polaroid pour ta photo</div>

              <div className="flex flex-wrap gap-6 items-start">
                {/* Colonne gauche des informations */}
                <div className="flex-1 min-w-[240px]">
                  <div className="cahier-field-row">
                    <label>Mon prénom :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-prenom"] || ""}
                      onChange={(e) => handleChange("p-prenom", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Mon anniversaire :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-anniv"] || ""}
                      onChange={(e) => handleChange("p-anniv", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Mon âge :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-age"] || ""}
                      onChange={(e) => handleChange("p-age", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Ma taille :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-taille"] || ""}
                      onChange={(e) => handleChange("p-taille", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Couleur préférée :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-couleur"] || ""}
                      onChange={(e) => handleChange("p-couleur", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Plat préféré :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-plat"] || ""}
                      onChange={(e) => handleChange("p-plat", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Animal préféré :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-animal"] || ""}
                      onChange={(e) => handleChange("p-animal", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                  <div className="cahier-field-row">
                    <label>Plus tard, je serai :</label>
                    <input
                      className="cahier-fill"
                      value={answers["p-metier"] || ""}
                      onChange={(e) => handleChange("p-metier", e.target.value)}
                      placeholder="…"
                    />
                  </div>
                </div>

                {/* Colonne droite : Polaroid portrait */}
                <div className="w-[160px] flex justify-center">
                  <label className="cahier-polaroid transform rotate-1 w-full">
                    <div className="cahier-frame min-h-[140px]">
                      {uploadingKey === "portrait-photo" ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#F7941D]" />
                      ) : answers["portrait-photo"] ? (
                        <>
                          <img src={answers["portrait-photo"]} alt="Mon portrait" />
                          <button
                            type="button"
                            onClick={(e) => handleRemovePhoto("portrait-photo", e)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2">
                          <Camera className="w-6 h-6 text-[#8a7f66]" />
                          <span>Ma photo</span>
                        </div>
                      )}
                    </div>
                    <div className="cahier-cap">Moi !</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload("portrait-photo", e)}
                    />
                  </label>
                </div>
              </div>

              {/* Deux notes en papier en dessous : J'adore & Je déteste */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white border-2 border-[#4C9A2A] rounded-xl p-3.5 shadow-sm">
                  <div className="caveat-font font-bold text-2xl text-[#4C9A2A] mb-1">J&apos;adore ❤️</div>
                  <textarea
                    className="w-full min-h-[70px] border-none bg-transparent resize-none font-['Quicksand'] font-medium text-sm text-[#3A362E] outline-none"
                    placeholder="Écris ici tout ce que tu adores…"
                    value={answers["p-adore"] || ""}
                    onChange={(e) => handleChange("p-adore", e.target.value)}
                  />
                </div>

                <div className="bg-white border-2 border-[#F7941D] rounded-xl p-3.5 shadow-sm">
                  <div className="caveat-font font-bold text-2xl text-[#F7941D] mb-1">Je déteste ❌</div>
                  <textarea
                    className="w-full min-h-[70px] border-none bg-transparent resize-none font-['Quicksand'] font-medium text-sm text-[#3A362E] outline-none"
                    placeholder="Écris ici tout ce que tu détestes…"
                    value={answers["p-deteste"] || ""}
                    onChange={(e) => handleChange("p-deteste", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 3: MON ANNÉE
          ======================================================== */}
          {activePage === "annee" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-14 h-14 top-2 right-4" viewBox="0 0 60 60">
                <rect x="8" y="10" width="44" height="34" rx="3" stroke="#3A362E" strokeWidth="2" fill="#FBB03B" />
                <rect x="20" y="42" width="20" height="8" fill="#7CC142" stroke="#3A362E" strokeWidth="2" />
              </svg>

              <h1 className="cahier-title">Mon année</h1>
              <div className="cahier-subtitle">Une année à raconter…</div>

              <div className="cahier-field-row">
                <label>Cette année, classe de :</label>
                <input
                  className="cahier-fill"
                  value={answers["a-classe"] || ""}
                  onChange={(e) => handleChange("a-classe", e.target.value)}
                  placeholder="…"
                />
              </div>
              <div className="cahier-field-row">
                <label>Ma matière préférée :</label>
                <input
                  className="cahier-fill"
                  value={answers["a-matiere"] || ""}
                  onChange={(e) => handleChange("a-matiere", e.target.value)}
                  placeholder="…"
                />
              </div>
              <div className="cahier-field-row">
                <label>Mon projet préféré :</label>
                <input
                  className="cahier-fill"
                  value={answers["a-projet"] || ""}
                  onChange={(e) => handleChange("a-projet", e.target.value)}
                  placeholder="…"
                />
              </div>
              <div className="cahier-field-row">
                <label>Ma maîtresse / mon maître était :</label>
                <input
                  className="cahier-fill"
                  value={answers["a-maitresse"] || ""}
                  onChange={(e) => handleChange("a-maitresse", e.target.value)}
                  placeholder="…"
                />
              </div>

              <label className="font-extrabold text-[#5b5648] text-sm block mt-4">
                Mon meilleur souvenir 🌟
              </label>
              <textarea
                className="cahier-fill-block min-h-[52px]"
                placeholder="Raconte…"
                value={answers["a-souvenir"] || ""}
                onChange={(e) => handleChange("a-souvenir", e.target.value)}
              />

              <label className="font-extrabold text-[#5b5648] text-sm block mt-3">
                Le moment le plus rigolo 😂
              </label>
              <textarea
                className="cahier-fill-block min-h-[52px]"
                placeholder="Raconte…"
                value={answers["a-rigolo"] || ""}
                onChange={(e) => handleChange("a-rigolo", e.target.value)}
              />

              <label className="font-extrabold text-[#5b5648] text-sm block mt-3">
                Ce que j&apos;ai appris cette année 💡
              </label>
              <textarea
                className="cahier-fill-block min-h-[52px]"
                placeholder="Raconte…"
                value={answers["a-appris"] || ""}
                onChange={(e) => handleChange("a-appris", e.target.value)}
              />
            </div>
          )}

          {/* ========================================================
              PAGE 4: MES CAMARADES (9 polaroids)
          ======================================================== */}
          {activePage === "camarades" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-10 h-8 top-2 right-4" viewBox="0 0 40 30">
                <path d="M10 6 C6 2 0 4 0 10 C0 16 10 22 10 22 C10 22 20 16 20 10 C20 4 14 2 10 6Z" fill="none" stroke="#3A362E" strokeWidth="1.6" />
                <path d="M26 4 C22 0 16 2 16 8 C16 14 26 20 26 20 C26 20 36 14 36 8 C36 2 30 0 26 4Z" fill="#F7941D" stroke="#3A362E" strokeWidth="1.6" />
              </svg>

              <h1 className="cahier-title">Mes camarades</h1>
              <div className="cahier-subtitle">Une photo pour chaque copain(e) !</div>

              <div className="flex flex-wrap gap-4 justify-center mt-3">
                {[
                  { key: "c-rigolo", label: "Le plus rigolo", rot: "-rotate-3" },
                  { key: "c-serieux", label: "Le plus sérieux", rot: "rotate-2" },
                  { key: "c-discret", label: "Le plus discret", rot: "-rotate-2" },
                  { key: "c-air", label: "Tête en l'air", rot: "rotate-3" },
                  { key: "c-genereux", label: "Le plus généreux", rot: "-rotate-1" },
                  { key: "c-filou", label: "Le plus filou", rot: "rotate-2" },
                  { key: "c-gourmand", label: "Le plus gourmand", rot: "-rotate-3" },
                  { key: "c-gentil", label: "Le plus gentil", rot: "rotate-1" },
                  { key: "c-best", label: "Mon bestfriend", rot: "-rotate-2" },
                ].map((item) => (
                  <label key={item.key} className={`cahier-polaroid transform ${item.rot}`}>
                    <div className="cahier-frame">
                      {uploadingKey === item.key ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#F7941D]" />
                      ) : answers[item.key] ? (
                        <>
                          <img src={answers[item.key]} alt={item.label} />
                          <button
                            type="button"
                            onClick={(e) => handleRemovePhoto(item.key, e)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <span>+ Photo</span>
                      )}
                    </div>
                    <div className="cahier-cap">{item.label}</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(item.key, e)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 5: LES PETITS MOTS
          ======================================================== */}
          {activePage === "mots" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-10 h-10 top-2 left-6" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="10" fill="#FBB03B" stroke="#3A362E" strokeWidth="2" />
              </svg>
              <svg className="cahier-deco w-14 h-14 top-2 right-4" viewBox="0 0 60 60">
                <path d="M6 26 A24 24 0 0 1 54 26 Z" fill="#F7941D" stroke="#3A362E" strokeWidth="2" />
                <line x1="30" y1="26" x2="30" y2="54" stroke="#3A362E" strokeWidth="2" />
              </svg>

              <h1 className="cahier-title">Les petits mots</h1>
              <div className="cahier-subtitle">Colle ou écris ici les petits mots de tes copains, de ta famille…</div>

              <textarea
                className="cahier-fill-block min-h-[380px] text-lg leading-relaxed bg-[repeating-linear-gradient(transparent,transparent_31px,#c9bfa9_32px)]"
                placeholder="Écris ici tous les gentils petits mots…"
                value={answers["mots"] || ""}
                onChange={(e) => handleChange("mots", e.target.value)}
              />
            </div>
          )}

          {/* ========================================================
              PAGE 6: MES LIVRES PRÉFÉRÉS
          ======================================================== */}
          {activePage === "livres" && (
            <div className="page-content animate-fade-in relative">
              <h1 className="cahier-title">Mes livres préférés</h1>
              <div className="cahier-subtitle">Note les histoires que tu as adorées cette année</div>

              <div className="flex flex-wrap gap-8 justify-center mt-6">
                <div className="cahier-tag-card">
                  <span className="cahier-hole" />
                  <div className="text-3xl mt-2 mb-1">📚</div>
                  <input
                    className="cahier-tag-title"
                    value={answers["tag-livres-title"] ?? "Mes livres préférés"}
                    onChange={(e) => handleChange("tag-livres-title", e.target.value)}
                  />
                  <textarea
                    className="w-full flex-1 border-none bg-transparent resize-none font-medium text-xs text-center text-[#3A362E] outline-none mt-1"
                    placeholder="Écris tes titres préférés…"
                    value={answers["tag-livres-text"] || ""}
                    onChange={(e) => handleChange("tag-livres-text", e.target.value)}
                  />
                </div>

                <div className="cahier-tag-card">
                  <span className="cahier-hole" />
                  <div className="text-3xl mt-2 mb-1">✏️</div>
                  <input
                    className="cahier-tag-title"
                    placeholder="Titre libre…"
                    value={answers["tag-livres2-title"] || ""}
                    onChange={(e) => handleChange("tag-livres2-title", e.target.value)}
                  />
                  <textarea
                    className="w-full flex-1 border-none bg-transparent resize-none font-medium text-xs text-center text-[#3A362E] outline-none mt-1"
                    placeholder="Écris ici…"
                    value={answers["tag-livres2-text"] || ""}
                    onChange={(e) => handleChange("tag-livres2-text", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 7: MES FIERTÉS
          ======================================================== */}
          {activePage === "fiertes" && (
            <div className="page-content animate-fade-in relative">
              <h1 className="cahier-title">Mes fiertés</h1>
              <div className="cahier-subtitle">Ce dont tu es fier(ère) cette année</div>

              <div className="flex flex-wrap gap-8 justify-center mt-6">
                <div className="cahier-tag-card">
                  <span className="cahier-hole" />
                  <div className="text-3xl mt-2 mb-1">🏅</div>
                  <input
                    className="cahier-tag-title"
                    value={answers["tag-fiertes-title"] ?? "Mes fiertés"}
                    onChange={(e) => handleChange("tag-fiertes-title", e.target.value)}
                  />
                  <textarea
                    className="w-full flex-1 border-none bg-transparent resize-none font-medium text-xs text-center text-[#3A362E] outline-none mt-1"
                    placeholder="Écris ce qui te rend fier(ère)…"
                    value={answers["tag-fiertes-text"] || ""}
                    onChange={(e) => handleChange("tag-fiertes-text", e.target.value)}
                  />
                </div>

                <div className="cahier-tag-card">
                  <span className="cahier-hole" />
                  <div className="text-3xl mt-2 mb-1">⭐</div>
                  <input
                    className="cahier-tag-title"
                    placeholder="Titre libre…"
                    value={answers["tag-fiertes2-title"] || ""}
                    onChange={(e) => handleChange("tag-fiertes2-title", e.target.value)}
                  />
                  <textarea
                    className="w-full flex-1 border-none bg-transparent resize-none font-medium text-xs text-center text-[#3A362E] outline-none mt-1"
                    placeholder="Écris ici…"
                    value={answers["tag-fiertes2-text"] || ""}
                    onChange={(e) => handleChange("tag-fiertes2-text", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 8: PROGRAMME DES VACANCES
          ======================================================== */}
          {activePage === "vacances" && (
            <div className="page-content animate-fade-in relative">
              <h1 className="cahier-title">Mon programme des vacs</h1>
              <div className="cahier-subtitle">Qu&apos;est-ce que tu as prévu pour les vacances ?</div>

              <div className="flex flex-wrap gap-6 justify-center mt-4">
                <div className="cahier-vac-circle">
                  <textarea
                    className="w-[80%] h-[75%] border-none bg-transparent resize-none text-center caveat-font font-bold text-2xl text-[#0F8B8C] outline-none"
                    placeholder="🌞 Écris ton programme ici…"
                    value={answers["vac-1"] || ""}
                    onChange={(e) => handleChange("vac-1", e.target.value)}
                  />
                </div>
                <div className="cahier-vac-circle">
                  <textarea
                    className="w-[80%] h-[75%] border-none bg-transparent resize-none text-center caveat-font font-bold text-2xl text-[#0F8B8C] outline-none"
                    placeholder="Et encore…"
                    value={answers["vac-2"] || ""}
                    onChange={(e) => handleChange("vac-2", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 9: MES PHOTOS (6 polaroids)
          ======================================================== */}
          {activePage === "photos" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-16 h-12 top-2 right-4" viewBox="0 0 64 48">
                <rect x="2" y="12" width="60" height="32" rx="4" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
                <rect x="20" y="4" width="14" height="10" rx="2" stroke="#3A362E" strokeWidth="2" fill="#F0E7D0" />
                <circle cx="32" cy="28" r="11" stroke="#3A362E" strokeWidth="2" fill="#fff" />
                <circle cx="32" cy="28" r="5" fill="#3A362E" />
                <circle cx="52" cy="18" r="3" fill="#F7941D" stroke="#3A362E" />
              </svg>

              <h1 className="cahier-title">Mes photos</h1>
              <div className="cahier-subtitle">Ajoute jusqu&apos;à 6 photos souvenirs de ton année</div>

              <div className="flex flex-wrap gap-5 justify-center mt-4">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const key = `photo-${num}`;
                  return (
                    <label key={key} className="cahier-polaroid transform hover:scale-105">
                      <div className="cahier-frame">
                        {uploadingKey === key ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#F7941D]" />
                        ) : answers[key] ? (
                          <>
                            <img src={answers[key]} alt={`Photo ${num}`} />
                            <button
                              type="button"
                              onClick={(e) => handleRemovePhoto(key, e)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span>+ Photo {num}</span>
                        )}
                      </div>
                      <div className="cahier-cap">Photo {num}</div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(key, e)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              PAGE 10: SECRETS
          ======================================================== */}
          {activePage === "secrets" && (
            <div className="page-content animate-fade-in relative">
              <svg className="cahier-deco w-10 h-14 bottom-3 left-4" viewBox="0 0 40 60">
                <rect x="12" y="46" width="16" height="12" fill="#3A362E" />
                <path d="M18 46 V16 M18 30 h-8 v-10 M18 24 h8 v-8" stroke="#7CC142" strokeWidth="6" strokeLinecap="round" fill="none" />
              </svg>

              <h1 className="cahier-title" style={{ color: "#8a2f33" }}>
                Mes petits secrets
              </h1>
              <div className="cahier-subtitle">Top secret… 🤫</div>

              <textarea
                className="cahier-fill-block min-h-[280px] text-xl"
                placeholder="Écris ici ce que tu veux garder secret…"
                value={answers["secrets"] || ""}
                onChange={(e) => handleChange("secrets", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Onglets reliés à droite */}
        <div className="cahier-tabs">
          {PAGES_CONFIG.map((p) => {
            const isActive = activePage === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(p.id)}
                className={`cahier-tab-btn ${isActive ? "active" : ""}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre de statut d'enregistrement automatique */}
      <div className="w-full max-w-[960px] flex items-center justify-between text-xs text-[#8a7f66] font-semibold mt-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7CC142] animate-pulse" />
          <span>{saveStatus}</span>
        </div>
        <div>
          <span>Petit Baobab © Mon cahier de souvenirs</span>
        </div>
      </div>
    </div>
  );
};
