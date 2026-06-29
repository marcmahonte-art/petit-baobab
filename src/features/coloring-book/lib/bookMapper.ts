import type { BookWizardState } from "../types"

export function mapBookToAutosave(state: BookWizardState) {
  return {
    currentStep: state.currentStep,
    bookInfo: state.bookInfo,
    cover: state.cover,
    style: state.style,
    format: state.format,
    orientation: state.orientation,
    selectedImages: state.selectedImages,
    options: state.options,
  }
}
