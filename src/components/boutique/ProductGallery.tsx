"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const displayImages = images.length > 0 ? images : ["/illustrations/Collection-livres.webp"];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-white border border-[#E5E0D5] shadow-sm">
        <Image
          src={displayImages[selectedImage]}
          alt={title}
          fill
          className="object-cover transition-all duration-300"
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                selectedImage === idx
                  ? "border-[#7D6AF8] scale-105 shadow-md"
                  : "border-[#E5E0D5] opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${title} preview ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
