"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useBookStore } from "../store/useBookStore"
import type { BookWizardState } from "../types"

/**
 * Facade Context sur le store Zustand existant.
 * Le prompt demande un `BookContext` ; on l'implémente comme adaptateur
 * sans dupliquer l'état (single source of truth = Zustand).
 */
const BookContext = createContext<BookWizardState | null>(null)

export function BookProvider({ children }: { children: ReactNode }) {
  const state = useBookStore()
  return <BookContext.Provider value={state}>{children}</BookContext.Provider>
}

export function useBook(): BookWizardState {
  const ctx = useContext(BookContext)
  if (!ctx) throw new Error("useBook doit être utilisé dans <BookProvider>")
  return ctx
}
