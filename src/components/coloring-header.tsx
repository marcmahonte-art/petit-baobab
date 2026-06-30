"use client"

import { ArrowLeft, Download, FolderOpen, Printer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ColoringHeaderProps {
  onDownload?: () => void
  onPrint?: () => void
  onOpenDrawings?: () => void
}

export function ColoringHeader({ onDownload, onPrint, onOpenDrawings }: ColoringHeaderProps) {
  return (
    <header className="min-h-[80px] md:h-[80px] flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 select-none shrink-0 w-full py-2 md:py-0">
      <div className="flex flex-row items-center gap-[12px] md:gap-[24px] w-full md:w-auto justify-between md:justify-start">
        <Link href="/dashboard" className="flex-1 sm:flex-initial sm:w-[140px] h-[52px] rounded-full border border-[#EFE7DB] text-[#3B2416] bg-white hover:bg-neutral-50 shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 transition-all duration-250 hover:scale-[1.03] font-bold text-sm xs:text-base cursor-pointer">
          <ArrowLeft className="w-5 h-5 xs:w-6 xs:h-6 text-[#7A6A5E]" />
          <span>Retour</span>
        </Link>

        <Button
          onClick={onOpenDrawings}
          className="flex-1 sm:flex-initial sm:w-[180px] h-[52px] rounded-full bg-gradient-to-b from-[#8B6CFF] to-[#6E4EF5] text-white font-bold text-sm xs:text-[16px] md:text-[18px] shadow-sm flex items-center justify-center gap-1.5 xs:gap-2 hover:opacity-95"
        >
          <FolderOpen className="w-5 h-5 xs:w-6 xs:h-6" />
          <span>Mes dessins</span>
        </Button>
      </div>

      <div className="flex flex-row items-center gap-[12px] md:gap-[24px] w-full md:w-auto justify-between md:justify-end">
        <Button
          onClick={onDownload}
          variant="premium"
          className="flex-1 sm:flex-initial sm:w-[180px] h-[52px] rounded-full bg-[#FFD53D] hover:bg-[#FFD53D]/90 text-[#3B2416] font-extrabold text-sm xs:text-[16px] border-none shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 cursor-pointer transition-all duration-250 hover:scale-[1.03]"
        >
          <Download className="w-5 h-5 xs:w-6 xs:h-6 text-[#3B2416]" />
          <span>Telecharger</span>
        </Button>

        <Button
          onClick={onPrint}
          variant="default"
          className="flex-1 sm:flex-initial sm:w-[180px] h-[52px] rounded-full bg-[#25C76F] hover:bg-[#25C76F]/90 text-white font-extrabold text-sm xs:text-[16px] border-none shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 cursor-pointer transition-all duration-250 hover:scale-[1.03]"
        >
          <Printer className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
          <span>Imprimer</span>
        </Button>

        <Avatar className="w-12 h-12 md:w-[64px] md:h-[64px] border-2 border-white shadow-sm shrink-0">
          <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=child" />
          <AvatarFallback className="font-bold text-sm">AW</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
