import { mapBookToAutosave } from "./bookMapper"
import type { BookWizardState } from "../types"

export function serializeBook(state: BookWizardState): string {
  return JSON.stringify(mapBookToAutosave(state))
}
