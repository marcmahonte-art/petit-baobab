"use client"

import { useBookStore } from "../store/useBookStore"

export function useBookCustomization() {
  const bookInfo = useBookStore((state) => state.bookInfo)
  const cover = useBookStore((state) => state.cover)
  const palette = useBookStore((state) => state.palette)
  const style = useBookStore((state) => state.style)
  const frame = useBookStore((state) => state.frame)
  const format = useBookStore((state) => state.format)
  const orientation = useBookStore((state) => state.orientation)

  return { bookInfo, cover, palette, style, frame, format, orientation }
}
