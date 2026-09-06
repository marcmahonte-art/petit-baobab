"use client";

import { MemoryBookRecord, MemoryBookPage } from "../types/memory-book.types";

interface ExportPdfOptions {
  onProgress?: (percentage: number, statusText: string) => void;
}

const THEME_COLORS: Record<string, [number, number, number]> = {
  "warm-cream": [255, 249, 242],
  "sunny-yellow": [255, 253, 240],
  "mint-pastel": [242, 252, 248],
  "lavender-light": [248, 246, 255],
  "coral-soft": [255, 246, 246],
};

/**
 * Charge une image et retourne un canvas avec le recadrage/zoom appliqué
 */
async function getClippedImageCanvas(
  url: string,
  zoom: number,
  offsetX: number,
  offsetY: number,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      // Fond blanc
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calcul de dimension couverture (cover)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = targetWidth / targetHeight;

      let drawW = targetWidth;
      let drawH = targetHeight;

      if (imgAspect > targetAspect) {
        drawW = targetHeight * imgAspect;
      } else {
        drawH = targetWidth / imgAspect;
      }

      // Application du zoom
      drawW *= zoom;
      drawH *= zoom;

      // Centrage + offset utilisateur
      const posX = (targetWidth - drawW) / 2 + offsetX * (targetWidth / 340);
      const posY = (targetHeight - drawH) / 2 + offsetY * (targetHeight / 340);

      ctx.drawImage(img, posX, posY, drawW, drawH);
      resolve(canvas);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export const memoryBookPdfExporter = {
  /**
   * Génère un fichier PDF A4 haute définition du cahier de souvenirs complet
   */
  async generatePdf(book: MemoryBookRecord, options?: ExportPdfOptions): Promise<Blob> {
    const { jsPDF } = await import("jspdf");

    // Format A4 portrait en millimètres
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pages = book.pages_data || [];
    const totalPages = pages.length;

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      if (i > 0) {
        pdf.addPage();
      }

      options?.onProgress?.(
        Math.round(((i + 1) / totalPages) * 100),
        `Mise en page de la page ${i + 1}/${totalPages}...`
      );

      // 1. Fond coloré pastel de la page
      const themeRgb = THEME_COLORS[page.backgroundTheme || "warm-cream"] || [255, 249, 242];
      pdf.setFillColor(themeRgb[0], themeRgb[1], themeRgb[2]);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // 2. Bordure décorative
      pdf.setDrawColor(210, 190, 240);
      pdf.setLineWidth(0.6);
      pdf.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 4, 4, "S");

      // 3. En-tête de page
      pdf.setFillColor(125, 106, 248); // #7D6AF8
      pdf.roundedRect(margin + 4, margin + 4, 38, 7, 2, 2, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text((page.categoryTag || "Souvenirs").toUpperCase(), margin + 6, margin + 8.8);

      pdf.setTextColor(120, 120, 140);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Page ${page.pageNumber} / ${totalPages}`, pageWidth - margin - 22, margin + 9);

      // Titre de la page
      pdf.setTextColor(30, 25, 45);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(page.title, margin + 4, margin + 19);

      // Sous-titre
      if (page.subtitle) {
        pdf.setTextColor(90, 85, 110);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(page.subtitle, margin + 4, margin + 24.5);
      }

      // Ligne de séparation
      pdf.setDrawColor(220, 215, 235);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 4, margin + 27, pageWidth - margin - 4, margin + 27);

      // 4. Rendu des éléments séquentiels
      let currentY = margin + 33;

      for (const el of page.elements) {
        if (el.type === "photo") {
          const photoData = el.photoData;
          const isWide = page.id === "p4_classe_enseignants" || page.id === "p8_vacances_aventures";
          const boxW = contentWidth - 8;
          const boxH = isWide ? 65 : 75;
          const posX = margin + 4;

          // Cadre photo
          pdf.setFillColor(245, 242, 250);
          pdf.setDrawColor(180, 165, 230);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(posX, currentY, boxW, boxH, 3, 3, "FD");

          if (photoData?.url) {
            try {
              const canvas = await getClippedImageCanvas(
                photoData.url,
                photoData.zoom || 1,
                photoData.offsetX || 0,
                photoData.offsetY || 0,
                boxW * 4,
                boxH * 4
              );

              if (canvas) {
                const imgData = canvas.toDataURL("image/jpeg", 0.88);
                pdf.addImage(imgData, "JPEG", posX + 0.5, currentY + 0.5, boxW - 1, boxH - 1);
              }
            } catch (err) {
              console.warn("Échec insertion photo dans le PDF", err);
            }
          } else {
            // Emplacement vide
            pdf.setTextColor(150, 140, 170);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text(el.title || "Emplacement Photo", posX + boxW / 2, currentY + boxH / 2, { align: "center" });
          }

          currentY += boxH + 6;
        } else if (el.type === "text") {
          const textData = el.textData;
          const val = textData?.value?.trim() || "";
          const isMulti = textData?.multiline || false;
          const boxW = contentWidth - 8;
          const boxH = isMulti ? 24 : 11;
          const posX = margin + 4;

          // Titre du champ
          if (el.title) {
            pdf.setTextColor(50, 45, 65);
            pdf.setFontSize(8.5);
            pdf.setFont("helvetica", "bold");
            pdf.text(el.title, posX, currentY);
            currentY += 4;
          }

          // Boîte de texte
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(210, 200, 235);
          pdf.setLineWidth(0.4);
          pdf.roundedRect(posX, currentY, boxW, boxH, 2, 2, "FD");

          // Texte renseigné ou pointillé d'écriture
          if (val) {
            pdf.setTextColor(30, 25, 45);
            pdf.setFontSize(textData?.fontSize === "lg" ? 10.5 : 9);
            pdf.setFont("helvetica", textData?.fontStyle === "handwriting" ? "oblique" : "normal");

            if (isMulti) {
              const lines = pdf.splitTextToSize(val, boxW - 6);
              pdf.text(lines, posX + 3, currentY + 5);
            } else {
              pdf.text(val, posX + 3, currentY + 7);
            }
          } else {
            pdf.setTextColor(190, 185, 205);
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(textData?.placeholder || "................................................................", posX + 3, currentY + 6.5);
          }

          currentY += boxH + 4.5;
        }
      }

      // 5. Pied de page du PDF
      pdf.setDrawColor(220, 215, 235);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 4, pageHeight - margin - 8, pageWidth - margin - 4, pageHeight - margin - 8);

      pdf.setTextColor(125, 106, 248);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.text("PETIT BAOBAB — MON CAHIER DE SOUVENIRS", margin + 4, pageHeight - margin - 4);

      pdf.setTextColor(120, 120, 140);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`— ${page.pageNumber} —`, pageWidth / 2, pageHeight - margin - 4, { align: "center" });
    }

    return pdf.output("blob");
  },

  /**
   * Télécharge directement le PDF
   */
  async downloadPdf(book: MemoryBookRecord, options?: ExportPdfOptions): Promise<void> {
    const blob = await this.generatePdf(book, options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const sanitizedTitle = (book.title || "Mon_Cahier_de_Souvenirs").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.href = url;
    a.download = `${sanitizedTitle}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
