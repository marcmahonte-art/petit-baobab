"use client"

import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface InvoiceButtonProps {
  invoiceNumber: string
  receiptUrl: string | null
}

export function InvoiceButton({ invoiceNumber, receiptUrl }: InvoiceButtonProps) {
  if (!receiptUrl) {
    return (
      <span className="text-xs font-semibold text-[#7A6A5E]/50">-</span>
    )
  }

  return (
    <a
      href={receiptUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-[36px] rounded-full text-xs font-bold border transition-colors cursor-pointer",
        "border-[#EFE7DB] text-[#6D4CFF] hover:bg-[#6D4CFF]/5 hover:border-[#6D4CFF]/30"
      )}
    >
      <Download className="w-3.5 h-3.5" />
      Télécharger reçu
    </a>
  )
}
