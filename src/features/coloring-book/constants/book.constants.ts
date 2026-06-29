import type {
  BookFrameOption,
  BookFormat,
  BookInfo,
  BookOptions,
  BookOrientation,
  BookSettings,
  BookStyleOption,
  CoverPalette,
  CoverPaletteColor,
  CoverTemplate,
  DrawingCategory,
  LibraryDrawing,
  PrintSettings,
} from "../types"

export const Formats: Array<{ id: BookFormat; name: string; dim: string; size: string }> = [
  { id: "A4", name: "A4", dim: "21.0 x 29.7 cm", size: "Grand standard" },
  { id: "A5", name: "A5", dim: "14.8 x 21.0 cm", size: "Compact" },
  { id: "Letter", name: "US Letter", dim: "21.6 x 27.9 cm", size: "Format US" },
  { id: "Carré", name: "Carré", dim: "21.0 x 21.0 cm", size: "Créatif" },
]

export const Orientations: Array<{ id: BookOrientation; name: string; desc: string }> = [
  { id: "Portrait", name: "Portrait", desc: "Vertical" },
  { id: "Paysage", name: "Paysage", desc: "Horizontal" },
  { id: "Carré", name: "Carré", desc: "1:1 Symétrique" },
]

export const Frames: BookFrameOption[] = [
  { id: "Nature", label: "Nature", icon: "⚘" },
  { id: "Faso Dan Fani", label: "Faso Dan Fani", icon: "≣" },
  { id: "Bogolan", label: "Bogolan", icon: "◼" },
  { id: "Savane", label: "Savane", icon: "☀" },
  { id: "Animaux", label: "Animaux", icon: "★" },
  { id: "Aucun", label: "Aucun", icon: "∅" },
]

export const Styles: BookStyleOption[] = [
  { id: "Contour simple", name: "Contour simple", desc: "Traits propres", icon: "✎" },
  { id: "Noir & Blanc détaillé", name: "Noir & Blanc détaillé", desc: "Plus de détails", icon: "◐" },
  { id: "Version couleur", name: "Version couleur", desc: "Aperçu coloré", icon: "◉" },
  { id: "Traits épais", name: "Traits épais", desc: "Pour les petits", icon: "▬" },
]

export const CoverTemplates: Array<{ id: CoverTemplate; name: string }> = [
  { id: "petit-baobab", name: "Petit Baobab" },
  { id: "savane", name: "Savane" },
  { id: "ecole", name: "École" },
  { id: "afrique", name: "Afrique" },
  { id: "coloree", name: "Colorée" },
]

export const CoverPaletteColors: Record<CoverPalette, CoverPaletteColor> = {
  Purple: { primary: "#7D6AF8", secondary: "#F1EFFF", text: "#4A4EBE" },
  Green: { primary: "#20C997", secondary: "#E6FAF4", text: "#0E7C5D" },
  Yellow: { primary: "#FFD95C", secondary: "#FFFDF2", text: "#8A6D00" },
  Orange: { primary: "#FFB300", secondary: "#FFF6E0", text: "#A35C00" },
  Blue: { primary: "#1194FF", secondary: "#E6F4FF", text: "#0056B3" },
  Pink: { primary: "#FF5E83", secondary: "#FFEBF0", text: "#B81C40" },
  Turquoise: { primary: "#13C6A2", secondary: "#E8FBF7", text: "#0B7F67" },
  Multicolore: { primary: "#7D6AF8", secondary: "#FFFDF7", text: "#3B2416" },
}

export const DefaultBookInfo: BookInfo = {
  title: "Animaux du Burkina Faso",
  subtitle: "Mon livre de coloriage",
  author: "Awa & Kofi",
  childName: "Awa",
}

export const DefaultValues = {
  currentStep: 1 as const,
  selectedImages: ["elephant", "lion", "balafon", "village", "baobab", "cameleon"],
  bookInfo: DefaultBookInfo,
  cover: "petit-baobab" as CoverTemplate,
  palette: "Purple" as CoverPalette,
  style: "Contour simple" as const,
  frame: "Nature" as const,
  format: "A4" as BookFormat,
  orientation: "Portrait" as BookOrientation,
}

export const DefaultOptions: BookOptions = {
  pageNumbers: true,
  addTitlePage: true,
  belongsTo: true,
  educationalText: false,
  funFact: false,
  questions: false,
}

export const DefaultPrintSettings: PrintSettings = {
  optimizeInk: false,
  rectoOnly: true,
  cutMarks: false,
  bindingMargin: false,
}

export const DefaultSettings: BookSettings = {
  contourThickness: 50,
  currentChild: "awa",
  searchTerm: "",
  selectedCategory: "all",
  isPreviewOpen: false,
  zoomScale: 1,
  currentBookPage: 0,
}

export const Limits = {
  maxSelectedDrawings: 50,
  autosaveMs: 500,
}

export const PremiumFeatures = ["export-hd", "covers-premium", "batch-print"] as const

export const libraryDrawings: LibraryDrawing[] = [
  { id: "elephant", name: "Éléphant", image: "/illustrations/animals/elephant.svg", category: "animals" },
  { id: "girafe", name: "Girafe", image: "/illustrations/animals/girafe.svg", category: "animals" },
  { id: "lion", name: "Lion", image: "/illustrations/animals/lion.svg", category: "animals" },
  { id: "village", name: "Village africain", image: "/illustrations/village-case-girafe.webp", category: "culture" },
  { id: "cheval", name: "Cheval", image: "/illustrations/animals/cheval.svg", category: "animals" },
  { id: "balafon", name: "Petite fille", image: "/illustrations/culture/balafon.svg", category: "culture" },
  { id: "baobab", name: "Baobab", image: "/illustrations/animals/vache-et-veau-sous-l'arbre.svg", category: "animals" },
  { id: "cameleon", name: "Caméléon", image: "/illustrations/animals/caméléon.svg", category: "animals" },
]

export const categories: DrawingCategory[] = [
  { id: "all", label: "Tous", icon: "✦" },
  { id: "animals", label: "Animaux", icon: "★" },
  { id: "culture", label: "Afrique", icon: "♫" },
  { id: "jobs", label: "Métiers", icon: "⚒" },
  { id: "school", label: "École", icon: "⌂" },
  { id: "fruits", label: "Fruits", icon: "❀" },
]
