"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { PhotoElementData } from "../../types/memory-book.types";
import { memoryStorageService } from "../../services/memoryStorageService";
import {
  Camera,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  Loader2,
  RotateCw,
  Maximize2,
} from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);
const [zoom, setZoom] = useState(photoData?.zoom || 1);
  const [offsetX, setOffsetX] = useState(photoData?.offsetX || 0);
  const [offsetY, setOffsetY] = useState(photoData?.offsetY || 0);
  const [rotation, setRotation] = useState(photoData?.rotation || 0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const imageUrl = photoData?.url;

  useEffect(() => {
    setZoom(photoData?.zoom || 1);
    setOffsetX(photoData?.offsetX || 0);
    setOffsetY(photoData?.offsetY || 0);
    setRotation(photoData?.rotation || 0);
  }, [photoData]);

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
        rotation: 0,
      });
    } catch (err) {
      console.error("Erreur téléversement photo:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.max(1, Math.min(3, Math.round((zoom + 0.2) * 10) / 10));
    setZoom(newZoom);
    onUpdate({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(1, Math.min(3, Math.round((zoom - 0.2) * 10) / 10));
    setZoom(newZoom);
    onUpdate({ zoom: newZoom });
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    onUpdate({ rotation: newRotation });
  };

  const handleRemovePhoto = () => {
    onUpdate({
      url: undefined,
      storagePath: undefined,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
    });
  };

  const ratioClasses = {
    portrait: "aspect-[4/5] min-h-[400px] md:min-h-[520px]",
    square: "aspect-square min-h-[300px] md:min-h-[440px]",
    landscape: "aspect-[16/10] min-h-[250px] md:min-h-[400px]",
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

      {/* Cadre de photo avec zoom, rotation et drag */}
      <div
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
            {/* Image avec zoom, rotation et offset */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title || "Photo du souvenir"}
                className="max-w-none pointer-events-none transition-transform duration-200 object-cover"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                draggable={false}
              />
            </div>

            {/* Badge d'aide */}
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

      {/* Barre d'outils photo */}
      {!isReadOnly && imageUrl && (
        <div className="mt-2.5 flex items-center gap-1.5 md:gap-2 bg-white/95 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-xs border border-purple-100 flex-wrap justify-center">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-1.5 rounded-full hover:bg-purple-100 disabled:opacity-30 text-purple-700 transition"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-purple-900 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-1.5 rounded-full hover:bg-purple-100 disabled:opacity-30 text-purple-700 transition"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-full hover:bg-purple-100 text-purple-700 transition"
            title="Rotation 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2 py-1 rounded-md hover:bg-purple-50 transition"
          >
            Changer
          </button>

          <button
            type="button"
            onClick={() => setShowFullscreen(!showFullscreen)}
            className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600 transition"
            title="Plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

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

      {/* Mode plein écran */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-white/20 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition"
          >
            ✕
          </button>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title || "Photo"}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
