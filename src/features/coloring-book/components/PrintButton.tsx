"use client"

import { memo, useCallback } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ColoringBook } from "../types/ColoringBook"

export interface PrintButtonProps {
  book: ColoringBook
  className?: string
}

/**
 * Imprime le livre.
 * 1. Le conteneur .print-only (<BookPrint />) est déjà monté dans la page.
 * 2. On lance window.print() (bloquant) : seule la version impression s'affiche.
 * 3. À la fermeture de la boîte dialogue, on revient automatiquement à l'application.
 * Le composant interactif n'est JAMAIS imprimé (classe .no-print).
 */
function PrintButtonComponent({ book, className }: PrintButtonProps) {
  const handlePrint = useCallback(() => {
    // Le livre est déjà rendu (print-only). On déclenche simplement l'impression.
    window.print()
  }, [])

  return (
    <Button
      type="button"
      onClick={handlePrint}
      variant="outline"
      className={className}
      aria-label="Imprimer le livre"
    >
      <Printer className="h-5 w-5" />
      <span>Imprimer</span>
    </Button>
  )
}

export const PrintButton = memo(PrintButtonComponent)
