"use client"

import { useBookStore } from "../store/useBookStore"

export function useBookPrinting() {
  const printSettings = useBookStore((state) => state.printSettings)
  const setPrintSetting = useBookStore((state) => state.setPrintSetting)

  return { printSettings, setPrintSetting }
}
