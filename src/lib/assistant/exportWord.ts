import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx";
import { PedagogicalSheetRow } from "./queries";

/**
 * Génère un fichier Word (.docx) propre et modifiable pour Microsoft Word
 * à partir du contenu d'une fiche pédagogique.
 */
export async function generatePedagogicalDocxBuffer(sheet: Partial<PedagogicalSheetRow>): Promise<Buffer> {
  const titleText = sheet.title || "Fiche Pédagogique";
  const bodyText = sheet.generated_content || "Aucun contenu disponible.";
  const personaLabel = sheet.persona ? sheet.persona.replace("_", " ").toUpperCase() : "";
  const dateStr = sheet.created_at
    ? new Date(sheet.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("fr-FR");

  const docParagraphs: Paragraph[] = [
    // Header En-tête
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "PETIT BAOBAB — FICHE PÉDAGOGIQUE (BURKINA FASO)",
          bold: true,
          size: 18,
          color: "666666",
        }),
      ],
    }),
    new Paragraph({ text: "" }), // Espace

    // Titre de la fiche
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: titleText,
          bold: true,
          size: 32,
          color: "35180D",
        }),
      ],
    }),

    // Méta-informations
    new Paragraph({
      children: [
        new TextRun({
          text: `Profil : ${personaLabel} | Date : ${dateStr}`,
          italics: true,
          size: 20,
          color: "7A6A5E",
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  ];

  // Découpage du texte en paragraphes Word
  const lines = bodyText.split("\n");
  for (const line of lines) {
    if (!line.trim()) {
      docParagraphs.push(new Paragraph({ text: "" }));
      continue;
    }

    const isHeading = /^(#|==|[0-9]+\.|\*)/.test(line.trim()) || (line.length < 50 && line.endsWith(":"));

    if (isHeading) {
      docParagraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: line.trim(),
              bold: true,
              size: 24,
              color: "6535E8",
            }),
          ],
        })
      );
    } else {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: 22,
              color: "333333",
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
