import { memo } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { BookPage as BookPageModel } from "../types"
import type { BookStyle, CoverPalette, CoverTemplate } from "../types"
import { BookCover } from "./BookCover"
import { BookFooter } from "./BookFooter"

export interface BookPageProps {
  page: BookPageModel
  index: number
  total: number
  title: string
  subtitle?: string
  author?: string
  childName: string
  palette: CoverPalette
  style: BookStyle
  pageNumbers: boolean
  /** "print" = rendu statique (aucune animation), "interactive" = écran. */
  variant?: "interactive" | "print"
  className?: string
}

function drawingFilter(style: BookStyle): string {
  if (style === "Version couleur") return ""
  if (style === "Traits épais") return "contrast-200"
  return "grayscale brightness-105 contrast-125"
}

function BookPageComponent({
  page,
  index,
  total,
  title,
  subtitle,
  author,
  childName,
  palette,
  style,
  pageNumbers,
  variant = "interactive",
  className,
}: BookPageProps) {
  const isPrint = variant === "print"

  if (page.type === "cover") {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", className)}>
        <BookCover
          cover={page.category as CoverTemplate}
          palette={palette}
          title={title}
          subtitle={subtitle}
          childName={childName}
          author={author}
          variant={variant}
          className="h-full"
        />
      </div>
    )
  }

  if (page.type === "belongs_to") {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-between border-[8px] border-dashed border-[#6D4CFF]/30 bg-[#FFFDF7]/50 p-8 font-nunito",
          className,
        )}
      >
        <div className="flex w-full justify-between text-[10px] font-black uppercase tracking-wider text-[#6D4CFF]/40">
          <span>PETIT BAOBAB</span>
          <span>PAGE DE GARDE</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#3B2416]">Ce livre appartient à :</h2>
          <div className="-rotate-1 rounded-2xl border-2 border-[#3B2416] bg-gradient-to-r from-[#FFD95C] to-[#FFE08A] px-6 py-3 shadow-sm">
            <span className="font-extrabold text-[#3B2416]">{childName || "Awa"}</span>
          </div>
          <p className="mt-2 max-w-[200px] text-[11px] font-bold italic text-[#7A6A5E]">
            Prépare tes plus beaux crayons et amuse-toi bien !
          </p>
        </div>

        <div className="flex w-full justify-between text-[10px] font-bold text-[#64748B]">
          <span>Page {index + 1}</span>
          <span className="font-black text-[#3B2416]/20">petitbaobab.com</span>
        </div>
      </div>
    )
  }

  // Page de dessin
  const src = page.svgPath || page.image
  return (
    <div className={cn("relative flex h-full w-full flex-col justify-between", className)}>
      <div className="z-10 flex w-full justify-between text-[10px] font-black uppercase tracking-widest text-[#6D4CFF]/40">
        <span>{title}</span>
        <span>Coloriage</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-6">
        {src ? (
          <div className="relative h-[85%] w-[85%]">
            <Image
              src={src}
              alt={page.title}
              fill
              unoptimized={page.isPersonal}
              className={cn("object-contain p-2", drawingFilter(style))}
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs font-extrabold text-[#64748B]">Fin du livre</p>
          </div>
        )}
      </div>

      <BookFooter
        showNumber={pageNumbers && page.type === "drawing"}
        pageNumber={index + 1}
        className="z-10"
      />
    </div>
  )
}

export const BookPage = memo(BookPageComponent)
