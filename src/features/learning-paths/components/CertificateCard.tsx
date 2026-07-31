"use client"

import { useRef, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { motion } from "framer-motion"
import { CARD_IN } from "../animations"
import { generateCertificatePdf } from "../services/certificate-service"
import { CERTIFICATE_VERIFY_URL, MASCOT_IMAGES, getPathById } from "../constants"
import type { LearningCertificate } from "../types"
import { cn } from "@/lib/utils"

interface CertificateCardProps {
  certificate: LearningCertificate
  childName?: string
  className?: string
}

export function CertificateCard({ certificate, childName, className }: CertificateCardProps) {
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState(false)
  const path = getPathById(certificate.path_id)
  const theme = path?.theme ?? "animals"
  const mascotSrc = MASCOT_IMAGES[certificate.mascot] ?? MASCOT_IMAGES.baobab
  const qrValue = `${CERTIFICATE_VERIFY_URL}/${certificate.token}`

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const qr = qrRef.current?.toDataURL("image/png") ?? null
      await generateCertificatePdf(
        {
          childName: childName ?? "Petit Explorateur",
          mascot: certificate.mascot,
          pathTitle: certificate.path_title,
          pathTheme: theme,
          issuedAt: certificate.issued_at,
          token: certificate.token,
        },
        qr,
        mascotSrc,
      )
    } finally {
      setDownloading(false)
    }
  }

  return (
    <motion.div
      variants={CARD_IN}
      initial="hidden"
      animate="visible"
      className={cn("flex items-center gap-4 rounded-[20px] border border-[#F1E7DA] bg-white p-4 shadow-[0_10px_30px_rgba(59,36,22,0.06)]", className)}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4D6] text-3xl">
        🎓
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6A5E]">Certificat</p>
        <h4 className="truncate text-sm font-extrabold text-[#3B2416]">{certificate.path_title}</h4>
        <p className="text-[11px] font-semibold text-[#7A6A5E]">
          {new Date(certificate.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="mt-2 cursor-pointer rounded-full bg-[#FFB300] px-3 py-1 text-xs font-extrabold text-white transition-transform hover:bg-[#D96A00] active:scale-95 disabled:opacity-60"
        >
          {downloading ? "Préparation..." : "Télécharger le PDF"}
        </button>
      </div>

      {/* QR invisible mais rendu pour l'export PDF */}
      <div className="hidden">
        <QRCodeCanvas ref={qrRef} value={qrValue} size={128} level="M" />
      </div>
    </motion.div>
  )
}
