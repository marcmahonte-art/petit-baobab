import type { GameEventType } from "../gamification/types"
import type { LevelTitle, UnlockReward, LevelInfo } from "./progression.types"

export const XP_PER_EVENT: Partial<Record<GameEventType, number>> = {
  LOGIN: 5,
  DAILY_LOGIN: 5,
  DRAWING_CREATED: 10,
  DRAWING_COMPLETED: 25,
  COLORING_COMPLETED: 25,
  MAGIC_DRAWING_CREATED: 40,
  BOOK_CREATED: 60,
  BOOK_PRINTED: 15,
  STORY_CREATED: 8,
  GAME_COMPLETED: 20,
  QUIZ_COMPLETED: 30,
}

export const FIRST_ACTIVITY_DAY_BONUS = 20
export const SEVEN_DAY_STREAK_BONUS = 100

export const DEFAULT_AVATAR_FRAME = "frame_classic"
export const DEFAULT_THEME = "savane"

export const LEVEL_TITLES: LevelTitle[] = [
  { level: 1, title: "Petite graine", icon: "🌱" },
  { level: 2, title: "Jeune pousse", icon: "🌿" },
  { level: 3, title: "Petit Baobab", icon: "🌳" },
  { level: 4, title: "Explorateur", icon: "🦁" },
  { level: 5, title: "Aventurier", icon: "🦒" },
  { level: 6, title: "Protecteur", icon: "🐘" },
  { level: 7, title: "Conteur", icon: "🦜" },
  { level: 8, title: "Gardien du Baobab", icon: "👑" },
  { level: 9, title: "Sage du Baobab", icon: "⭐" },
  { level: 10, title: "Légende Petit Baobab", icon: "✨" },
]

export const HIGH_LEVEL_TITLES: LevelTitle[] = [
  { level: 11, title: "Graine d'étoile", icon: "🌟" },
  { level: 12, title: "Feuille de baobab", icon: "🍃" },
  { level: 13, title: "Doux Ruisseau", icon: "💧" },
  { level: 14, title: "Grimpeur", icon: "🧗" },
  { level: 15, title: "Éclaireur", icon: "🔦" },
  { level: 16, title: "Gardien de la savane", icon: "🦓" },
  { level: 17, title: "Messager du vent", icon: "🕊️" },
  { level: 18, title: "Maître des couleurs", icon: "🎨" },
  { level: 19, title: "Champion", icon: "🏆" },
  { level: 20, title: "Héros du Baobab", icon: "🦸" },
]

export const UNLOCKS_BY_LEVEL: Record<number, UnlockReward[]> = {
  2: [
    { type: "brush", key: "brush_arc", label: "Pinceau Arc-en-ciel", icon: "🖌️", description: "Un pinceau magique aux couleurs de l'arc-en-ciel." },
    { type: "color", key: "color_rainbow", label: "Couleurs Arc-en-ciel", icon: "🌈", description: "Débloque les couleurs de l'arc-en-ciel." },
  ],
  3: [
    { type: "mascot", key: "mascot_zuri", label: "Zuri la Girafe", icon: "🦒", description: "Zuri rejoint tes aventures !" },
  ],
  4: [
    { type: "background", key: "bg_village", label: "Fond Village africain", icon: "🏘️", description: "Débloque le fond Village africain." },
  ],
  5: [
    { type: "book", key: "book_baobab_exclusif", label: "Livre exclusif : Le Secret du Baobab", icon: "📖", description: "Un livre exclusif à découvrir." },
  ],
  6: [
    { type: "palette", key: "palette_premium", label: "Palette Premium", icon: "🎨", description: "Accède à la palette de couleurs premium." },
  ],
  7: [
    { type: "sticker", key: "sticker_pack_animaux", label: "Autocollants Animaux", icon: "🦁", description: "Un pack d'autocollants animaux." },
  ],
  8: [
    { type: "frame", key: "frame_doré", label: "Cadre Doré", icon: "🖼️", description: "Un cadre photo doré pour tes créations." },
  ],
  9: [
    { type: "animation", key: "anim_magique", label: "Animations spéciales", icon: "✨", description: "Des animations magiques pour tes coloriages." },
  ],
  10: [
    { type: "pack", key: "pack_complet", label: "Pack complet Petit Baobab", icon: "🎁", description: "Toutes les récompenses débloquées !" },
    { type: "frame", key: "frame_legendaire", label: "Cadre Légendaire", icon: "👑", description: "Le cadre des légendes." },
    { type: "mascot", key: "mascot_baobab", label: "Petit Baobab Mascotte", icon: "🌳", description: "La mascotte Petit Baobab." },
  ],
}

