import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

interface InvoiceData {
  invoiceNumber: string
  accountId: string
  customerName: string
  amount: number
  currency: string
  plan: string | null
  packLabel: string | null
  starsEarned: number
  transactionId: string
  createdAt: string
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export async function generateInvoicePdf(data: InvoiceData): Promise<string | null> {
  try {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ format: "a4", unit: "mm" })
    const pageW = 210
    const margin = 20
    let y = margin

    const primary = "#7D6AF8"
    const textDark = "#3B2416"
    const textMuted = "#7A6A5E"

    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(primary)
    doc.text("Petit Baobab", margin, y)
    y += 8

    doc.setFontSize(9)
    doc.setTextColor(textMuted)
    doc.text("Facture de votre abonnement", margin, y)
    y += 18

    doc.setDrawColor(primary)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 10

    doc.setFontSize(18)
    doc.setTextColor(textDark)
    doc.setFont("helvetica", "bold")
    doc.text(`FACTURE ${data.invoiceNumber}`, margin, y)
    y += 10

    doc.setFontSize(10)
    doc.setTextColor(textMuted)
    doc.setFont("helvetica", "normal")
    doc.text(`Date : ${formatDate(data.createdAt)}`, margin, y)
    y += 5
    doc.text(`Transaction : ${data.transactionId.slice(0, 16)}...`, margin, y)
    y += 14

    doc.setDrawColor("#F0E7DA")
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 8

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(textDark)
    doc.text("Détails", margin, y)
    y += 8

    const details = [
      { label: "Plan / Pack", value: data.plan || data.packLabel || "Achat d'étoiles" },
      { label: "Étoiles", value: `${data.starsEarned} ★` },
      { label: "Statut", value: "Payé" },
    ]

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    for (const d of details) {
      doc.setTextColor(textMuted)
      doc.text(d.label, margin, y)
      doc.setTextColor(textDark)
      doc.text(d.value, margin + 80, y)
      y += 7
    }

    y += 6
    doc.setDrawColor("#F0E7DA")
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 10

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(textDark)
    doc.text("Total", margin, y)
    doc.setTextColor(primary)
    doc.text(formatCurrency(data.amount), pageW - margin, y, { align: "right" })
    y += 20

    doc.setDrawColor("#F0E7DA")
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 12

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(textMuted)
    doc.text("Paiement sécurisé via PayDunya", margin, y)
    y += 4
    doc.text("Petit Baobab - Éveillez la créativité de vos élèves", margin, y)

    const pdfBuffer = doc.output("arraybuffer")
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" })

    const supabase = getSupabaseAdmin()
    const filePath = `invoices/${data.accountId}/${data.invoiceNumber}.pdf`

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      if (uploadError.message?.includes("bucket")) {
        const { error: createError } = await supabase.storage.createBucket("invoices", {
          public: true,
        })
        if (createError) {
          console.error("Failed to create invoices bucket:", createError)
          return null
        }
        const { error: retryError } = await supabase.storage
          .from("invoices")
          .upload(filePath, pdfBlob, {
            contentType: "application/pdf",
            upsert: true,
          })
        if (retryError) {
          console.error("Failed to upload invoice PDF after bucket creation:", retryError)
          return null
        }
      } else {
        console.error("Failed to upload invoice PDF:", uploadError)
        return null
      }
    }

    const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(filePath)
    return urlData.publicUrl
  } catch (err) {
    console.error("Invoice PDF generation error:", err)
    return null
  }
}
