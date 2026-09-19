export type StoryStatus = "draft" | "generating" | "ready" | "failed" | "archived"

export type StoryThemeId = "amitie" | "nature" | "education" | "aventure" | "culture" | "famille"

export interface StoryTheme {
  id: StoryThemeId
  label: string
  icon: string
  color: string
  bgLight: string
  textColor: string
}

export interface StoryPage {
  pageNumber: number
  title?: string
  text: string
  illustrationUrl: string
  audioUrl?: string
  scene?: string
  emotion?: string
}

export interface StoryCharacter {
  name: string
  type?: string
  age?: number
  gender?: string
  skinTone?: string
  hair?: string
  clothing?: string
  personality?: string[]
  visualDescription?: string
}

export interface Story {
  id: string
  title: string
  description: string
  coverUrl: string
  ageRange: string // e.g. "6-8 ans", "5-7 ans", "7-10 ans"
  themeId: StoryThemeId
  themeLabel: string
  category: string // e.g. "Aventure", "Culture", "Nature", "Éducation", "Rêve", "Amitié"
  categoryColor: string
  country?: string
  region?: string
  environment?: string
  pages: StoryPage[]
  moral?: string
  status?: StoryStatus
  character?: StoryCharacter
  characterName?: string
  authorName?: string
  explanation?: string
  educationalGoal?: string
  visualStyle?: string
  isFavorite?: boolean
  readCount?: number
  isChildFavorite?: boolean
  createdAt?: string
}