export const DEFAULT_UNLOCKS: UnlockReward[] = [
  { type: "brush", key: "brush_classic", label: "Pinceau Classique", icon: "🖌️", description: "Le pinceau de base pour commencer." },
  { type: "color", key: "color_basic", label: "Couleurs de Base", icon: "🎨", description: "Les couleurs essentielles." },
  { type: "mascot", key: "mascot_bobo", label: "Bobo le Lion", icon: "🦁", description: "Bobo est ton premier compagnon." },
  { type: "background", key: "bg_classic", label: "Fond Classique", icon: "🖼️", description: "Le fond blanc classique." },
  { type: "frame", key: "frame_classic", label: "Cadre Classique", icon: "🖼️", description: "Le cadre simple par défaut." },
  { type: "sticker", key: "sticker_basic", label: "Autocollants de base", icon: "⭐", description: "Quelques autocollants pour décorer." },
]

export const DEFAULT_INVENTORY: { itemKey: string; itemType: string; quantity: number }[] = [
  { itemKey: "brush_classic", itemType: "brush", quantity: 1 },
  { itemKey: "color_basic", itemType: "color", quantity: 1 },
  { itemKey: "mascot_bobo", itemType: "mascot", quantity: 1 },
  { itemKey: "bg_classic", itemType: "background", quantity: 1 },
  { itemKey: "frame_classic", itemType: "frame", quantity: 1 },
  { itemKey: "sticker_basic", itemType: "sticker", quantity: 1 },
]

const LEVEL_FIXED_XP = [10, 100, 250, 450, 700]

export function xpRequiredForLevel(level: number): number {
  if (level < 1) return 0
  if (level <= 5) return LEVEL_FIXED_XP[level - 1]
  return Math.floor(700 * Math.pow(1.4, level - 5))
}

export function getCumulativeXp(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) {
    total += xpRequiredForLevel(l)
  }
  return total
}

export function getTitleForLevel(level: number): LevelTitle {
  const all = [...LEVEL_TITLES, ...HIGH_LEVEL_TITLES]
  const found = all.find((t) => t.level === level)
  if (found) return found
  const fallback = all[all.length - 1]
  return { level, title: `${fallback.title} +${level - 10}`, icon: fallback.icon }
}

export function getUnlocksForLevel(level: number): UnlockReward[] {
  return UNLOCKS_BY_LEVEL[level] ?? []
}

export function getLevelInfo(level: number): LevelInfo {
  const title = getTitleForLevel(level)
  const xpRequired = xpRequiredForLevel(level)
  const cumulativeXp = getCumulativeXp(level)
  return {
    level,
    title: title.title,
    icon: title.icon,
    xpRequired,
    cumulativeXp,
    rewards: getUnlocksForLevel(level),
  }
}

export function getNextRewardForLevel(level: number): UnlockReward | null {
  for (let l = level; l <= 100; l++) {
    const unlocks = getUnlocksForLevel(l)
    if (unlocks.length > 0) return unlocks[0]
  }
  return null
}

export function getFirstActivityBonusEligible(event: GameEventType): boolean {
  return event === "DRAWING_CREATED" || event === "COLORING_COMPLETED" || event === "DRAWING_COMPLETED"
}
