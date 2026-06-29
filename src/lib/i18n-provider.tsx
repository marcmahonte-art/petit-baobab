'use client'

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react'
import {
  useI18nStore,
  translate,
  translations,
  type Lang,
} from './i18n'

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string
  lang: Lang
  setLanguage: (lang: Lang) => void
  translations: typeof translations
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useI18nStore((s) => s.lang)
  const setLanguage = useI18nStore((s) => s.setLanguage)

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(key, lang, params),
    [lang],
  )

  return (
    <I18nContext.Provider value={{ t, lang, setLanguage, translations }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
