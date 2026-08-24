"use client"

import { cn } from "@/lib/utils"
import { frameBorderStyle } from "./frameStyles"


// Cover Visual Dynamic Preview Component
export const BookPreviewCanvas = ({
  selectedCover,
  selectedPalette,
  title,
  subtitle,
  childName,
  author,
  decorativeFrame,
  orientation,
  scale = 1.0,
}: { 
  selectedCover: string
  selectedPalette: string
  title: string
  subtitle: string
  childName: string
  author: string
  decorativeFrame: string
  orientation: string
  scale?: number

}) => {
  const colors: Record<string, { primary: string; secondary: string; text: string }> = {
    Purple: { primary: "#7D6AF8", secondary: "#F1EFFF", text: "#4A4EBE" },
    Green: { primary: "#20C997", secondary: "#E6FAF4", text: "#0E7C5D" },
    Yellow: { primary: "#FFD95C", secondary: "#FFFDF2", text: "#8A6D00" },
    Orange: { primary: "#FFB300", secondary: "#FFF6E0", text: "#A35C00" },
    Blue: { primary: "#1194FF", secondary: "#E6F4FF", text: "#0056B3" },
    Pink: { primary: "#FF5E83", secondary: "#FFEBF0", text: "#B81C40" },
    Turquoise: { primary: "#13C6A2", secondary: "#E8FBF7", text: "#0B7F67" },
    Multicolore: { primary: "#7D6AF8", secondary: "#FFFDF7", text: "#3B2416" },
  }

  const activeColors = colors[selectedPalette] || colors.Purple

  const coverArtSrc: Record<string, string> = {
    "petit-baobab": "/illustrations/covers/cover-petit-baobab.svg",
    "savane": "/illustrations/covers/cover-savane.svg",
    "ecole": "/illustrations/covers/cover-ecole.svg",
    "afrique": "/illustrations/covers/cover-afrique.svg",
    "coloree": "/illustrations/covers/cover-coloree.svg",
    "ia": "/illustrations/covers/cover-ia.svg",
  }

  const renderFrameBorders = () => (
    <div className="absolute inset-0 pointer-events-none" style={frameBorderStyle(decorativeFrame)} aria-hidden />
  )

  const isLandscape = orientation === "Paysage"
  const aspectClass = isLandscape ? "aspect-[47/32]" : "aspect-[32/47]"

  return (
    <div
      id="book-cover-preview"
      className={cn(
        "relative w-full rounded-2xl overflow-hidden shadow-md flex flex-col justify-between p-5 transition-all duration-300 font-nunito mx-auto origin-center",
        aspectClass
      )}
      style={{
        background: `linear-gradient(to bottom, #FFFDF7, ${selectedPalette === "Multicolore" ? "#F5EEFF" : activeColors.secondary})`,
        transform: `scale(${scale})`,
        width: isLandscape ? "350px" : "280px",
        height: isLandscape ? "238px" : "410px",
      }}
    >
      {renderFrameBorders()}

      <div className="w-full flex items-center justify-between z-10 px-1 pt-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B2416]/40 leading-none">
          Petit Baobab
        </span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-[#FF5E83]" />
          <span className="w-1 h-1 rounded-full bg-[#FFD95C]" />
          <span className="w-1 h-1 rounded-full bg-[#20C997]" />
        </div>
      </div>

      <div className="flex flex-col items-center text-center mt-3 gap-1 z-10 px-1">
        <h2
          className="text-[16px] sm:text-[18px] font-black tracking-tight leading-tight uppercase font-sans break-words w-full"
          style={{
            color: selectedPalette === "Multicolore" ? "#7D6AF8" : activeColors.text
          }}
        >
          {title || "Mon livre de coloriage"}
        </h2>
        {subtitle && (
          <p className="text-[10px] font-bold text-[#7A6A5E] italic leading-none break-words w-full mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center my-2 z-10 pointer-events-none min-h-[70px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverArtSrc[selectedCover] || coverArtSrc["petit-baobab"]}
          alt={selectedCover}
          className="w-full h-full max-h-[200px] object-contain drop-shadow-sm"
        />
      </div>

      <div className="w-full flex flex-col items-center gap-0.5 z-10 px-1 pb-1">
        <div className="w-6 h-0.5 bg-[#3B2416]/10 rounded-full my-0.5" />
        <p className="text-[9px] font-bold text-[#3B2416]/80 leading-none">
          Par : <span className="font-black text-[#3B2416]">{author || "Auteur"}</span>
        </p>
        {childName && (
          <span className="text-[8px] font-black bg-[#3B2416]/5 text-[#3B2416]/80 px-2 py-0.5 rounded-full mt-1">
            CrÃ©Ã© pour {childName}
          </span>
        )}
      </div>
    </div>
  )
}


