export type BookPageType = "cover" | "belongs_to" | "drawing"

export interface BookPage {
  type: BookPageType
  label: string
  details: string
  image?: string
}
