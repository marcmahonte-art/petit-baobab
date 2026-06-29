"use client"

import { useEffect } from "react"
import { Limits } from "../constants/book.constants"
import { deserializeBook } from "../lib/bookDeserializer"
import { serializeBook } from "../lib/bookSerializer"
import { useBookStore } from "../store/useBookStore"

const STORAGE_KEY = "petit-baobab-coloring-book-wizard"

export function useBookAutosave() {
  useEffect(() => {
    const saved = deserializeBook(window.localStorage.getItem(STORAGE_KEY))
    if (saved) {
      useBookStore.getState().hydrate(saved)
    }

    let timeout: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = useBookStore.subscribe((state) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        window.localStorage.setItem(STORAGE_KEY, serializeBook(state))
      }, Limits.autosaveMs)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])
}
