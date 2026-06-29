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
    <header className="min-h-[80px] md:h-[80px] flex flex-col md:flex-row items-center justify-between gap-4 select-none shrink-0 w-full py-4 md:py-0">
      <div className="flex flex-col sm:flex-row items-center gap-[16px] md:gap-[24px] w-full md:w-auto justify-center md:justify-start">
        <Link href="/" className="w-full sm:w-[140px] h-[56px] rounded-full border border-[#EFE7DB] text-[#3B2416] bg-white hover:bg-neutral-50 shadow-sm flex items-center justify-center gap-2.5 transition-all duration-250 hover:scale-[1.03] font-bold text-base cursor-pointer">
          <ArrowLeft className="w-6 h-6 text-[#7A6A5E]" />
          <span>Retour</span>
        </Link>

        <Button
          onClick={onOpenDrawings}
          className="w-full sm:w-[180px] h-[56px] rounded-full bg-gradient-to-b from-[#8B6CFF] to-[#6E4EF5] text-white font-bold text-[18px] shadow-sm flex items-center justify-center gap-2 hover:opacity-95"
        >
          <FolderOpen className="w-6 h-6" />
          <span>Mes dessins</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-[16px] md:gap-[24px] w-full md:w-auto justify-center md:justify-end">
        <Button
          onClick={onDownload}
          variant="premium"
          className="w-full sm:w-[180px] h-[56px] rounded-full bg-[#FFD53D] hover:bg-[#FFD53D]/90 text-[#3B2416] font-extrabold text-[16px] border-none shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-250 hover:scale-[1.03]"
        >
          <Download className="w-6 h-6 text-[#3B2416]" />
          <span>Telecharger</span>
        </Button>

        <Button
          onClick={onPrint}
          variant="default"
          className="w-full sm:w-[180px] h-[56px] rounded-full bg-[#25C76F] hover:bg-[#25C76F]/90 text-white font-extrabold text-[16px] border-none shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-250 hover:scale-[1.03]"
        >
          <Printer className="w-6 h-6 text-white" />
          <span>Imprimer</span>
        </Button>

        <Avatar className="w-[64px] h-[64px] border-2 border-white shadow-sm shrink-0">
          <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=child" />
          <AvatarFallback className="font-bold text-base">AW</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
