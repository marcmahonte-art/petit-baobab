import { memo } from "react"
import { cn } from "@/lib/utils"
import type { BookFrame, BookOrientation, CoverPalette, CoverTemplate } from "../types"

export interface BookCoverProps {
  cover: CoverTemplate
  palette: CoverPalette
  title: string
  subtitle?: string
  childName?: string
  author?: string
  frame?: BookFrame
  orientation?: BookOrientation
  /** "print" = rendu statique pour impression/PDF, "interactive" = écran. */
  variant?: "interactive" | "print"
  className?: string
}

/**
 * Palette exprimée UNIQUEMENT via classes Tailwind (aucun style inline).
 * Les dégradés et couleurs sont figés par palette.
 */
const PALETTE: Record<CoverPalette, { bg: string; text: string; border: string; dot: string; chip: string }> = {
  Purple: { bg: "from-[#FFFDF7] to-[#F1EFFF]", text: "text-[#4A4EBE]", border: "border-[#7D6AF8]", dot: "bg-[#7D6AF8]", chip: "bg-[#7D6AF8]/5 text-[#4A4EBE]" },
  Green: { bg: "from-[#FFFDF7] to-[#E6FAF4]", text: "text-[#0E7C5D]", border: "border-[#20C997]", dot: "bg-[#20C997]", chip: "bg-[#20C997]/5 text-[#0E7C5D]" },
  Yellow: { bg: "from-[#FFFDF7] to-[#FFFDF2]", text: "text-[#8A6D00]", border: "border-[#FFD95C]", dot: "bg-[#FFD95C]", chip: "bg-[#FFD95C]/5 text-[#8A6D00]" },
  Orange: { bg: "from-[#FFFDF7] to-[#FFF6E0]", text: "text-[#A35C00]", border: "border-[#FFB300]", dot: "bg-[#FFB300]", chip: "bg-[#FFB300]/5 text-[#A35C00]" },
  Blue: { bg: "from-[#FFFDF7] to-[#E6F4FF]", text: "text-[#0056B3]", border: "border-[#1194FF]", dot: "bg-[#1194FF]", chip: "bg-[#1194FF]/5 text-[#0056B3]" },
  Pink: { bg: "from-[#FFFDF7] to-[#FFEBF0]", text: "text-[#B81C40]", border: "border-[#FF5E83]", dot: "bg-[#FF5E83]", chip: "bg-[#FF5E83]/5 text-[#B81C40]" },
  Turquoise: { bg: "from-[#FFFDF7] to-[#E8FBF7]", text: "text-[#0B7F67]", border: "border-[#13C6A2]", dot: "bg-[#13C6A2]", chip: "bg-[#13C6A2]/5 text-[#0B7F67]" },
  Multicolore: { bg: "from-[#FFFDF7] to-[#F5EEFF]", text: "text-[#7D6AF8]", border: "border-[#7D6AF8]", dot: "bg-[#7D6AF8]", chip: "bg-[#7D6AF8]/5 text-[#7D6AF8]" },
}

const COVER_ART: Record<string, string> = {
  "petit-baobab": "/illustrations/covers/cover-petit-baobab.svg",
  savane: "/illustrations/covers/cover-savane.svg",
  ecole: "/illustrations/covers/cover-ecole.svg",
  afrique: "/illustrations/covers/cover-afrique.svg",
  coloree: "/illustrations/covers/cover-coloree.svg",
  ia: "/illustrations/covers/cover-ia.svg",
}

const FRAME_BORDER: Record<BookFrame, string> = {
  "Faso Dan Fani": "border-[12px] border-[#FF5E83]",
  Bogolan: "border-[14px] border-[#3B2416]",
  Nature: "border-[10px] border-[#20C997]/20",
  Savane: "border-[10px] border-[#FFB300]/20",
  Animaux: "border-[10px] border-[#7D6AF8]/20",
  Aucun: "border-2 border-[#3B2416]/10",
}

function BookCoverComponent({
  cover,
  palette,
  title,
  subtitle,
  childName,
  author,
  frame = "Aucun",
  orientation = "Portrait",
  variant = "interactive",
  className,
}: BookCoverProps) {
  const p = PALETTE[palette] ?? PALETTE.Purple
  const isLandscape = orientation === "Paysage"
  const art = COVER_ART[cover] ?? COVER_ART["petit-baobab"]

  return (
    <div
      className={cn(
        "relative flex w-full flex-col justify-between overflow-hidden rounded-2xl p-5 font-nunito shadow-md",
        "bg-gradient-to-b",
        p.bg,
        variant === "print" && "rounded-none shadow-none",
        isLandscape ? "aspect-[47/32]" : "aspect-[32/47]",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 border-2", FRAME_BORDER[frame])} aria-hidden />

      <div className="z-10 flex items-center justify-between px-1 pt-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B2416]/40">Petit Baobab</span>
        <div className="flex gap-0.5">
          <span className="h-1 w-1 rounded-full bg-[#FF5E83]" />
          <span className="h-1 w-1 rounded-full bg-[#FFD95C]" />
          <span className="h-1 w-1 rounded-full bg-[#20C997]" />
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-1 px-1 text-center">
        <h2 className={cn("w-full break-words text-[16px] font-black uppercase leading-tight tracking-tight sm:text-[18px]", p.text)}>
          {title || "Mon livre de coloriage"}
        </h2>
        {subtitle && (
          <p className="w-full break-words text-[10px] font-bold italic leading-none text-[#7A6A5E]">{subtitle}</p>
        )}
      </div>

      <div className="relative z-10 my-2 flex min-h-[70px] w-full flex-1 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} alt={cover} className="max-h-[200px] w-full object-contain drop-shadow-sm" />
      </div>

      <div className="z-10 flex flex-col items-center gap-0.5 px-1 pb-1">
        <div className="my-0.5 h-0.5 w-6 rounded-full bg-[#3B2416]/10" />
        <p className="text-[9px] font-bold leading-none text-[#3B2416]/80">
          Par : <span className="font-black text-[#3B2416]">{author || "Auteur"}</span>
        </p>
        {childName && (
          <span className={cn("mt-1 rounded-full px-2 py-0.5 text-[8px] font-black", p.chip)}>Créé pour {childName}</span>
        )}
      </div>
    </div>
  )
}

export const BookCover = memo(BookCoverComponent)
