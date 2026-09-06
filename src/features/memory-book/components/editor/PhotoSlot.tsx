"use client";

import React, { useRef, useState, useCallback } from "react";
import { PhotoElementData } from "../../types/memory-book.types";
import { memoryStorageService } from "../../services/memoryStorageService";
import { Camera, ZoomIn, ZoomOut, Move, Trash2, Loader2, Sparkles } from "lucide-react";

interface PhotoSlotProps {
  photoData?: PhotoElementData;
  title?: string;
  subtitle?: string;
  profileId: string;
  bookId: string;
  elementId: string;
  onUpdate: (data: Partial<PhotoElementData>) => void;
  aspectRatio?: "square" | "landscape" | "portrait";
  isReadOnly?: boolean;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({
  photoData,
  title,
  subtitle,
  profileId,
  bookId,
  elementId,
  onUpdate,
  aspectRatio = "portrait",
  isReadOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const zoom = photoData?.zoom || 1;
  const offsetX = photoData?.offsetX || 0;
  const offsetY = photoData?.offsetY || 0;
  const imageUrl = photoData?.url;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await memoryStorageService.uploadPhoto(file, profileId, bookId, elementId);
      onUpdate({
        url: res.url,
        storagePath: res.path,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
    } catch (err) {
      console.error("Erreur téléversement photo:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(1, Math.min(3, Math.round((zoom + delta) * 10) / 10));
    onUpdate({ zoom: newZoom });
  };

  // Gestion du drag/pan pour recadrer
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly || !imageUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Limiter la dérive de translation
    const maxOffset = 180 * (zoom - 0.7);
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, newY));
    onUpdate({ offsetX: clampedX, offsetY: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleRemovePhoto = () => {
    onUpdate({
      url: undefined,
      storagePath: undefined,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  };

  // Classes de ratio de dimensions
  const ratioClasses = {
    portrait: "aspect-[4/5] min-h-[520px]",
    square: "aspect-square min-h-[440px]",
    landscape: "aspect-[16/10] min-h-[400px]",
  }[aspectRatio];

  return (
    <div className="w-full flex flex-col items-center">
      {title && (
        <div className="text-center mb-2">
          <h4 className="font-bold text-gray-800 text-base md:text-lg flex items-center justify-center gap-1.5">
            <Camera className="w-4 h-4 text-purple-600" />
            {title}
          </h4>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Cadre de photo clippé */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-[680px] md:max-w-[800px] ${ratioClasses} rounded-2xl overflow-hidden border-4 border-dashed ${
          imageUrl ? "border-purple-300 bg-black/5 shadow-md" : "border-amber-300 bg-amber-50/60 hover:bg-amber-100/60"
        } transition-colors flex items-center justify-center select-none`}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Préparation de ta photo...</span>
          </div>
        )}

        {imageUrl ? (
          <>
            {/* Image avec clipping strict et transformations CSS */}
            <div
              className={`w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-none`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title || "Photo du souvenir"}
                className="max-w-none pointer-events-none transition-transform duration-75 object-cover"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                draggable={false}
              />
            </div>

            {/* Badge de commande tactile d'aide au recadrage */}
            {!isReadOnly && (
              <div className="absolute top-2 left-2 pointer-events-none bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 opacity-80">
                <Move className="w-3 h-3" /> Glisse pour cadrer
              </div>
            )}
          </>
        ) : (
          /* Zone vide invitant l'enfant à ajouter une photo */
          <button
            type="button"
            disabled={isReadOnly || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer group focus:outline-none"
          >
            <div className="w-16 h-16 rounded-full bg-amber-200/80 group-hover:scale-110 group-hover:bg-amber-300 transition-all flex items-center justify-center mb-3 shadow-inner">
              <Camera className="w-8 h-8 text-amber-700" />
            </div>
            <span className="font-bold text-amber-900 text-sm md:text-base">
              {photoData?.placeholderText || "Ajouter une photo 📸"}
            </span>
            <span className="text-xs text-amber-700/80 mt-1">Appuie ici pour choisir une photo</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Barre d'outils photo (Zoom, Changer, Supprimer) */}
      {!isReadOnly && imageUrl && (
        <div className="mt-2.5 flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-xs border border-purple-100">
          <button
            type="button"
            onClick={() => handleZoom(-0.2)}
            disabled={zoom <= 1}
            className="p-1.5 rounded-full hover:bg-purple-100 disabled:opacity-30 text-purple-700 transition"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-purple-900 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => handleZoom(0.2)}
            disabled={zoom >= 3}
            className="p-1.5 rounded-full hover:bg-purple-100 disabled:opacity-30 text-purple-700 transition"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2 py-1 rounded-md hover:bg-purple-50 transition"
          >
            Changer
          </button>

          <button
            type="button"
            onClick={handleRemovePhoto}
            className="p-1.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition"
            title="Supprimer la photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
