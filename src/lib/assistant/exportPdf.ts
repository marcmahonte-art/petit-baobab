import { jsPDF } from "jspdf";
import { PedagogicalSheetRow } from "./queries";

/**
 * Génère un document PDF A4 économe en encre (noir et blanc, mise en page propre)
 * à partir d'une fiche pédagogique générée.
 */
export function generatePedagogicalPdfBuffer(sheet: Partial<PedagogicalSheetRow>): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // 1. En-tête discret (Noir et blanc économe en encre)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("PETIT BAOBAB — FICHE PÉDAGOGIQUE (MENA BURKINA FASO)", margin, cursorY);

  cursorY += 4;
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  cursorY += 10;

  // 2. Titre de la fiche
  const titleText = sheet.title || "Fiche Pédagogique";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);

  const titleLines = doc.splitTextToSize(titleText, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 4;

  // 3. Méta-informations
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  const personaLabel = sheet.persona ? sheet.persona.replace("_", " ").toUpperCase() : "";
  const categoryLabel = sheet.category ? ` • ${sheet.category.toUpperCase()}` : "";
  const dateStr = sheet.created_at
    ? new Date(sheet.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("fr-FR");

  doc.text(`Profil : ${personaLabel}${categoryLabel} | Date : ${dateStr}`, margin, cursorY);
  cursorY += 6;

  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // 4. Contenu Pédagogique Principal (generated_content)
  const bodyText = sheet.generated_content || "Aucun contenu disponible.";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const paragraphs = bodyText.split("\n");

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      cursorY += 4;
      continue;
    }

    const isHeaderLine = /^(#|==|[0-9]+\.|\*)/.test(paragraph.trim()) || paragraph.length < 50 && paragraph.endsWith(":");

    if (isHeaderLine) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
    }

    const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);

    // Pagination automatique si dépassement de la hauteur A4
    if (cursorY + lines.length * 5 > pageHeight - margin) {
      doc.addPage();
      cursorY = 20;

      // Numérotation / En-tête de suite
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Petit Baobab — ${titleText} (suite)`, margin, 12);
      doc.line(margin, 15, pageWidth - margin, 15);
      doc.setFontSize(10);
    }

    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 5 + 3;
  }

  // Footer bas de page
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Page ${i} sur ${pageCount} • Conçu pour l'impression A4 économe en encre • Petit Baobab`,
      margin,
      pageHeight - 8
    );
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
