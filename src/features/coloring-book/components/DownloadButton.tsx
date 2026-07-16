"use client"

import { memo, useCallback } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookPdf } from "../hooks/useBookPdf"
import type { ColoringBook } from "../types/ColoringBook"

export interface DownloadButtonProps {
  book: ColoringBook
  className?: string
}

/**
 * Télécharge le livre au format PDF.
 * Construit le PDF vectoriel à partir du modèle, puis télécharge automatiquement.
 */
function DownloadButtonComponent({ book, className }: DownloadButtonProps) {
  const { status, error, progress, generate } = useBookPdf()

  const handleDownload = useCallback(() => {
    void generate(book)
  }, [book, generate])

  const isBusy = status === "generating" || status === "uploading"

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={handleDownload}
        disabled={isBusy}
        className="h-[64px] w-full rounded-[18px] bg-[#6D4CFF] text-white hover:bg-[#6D5DE8]"
      >
        <Download className="h-6 w-6" />
        <span>{isBusy ? `${progress}%` : "Télécharger le PDF"}</span>
      </Button>
      {status === "error" && error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
    </div>
  )
}

export const DownloadButton = memo(DownloadButtonComponent)
