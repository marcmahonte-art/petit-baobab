"use client";

import React, { useRef } from "react";
import {
  Pencil,
  Palette,
  Settings,
  Image as ImageIcon,
  Trash2,
  Crop,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Lightbulb,
  Check,
} from "lucide-react";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { clampPhotoZoom, normalizeRotation, PHOTO_ZOOM_MAX, PHOTO_ZOOM_MIN, PHOTO_ZOOM_STEP } from "../../constants/photo";

const THEMES = [
  { id: "baobab", name: "Thème Baobab", color: "#7658E8", desc: "Couleurs officielles violet & ocre" },
  { id: "savane", name: "Thème Savane", color: "#F9B72C", desc: "Tons chauds savane & terre d'Afrique" },
  { id: "nature", name: "Thème Nature", color: "#16866B", desc: "Vert végétal et feuillage" },
  { id: "soleil", name: "Thème Soleil", color: "#F28B30", desc: "Orange lumineux et énergie" },
  { id: "pastel", name: "Thème Pastel", color: "#EEE9FF", desc: "Douceur des pastels célestes" },
];

interface InspectorProps {
  onPhotoUploadClick?: () => void;
}

export const Inspector: React.FC<InspectorProps> = () => {
  const {
    currentBook,
    activePageIndex,
    activeTab,
    setActiveTab,
    updatePageField,
    updatePagePhoto,
    updatePagePhotoTransform,
    removePagePhoto,
    setBookTheme,
  } = useMemoryBookStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pages = currentBook?.pages_data || [];
  const activePage = pages[activePageIndex] || pages[0];
  const pageData = activePage?.data || {};

  const photoUrl = pageData.photoUrl || "/cahier-souvenirs/child.png";
  const zoom = pageData.zoom ?? 1;
  const rotation = pageData.rotation ?? 0;
  const hasPhoto = Boolean(pageData.photoUrl && pageData.photoUrl !== "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation taille (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("L'image est trop volumineuse. Taille maximale recommandée : 10 Mo.");
      return;
    }

    // Validation type MIME
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      alert("Format non supporté. Veuillez choisir un fichier JPG, PNG ou WebP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && activePage) {
        updatePagePhoto(activePage.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleZoomChange = (newZoom: number) => {
    if (!activePage) return;
    updatePagePhotoTransform(activePage.id, { zoom: clampPhotoZoom(newZoom) });
  };

  const handleRotate = (delta: number) => {
    if (!activePage) return;
    updatePagePhotoTransform(activePage.id, { rotation: normalizeRotation(rotation + delta) });
  };

  const handleResetPhoto = () => {
    if (!activePage) return;
    updatePagePhotoTransform(activePage.id, { zoom: 1, rotation: 0, offsetX: 0, offsetY: 0 });
  };

  return (
    <aside className="w-full h-full bg-[#FFFDF8]/95 border border-[#61351F]/[0.07] rounded-[20px] p-4 sm:p-5 overflow-y-auto flex flex-col shadow-xs">
      {/* Sélecteur de fichier caché */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Onglets : Éditer / Thème / Paramètres */}
      <div className="grid grid-cols-3 gap-1 bg-[#F1EEE9] rounded-[13px] p-[3px] flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`h-[42px] rounded-[11px] font-extrabold text-xs sm:text-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            activeTab === "edit"
              ? "bg-[#7658E8] text-white shadow-2xs"
              : "bg-transparent text-[#61351F] hover:bg-white/40"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2.4} />
          Éditer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`h-[42px] rounded-[11px] font-extrabold text-xs sm:text-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            activeTab === "theme"
              ? "bg-[#7658E8] text-white shadow-2xs"
              : "bg-transparent text-[#61351F] hover:bg-white/40"
          }`}
        >
          <Palette className="w-3.5 h-3.5" strokeWidth={2.4} />
          Thème
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`h-[42px] rounded-[11px] font-extrabold text-xs sm:text-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            activeTab === "settings"
              ? "bg-[#7658E8] text-white shadow-2xs"
              : "bg-transparent text-[#61351F] hover:bg-white/40"
          }`}
        >
          <Settings className="w-3.5 h-3.5" strokeWidth={2.4} />
          Paramètres
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 flex flex-col gap-4 mt-4">
        {activeTab === "edit" && (
          <>
            {/* Section Photo & Recadrage */}
            <div className="border border-[#61351F]/[0.07] rounded-[18px] p-4 bg-[#FFFDF9] shadow-2xs">
              <h3 className="text-sm font-extrabold text-[#61351F] mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#7658E8]" strokeWidth={2.2} />
                Photo
              </h3>

              <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-3.5 items-center mb-4">
                <div className="w-[110px] h-[100px] sm:w-[130px] sm:h-[115px] rounded-[10px] overflow-hidden bg-[#f2ede4] border border-[#ded7cf] relative flex items-center justify-center">
                  {hasPhoto ? (
                    <img
                      src={photoUrl}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    />
                  ) : (
                    <span className="text-xs text-[#91877D] font-bold">Pas de photo</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-[40px] rounded-[12px] px-3 font-extrabold text-xs bg-[#7658E8] text-white hover:bg-[#6849dd] active:scale-95 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" strokeWidth={2.4} />
                    Changer la photo
                  </button>
                  <button
                    type="button"
                    onClick={() => activePage && removePagePhoto(activePage.id)}
                    className="h-[40px] rounded-[12px] px-3 font-extrabold text-xs bg-white border border-[#ded7cf] text-[#39322d] hover:bg-[#FDF9F3] active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Recadrer la photo */}
              <h4 className="text-xs font-extrabold text-[#61351F] mb-2.5 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-[#7658E8]" strokeWidth={2.2} />
                Recadrer la photo
              </h4>
              <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-3.5 items-center">
                <div className="w-[110px] h-[100px] sm:w-[130px] sm:h-[115px] rounded-[10px] overflow-hidden bg-[#f2ede4] border border-[#ded7cf] relative flex items-center justify-center">
                  {hasPhoto && (
                    <img
                      src={photoUrl}
                      alt="Crop preview"
                      className="w-full h-full object-cover saturate-85"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {/* Slider Zoom */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-[#61351F] mb-1">
                      <span>Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleZoomChange(zoom - PHOTO_ZOOM_STEP)}
                        className="w-[30px] h-[30px] rounded-[8px] bg-white border border-[#ded7cf] font-extrabold text-sm flex items-center justify-center hover:bg-[#F9F4EB] active:scale-95 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={PHOTO_ZOOM_MIN}
                        max={PHOTO_ZOOM_MAX}
                        step={PHOTO_ZOOM_STEP}
                        value={zoom}
                        onChange={(e) => handleZoomChange(Number(e.target.value))}
                        className="flex-1 accent-[#7658E8] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleZoomChange(zoom + PHOTO_ZOOM_STEP)}
                        className="w-[30px] h-[30px] rounded-[8px] bg-white border border-[#ded7cf] font-extrabold text-sm flex items-center justify-center hover:bg-[#F9F4EB] active:scale-95 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Boutons Rotation */}
                  <div>
                    <div className="text-xs font-bold text-[#61351F] mb-1 flex justify-between items-center">
                      <span>Rotation</span>
                      <span className="text-[10px] text-[#91877D] cursor-pointer hover:underline" onClick={handleResetPhoto}>
                        Réinitialiser
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRotate(-5)}
                        title="Tourner de 5° vers la gauche"
                        className="flex-1 h-[36px] bg-white border border-[#ded7cf] rounded-[8px] text-base hover:bg-[#F9F4EB] active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.2} />
                        -5°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotate(5)}
                        title="Tourner de 5° vers la droite"
                        className="flex-1 h-[36px] bg-white border border-[#ded7cf] rounded-[8px] text-base hover:bg-[#F9F4EB] active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" strokeWidth={2.2} />
                        +5°
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Texte (champs en fonction de la page active) */}
            <div className="border border-[#61351F]/[0.07] rounded-[18px] p-4 bg-[#FFFDF9] shadow-2xs flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-[#61351F] flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-[#7658E8]" strokeWidth={2.2} />
                Textes de la page
              </h3>

              {activePage.templateId === "portrait-v1" && (
                <>
                  <div>
                    <label className="text-xs font-extrabold text-[#61351F] block mb-1">
                      Mon prénom :
                    </label>
                    <input
                      type="text"
                      value={pageData.name ?? "Aminata"}
                      onChange={(e) => updatePageField(activePage.id, "name", e.target.value)}
                      className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-white text-xs font-semibold text-[#4d4037] outline-none focus:border-[#7658e8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#61351F] block mb-1">
                      Mon anniversaire :
                    </label>
                    <input
                      type="text"
                      value={pageData.birthday ?? "12 / 05 / 2018"}
                      onChange={(e) => updatePageField(activePage.id, "birthday", e.target.value)}
                      className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-white text-xs font-semibold text-[#4d4037] outline-none focus:border-[#7658e8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#61351F] block mb-1">
                      Mon âge & Ma taille :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pageData.age ?? "6 ans"}
                        onChange={(e) => updatePageField(activePage.id, "age", e.target.value)}
                        placeholder="Âge"
                        className="h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-white text-xs font-semibold text-[#4d4037] outline-none focus:border-[#7658e8]"
                      />
                      <input
                        type="text"
                        value={pageData.height ?? "120 cm"}
                        onChange={(e) => updatePageField(activePage.id, "height", e.target.value)}
                        placeholder="Taille"
                        className="h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-white text-xs font-semibold text-[#4d4037] outline-none focus:border-[#7658e8]"
                      />
                    </div>
                  </div>
                </>
              )}

              {activePage.templateId === "cover-v1" && (
                <>
                  <div>
                    <label className="text-xs font-extrabold text-[#61351F] block mb-1">
                      Prénom de l&apos;enfant :
                    </label>
                    <input
                      type="text"
                      value={pageData.childName ?? "Aminata"}
                      onChange={(e) => updatePageField(activePage.id, "childName", e.target.value)}
                      className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-white text-xs font-semibold text-[#4d4037] outline-none focus:border-[#7658e8]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-[#61351F] block mb-1">
                      Année scolaire :
                    </label>
                    <input
                      type="text"
                      value={pageData.schoolYear ?? "2025 - 2026"}
                      onChange={(e) => updatePageField(activePage.id, "schoolYear", e.target.value)}
                      className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-white text-xs font-semibold text-[#4d4037] outline-none focus:border-[#7658e8]"
                    />
                  </div>
                </>
              )}

              {activePage.templateId !== "portrait-v1" && activePage.templateId !== "cover-v1" && (
                <div>
                  <label className="text-xs font-extrabold text-[#61351F] block mb-1">
                    Titre de la page :
                  </label>
                  <input
                    type="text"
                    value={activePage.title}
                    readOnly
                    className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] px-3 bg-gray-50 text-xs font-bold text-[#4d4037] outline-none"
                  />
                  <p className="text-[11px] text-[#91877D] mt-1.5 italic">
                    Modifie directement les textes sur la page A4 au centre !
                  </p>
                </div>
              )}

              {/* Style & Typographies */}
              <h4 className="text-xs font-extrabold text-[#61351F] mt-2 mb-1">Style de police</h4>
              <div className="grid grid-cols-2 gap-2">
                <select className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] bg-white px-2 text-xs font-semibold text-[#4d4037] outline-none">
                  <option>Nunito Sans</option>
                  <option>Baloo 2</option>
                </select>
                <select className="w-full h-[40px] border border-[#ded7cf] rounded-[10px] bg-white px-2 text-xs font-semibold text-[#4d4037] outline-none">
                  <option>16 px</option>
                  <option>18 px</option>
                  <option>20 px</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === "theme" && (
          <div className="border border-[#61351F]/[0.07] rounded-[18px] p-4 bg-[#FFFDF9] shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-[#61351F] flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#7658E8]" strokeWidth={2.2} />
              Palettes &amp; Thèmes du Cahier
            </h3>
            <p className="text-xs text-[#91877D] mb-1">
              Choisis l&apos;ambiance chromatique de ton livre de souvenirs :
            </p>

            <div className="flex flex-col gap-2.5">
              {THEMES.map((theme) => {
                const isSelected = (currentBook?.theme || "baobab") === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBookTheme(theme.id)}
                    className={`p-3 rounded-[14px] border-2 text-left flex items-center gap-3 transition cursor-pointer ${
                      isSelected
                        ? "border-[#7658E8] bg-[#EEE9FF]/40 shadow-xs"
                        : "border-[#E8DED0] bg-white hover:border-[#7658E8]/40"
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex-shrink-0 shadow-xs border border-white"
                      style={{ backgroundColor: theme.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-baloo font-bold text-sm text-[#61351F]">
                        {theme.name}
                      </span>
                      <span className="text-[11px] text-[#91877D] truncate">
                        {theme.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="border border-[#61351F]/[0.07] rounded-[18px] p-4 bg-[#FFFDF9] shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-extrabold text-[#61351F] flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#7658E8]" strokeWidth={2.2} />
              Paramètres du Cahier
            </h3>
            <div className="rounded-[12px] bg-[#FFF9F2] p-3 border border-[#E8DED0] text-xs flex flex-col gap-1.5">
              <div className="flex justify-between font-bold text-[#61351F]">
                <span>Page active :</span>
                <span>Page {activePageIndex + 1} / {pages.length}</span>
              </div>
              <div className="flex justify-between text-[#91877D]">
                <span>Template :</span>
                <span className="font-mono text-[11px]">{activePage.templateId || "standard"}</span>
              </div>
              <div className="flex justify-between text-[#91877D]">
                <span>Orientation :</span>
                <span>A4 Portrait (210 × 297 mm)</span>
              </div>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={handleResetPhoto}
                className="w-full py-2.5 px-3 rounded-[12px] border border-[#ded7cf] bg-white text-xs font-bold text-[#61351F] hover:bg-gray-50 transition cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.2} />
                Réinitialiser les cadrages photos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notice d'enregistrement en bas de l'inspecteur */}
      <div className="mt-4 p-3 border border-[#16866B]/20 bg-[#DFF1E9] rounded-[14px] text-[#16866B] text-xs flex items-center justify-between shadow-2xs flex-shrink-0">
        <span className="font-bold flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.2} />
          Enregistrement automatique actif
        </span>
        <Check className="w-4 h-4" strokeWidth={2.6} />
      </div>
    </aside>
  );
};
