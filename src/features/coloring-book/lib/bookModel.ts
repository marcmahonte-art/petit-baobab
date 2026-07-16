import type { BookWizardState } from "../types"
import type { ColoringBook, ColoringBookSettings } from "../types/ColoringBook"

/**
 * Convertit l'état du store (wizard) en modèle de domaine `ColoringBook`.
 * Le modèle est la SEULE source de vérité consommée par l'impression et le PDF.
 */
export function toColoringBook(state: BookWizardState): ColoringBook {
  const settings: ColoringBookSettings = {
    pageNumbers: state.options.pageNumbers,
    addTitlePage: state.options.addTitlePage,
    belongsTo: state.options.belongsTo,
    educationalText: state.options.educationalText,
    funFact: state.options.funFact,
    questions: state.options.questions,
    optimizeInk: state.printSettings.optimizeInk,
    rectoOnly: state.printSettings.rectoOnly,
    cutMarks: state.printSettings.cutMarks,
    bindingMargin: state.printSettings.bindingMargin,
    bleed: state.exportSettings.bleed,
  }

  return {
    id: state.bookInfo.title || "livre-coloriage",
    title: state.bookInfo.title,
    subtitle: state.bookInfo.subtitle,
    author: state.bookInfo.author,
    childName: state.bookInfo.childName,
    cover: state.cover,
    palette: state.palette,
    style: state.style,
    frame: state.frame,
    format: state.format,
    orientation: state.orientation,
    drawingCount: state.selectedImages.length,
    settings,
    // Pages déjà ordonnées et identifiées de façon unique par `buildPreview`.
    pages: state.preview,
  }
}
