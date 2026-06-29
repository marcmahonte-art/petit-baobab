import { create } from "zustand"
import {
  DefaultOptions,
  DefaultPrintSettings,
  DefaultSettings,
  DefaultValues,
  Limits,
} from "../constants/book.constants"
import { buildPreview } from "../utils/book.utils"
import { validateBook } from "../validators/book.validator"
import type {
  BookFormat,
  BookFrame,
  BookInfo,
  BookOptions,
  BookOrientation,
  BookStep,
  BookStyle,
  BookWizardState,
  CoverPalette,
  CoverTemplate,
  LibraryDrawing,
} from "../types"

type Updater<T> = T | ((current: T) => T)

function resolveUpdater<T>(current: T, next: Updater<T>): T {
  return typeof next === "function" ? (next as (value: T) => T)(current) : next
}

function rebuildPreview(state: Pick<BookWizardState, "selectedImages" | "options" | "bookInfo" | "cover" | "customDrawings">) {
  return buildPreview({
    selectedImages: state.selectedImages,
    options: state.options,
    bookInfo: state.bookInfo,
    cover: state.cover,
    customDrawings: state.customDrawings,
  })
}

export interface BookStore extends BookWizardState {
  setCurrentStep: (step: BookStep) => void
  setSelectedImages: (images: Updater<string[]>) => void
  toggleSelectedImage: (id: string) => void
  setBookInfoField: <K extends keyof BookInfo>(key: K, value: BookInfo[K]) => void
  setCover: (cover: CoverTemplate) => void
  setPalette: (palette: CoverPalette) => void
  setStyle: (style: BookStyle) => void
  setFrame: (frame: BookFrame) => void
  setFormat: (format: BookFormat) => void
  setOrientation: (orientation: BookOrientation) => void
  setOption: <K extends keyof BookOptions>(key: K, value: BookOptions[K]) => void
  setPrintSetting: <K extends keyof BookWizardState["printSettings"]>(key: K, value: BookWizardState["printSettings"][K]) => void
  setExportSetting: <K extends keyof BookWizardState["exportSettings"]>(
    key: K,
    value: Updater<BookWizardState["exportSettings"][K]>,
  ) => void
  setSetting: <K extends keyof BookWizardState["settings"]>(key: K, value: Updater<BookWizardState["settings"][K]>) => void
  setCustomDrawings: (drawings: LibraryDrawing[]) => void
  hydrate: (state: Partial<BookWizardState>) => void
  validate: () => boolean
}

const initialState: BookWizardState = {
  currentStep: DefaultValues.currentStep,
  selectedImages: DefaultValues.selectedImages,
  bookInfo: DefaultValues.bookInfo,
  cover: DefaultValues.cover,
  palette: DefaultValues.palette,
  style: DefaultValues.style,
  frame: DefaultValues.frame,
  format: DefaultValues.format,
  orientation: DefaultValues.orientation,
  options: DefaultOptions,
  preview: [],
  exportSettings: {
    bleed: true,
    copiesCount: 10,
    generationProgress: 0,
    isGenerating: false,
  },
  printSettings: DefaultPrintSettings,
  history: [],
  loading: false,
  errors: {},
  isDirty: false,
  settings: DefaultSettings,
  customDrawings: [],
}

initialState.preview = rebuildPreview(initialState)

export const useBookStore = create<BookStore>((set, get) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step, isDirty: true }),
  setCustomDrawings: (drawings) =>
    set((state) => {
      const nextState = { ...state, customDrawings: drawings }
      return { customDrawings: drawings, preview: rebuildPreview(nextState) }
    }),
  setSelectedImages: (images) =>
    set((state) => {
      const selectedImages = resolveUpdater(state.selectedImages, images).slice(0, Limits.maxSelectedDrawings)
      const nextState = { ...state, selectedImages }
      return { selectedImages, preview: rebuildPreview(nextState), isDirty: true }
    }),
  toggleSelectedImage: (id) =>
    set((state) => {
      const selectedImages = state.selectedImages.includes(id)
        ? state.selectedImages.filter((item) => item !== id)
        : state.selectedImages.length >= Limits.maxSelectedDrawings
          ? state.selectedImages
          : [...state.selectedImages, id]
      const nextState = { ...state, selectedImages }
      return { selectedImages, preview: rebuildPreview(nextState), isDirty: true }
    }),
  setBookInfoField: (key, value) =>
    set((state) => {
      const bookInfo = { ...state.bookInfo, [key]: value }
      const nextState = { ...state, bookInfo }
      return { bookInfo, preview: rebuildPreview(nextState), isDirty: true }
    }),
  setCover: (cover) =>
    set((state) => {
      const nextState = { ...state, cover }
      return { cover, preview: rebuildPreview(nextState), isDirty: true }
    }),
  setPalette: (palette) => set({ palette, isDirty: true }),
  setStyle: (style) => set({ style, isDirty: true }),
  setFrame: (frame) => set({ frame, isDirty: true }),
  setFormat: (format) => set({ format, isDirty: true }),
  setOrientation: (orientation) => set({ orientation, isDirty: true }),
  setOption: (key, value) =>
    set((state) => {
      const options = { ...state.options, [key]: value }
      const nextState = { ...state, options }
      return { options, preview: rebuildPreview(nextState), isDirty: true }
    }),
  setPrintSetting: (key, value) =>
    set((state) => ({ printSettings: { ...state.printSettings, [key]: value }, isDirty: true })),
  setExportSetting: (key, value) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        [key]: resolveUpdater(state.exportSettings[key], value),
      },
      isDirty: true,
    })),
  setSetting: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: resolveUpdater(state.settings[key], value) },
      isDirty: true,
    })),
  hydrate: (partial) =>
    set((state) => {
      const nextState = { ...state, ...partial }
      return {
        ...partial,
        preview: rebuildPreview(nextState),
        isDirty: false,
      }
    }),
  validate: () => {
    const state = get()
    const errors = validateBook({
      selectedImages: state.selectedImages,
      bookInfo: state.bookInfo,
      cover: state.cover,
      format: state.format,
      style: state.style,
    })
    set({ errors })
    return Object.keys(errors).length === 0
  },
}))
