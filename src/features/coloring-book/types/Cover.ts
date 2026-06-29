export type CoverTemplate = "petit-baobab" | "savane" | "ecole" | "afrique" | "coloree"

export type CoverPalette =
  | "Purple"
  | "Green"
  | "Yellow"
  | "Orange"
  | "Blue"
  | "Pink"
  | "Turquoise"
  | "Multicolore"

export interface CoverPaletteColor {
  primary: string
  secondary: string
  text: string
}
