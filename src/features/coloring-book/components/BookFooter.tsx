import { memo } from "react"
import { cn } from "@/lib/utils"

export interface BookFooterProps {
  /** Numéro de page affiché (1-based). */
  pageNumber?: number
  showNumber?: boolean
  className?: string
}

/** Pied de page commun à toutes les pages (numérotation + marque). */
function BookFooterComponent({ pageNumber, showNumber, className }: BookFooterProps) {
  return (
    <div className={cn("flex w-full items-center justify-between px-1 text-[10px] font-bold text-[#64748B]", className)}>
      {showNumber ? <span>Page {pageNumber}</span> : <span />}
      <span className="font-black text-[#3B2416]/20">Petit Baobab</span>
    </div>
  )
}

export const BookFooter = memo(BookFooterComponent)
