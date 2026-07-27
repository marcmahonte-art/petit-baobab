"use client"

import { ArrowLeft, Download, FolderOpen, Printer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"

interface ColoringHeaderProps {
  onDownload?: () => void
  onPrint?: () => void
  onOpenDrawings?: () => void
}

export function ColoringHeader({ onDownload, onPrint, onOpenDrawings }: ColoringHeaderProps) {
  const studentSession = useAuthStore((s) => s.studentSession)
  const user = useAuthStore((s) => s.user)
  const backHref = studentSession ? "/learn/dashboard" : user ? "/learn/dashboard" : "/"

  return (
    <header className="min-h-[68px] md:h-[80px] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 select-none shrink-0 w-full py-1.5 md:py-0">
      <div className="flex flex-row items-center gap-[12px] md:gap-[24px] w-full md:w-auto justify-between md:justify-start">
        <Link href={backHref} className="flex-1 sm:flex-initial sm:w-[120px] md:w-[140px] h-[44px] md:h-[52px] rounded-full border border-[#EFE7DB] text-[#3B2416] bg-white hover:bg-neutral-50 shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 transition-all duration-180 hover:scale-[1.02] font-bold text-xs md:text-sm lg:text-base cursor-pointer">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-[#7A6A5E]" />
          <span>Retour</span>
        </Link>

        <Button
          onClick={onOpenDrawings}
          className="flex-1 sm:flex-initial sm:w-[150px] md:w-[180px] h-[44px] md:h-[52px] rounded-full bg-gradient-to-b from-[#6D4CFF] to-[#5A3EE0] text-white font-bold text-[13px] md:text-[16px] lg:text-[18px] shadow-sm flex items-center justify-center gap-1.5 xs:gap-2 hover:opacity-95"
        >
          <FolderOpen className="w-4 h-4 md:w-5 md:h-5" />
          <span>Mes dessins</span>
        </Button>
      </div>

      <div className="flex flex-row items-center gap-[12px] md:gap-[24px] w-full md:w-auto justify-between md:justify-end">
        <Button
          onClick={onDownload}
          variant="premium"
          className="flex-1 sm:flex-initial sm:w-[150px] md:w-[180px] h-[44px] md:h-[52px] rounded-full bg-[#FFD53D] hover:bg-[#FFD53D]/90 text-[#3B2416] font-extrabold text-[13px] md:text-[16px] border-none shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 cursor-pointer transition-all duration-180 hover:scale-[1.02]"
        >
          <Download className="w-4 h-4 md:w-5 md:h-5 text-[#3B2416]" />
          <span>Télécharger</span>
        </Button>

        <Button
          onClick={onPrint}
          variant="default"
          className="flex-1 sm:flex-initial sm:w-[150px] md:w-[180px] h-[44px] md:h-[52px] rounded-full bg-[#25C76F] hover:bg-[#25C76F]/90 text-white font-extrabold text-[13px] md:text-[16px] border-none shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 cursor-pointer transition-all duration-180 hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <span>Imprimer</span>
        </Button>
      </div>
    </header>
  )
}
