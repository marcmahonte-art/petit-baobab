import type { BookWizardState } from "../types"

export type PersistedBookState = Partial<
  Pick<BookWizardState, "currentStep" | "bookInfo" | "cover" | "style" | "format" | "orientation" | "selectedImages" | "options">
>

export function deserializeBook(value: string | null): PersistedBookState | null {
  if (!value) return null

  try {
    return JSON.parse(value) as PersistedBookState
  } catch {
    return null
  }
}
