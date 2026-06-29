"use client"

import { canContinue } from "../validators/book.validator"
import { useBookStore } from "../store/useBookStore"

export function useBookValidation() {
  const errors = useBookStore((state) => state.errors)
  const validate = useBookStore((state) => state.validate)

  return {
    errors,
    validate,
    canContinue: canContinue(errors),
  }
}
