"use client"

import { motion } from "framer-motion"
import { Download, ScrollText } from "lucide-react"
import { CARD_IN } from "../animations"
import { portfolioEngine } from "../engine/portfolio-engine"
import type { LearningCertificateLike } from "../types"
import { cn } from "@/lib/utils"

interface CertificateCardProps {
  certificates: LearningCertificateLike[]
  onDownload?: (certificate: LearningCertificateLike) => void
  emptyMessage?: string
}

export function CertificateCard({ certificates, onDownload, emptyMessage }: CertificateCardProps) {
  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#EAD9BF] bg-white p-8 text-center">
        <ScrollText className="h-8 w-8 text-[#EAD9BF]" aria-hidden="true" />
        <p className="text-sm font-bold text-[#7A6A5E]">{emptyMessage ?? "Aucun certificat pour le moment."}</p>
        <p className="text-xs font-medium text-[#B4A495]">Terminez un parcours pour gagner un certificat.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {certificates.map((certificate) => (
        <motion.div
          key={certificate.token ?? certificate.path_id}
          variants={CARD_IN}
          initial="hidden"
          animate="visible"
          className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[#20C997]/30 bg-gradient-to-br from-[#F2FCF7] to-white p-4 shadow-sm"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#20C997]/15 text-2xl" aria-hidden="true">
            📜
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#3B2416]">{certificate.path_title}</p>
            <p className="text-xs font-semibold text-[#7A6A5E]">
              {portfolioEngine.formatDate(certificate.issued_at ?? null)}
            </p>
          </div>
          {onDownload && (
            <button
              type="button"
              onClick={() => onDownload(certificate)}
              aria-label={`Télécharger le certificat ${certificate.path_title}`}
              className={cn(
                "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#20C997] text-white transition hover:bg-[#17a982]",
              )}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  )
}
