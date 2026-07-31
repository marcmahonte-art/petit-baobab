import type { GameEventType } from "../../gamification/types"
import type { DailyMission, SeasonEvent, XpMultiplier, BattlePassTier, BattlePassReward, ChestDefinition, MonthlyChallenge, WeeklyMission } from "../types"

export const MAX_DAILY_MISSIONS = 3
export const MAX_WEEKLY_MISSIONS = 3

export const DAILY_MISSION_TEMPLATES: Omit<DailyMission, "id" | "created_at">[] = [
  { title: "Colorier un animal", description: "Colorie 1 animal", icon: "🦁", target: 1, event: "COLORING_COMPLETED", reward: { xp: 20, stars: 0 }, difficulty: "easy", is_active: true },
  { title: "Créer 2 coloriages", description: "Crée 2 coloriages", icon: "🎨", target: 2, event: "DRAWING_CREATED", reward: { xp: 10, stars: 30 }, difficulty: "medium", is_active: true },
  { title: "Créer un livre", description: "Crée 1 livre", icon: "📖", target: 1, event: "BOOK_CREATED", reward: { xp: 30, stars: 0, item: "book_bonus" }, difficulty: "medium", is_active: true },
  { title: "Faire un jeu", description: "Joue à 1 jeu", icon: "🎮", target: 1, event: "GAME_COMPLETED", reward: { xp: 15, stars: 0, item: "sticker_bonus" }, difficulty: "easy", is_active: true },
  { title: "Lire une histoire", description: "Lira 1 histoire", icon: "📚", target: 1, event: "STORY_CREATED", reward: { xp: 10, stars: 0, badge: "reader" }, difficulty: "easy", is_active: true },
  { title: "Réussir un quiz", description: "Réussis 1 quiz", icon: "🧠", target: 1, event: "QUIZ_COMPLETED", reward: { xp: 25, stars: 5 }, difficulty: "medium", is_active: true },
  { title: "Créer un dessin magique", description: "Crée 1 dessin IA", icon: "✨", target: 1, event: "MAGIC_DRAWING_CREATED", reward: { xp: 35, stars: 0, item: "background_bonus" }, difficulty: "hard", is_active: true },
]

export const WEEKLY_MISSION_TEMPLATES: Omit<WeeklyMission, "id" | "starts_at" | "ends_at">[] = [
  { title: "Colorier 5 animaux", description: "Colorie 5 animaux cette semaine", icon: "🦒", target: 5, event: "COLORING_COMPLETED", reward: { xp: 100, stars: 50 }, difficulty: "medium" as const },
  { title: "Créer 3 livres", description: "Crée 3 livres cette semaine", icon: "📚", target: 3, event: "BOOK_CREATED", reward: { xp: 150, stars: 0, item: "book_special" }, difficulty: "hard" as const },
  { title: "Jouer à 5 jeux", description: "Joue à 5 jeux cette semaine", icon: "🎮", target: 5, event: "GAME_COMPLETED", reward: { xp: 80, stars: 40 }, difficulty: "easy" as const },
  { title: "Créer 7 coloriages", description: "Crée 7 coloriages cette semaine", icon: "🎨", target: 7, event: "DRAWING_CREATED", reward: { xp: 120, stars: 60 }, difficulty: "medium" as const },
]

export const MONTHLY_CHALLENGES: Omit<MonthlyChallenge, "id" | "starts_at" | "ends_at">[] = [
  { title: "Défi du mois : 15 coloriages", description: "Colorie 15 dessins ce mois-ci", icon: "🏆", event: "COLORING_COMPLETED", target: 15, reward: { xp: 500, stars: 200, item: "frame_gold" } },
  { title: "Défi du mois : 5 livres", description: "Crée 5 livres ce mois-ci", icon: "📖", event: "BOOK_CREATED", target: 5, reward: { xp: 600, stars: 250, item: "mascot_special" } },
  { title: "Défi du mois : 10 jeux", description: "Joue à 10 jeux ce mois-ci", icon: "🎮", event: "GAME_COMPLETED", target: 10, reward: { xp: 450, stars: 180, item: "animation_special" } },
]

export const SEASONS: Omit<SeasonEvent, "id" | "starts_at" | "ends_at" | "is_active" | "missions" | "badges">[] = [
  { name: "La rentrée", slug: "rentree", theme: "retour à l'école", banner: "/seasons/rentree.webp", primary_color: "#FF8A00", secondary_color: "#FFD95C" },
  { name: "Les animaux d'Afrique", slug: "animaux-afrique", theme: "savane et animaux", banner: "/seasons/animaux.webp", primary_color: "#FF6B35", secondary_color: "#FFD95C" },
  { name: "Les métiers", slug: "metiers", theme: "découverte des métiers", banner: "/seasons/metiers.webp", primary_color: "#1D9E75", secondary_color: "#8BC34A" },
  { name: "Noël", slug: "noel", theme: "magie de Noël", banner: "/seasons/noel.webp", primary_color: "#E63946", secondary_color: "#FFD95C" },
  { name: "Le monde", slug: "monde", theme: "voyage autour du monde", banner: "/seasons/monde.webp", primary_color: "#1194FF", secondary_color: "#8BC34A" },
  { name: "Les émotions", slug: "emotions", theme: "comprendre les émotions", banner: "/seasons/emotions.webp", primary_color: "#FF5E83", secondary_color: "#FFD95C" },
  { name: "Les plantes", slug: "plantes", theme: "la nature et les plantes", banner: "/seasons/plantes.webp", primary_color: "#8BC34A", secondary_color: "#1D9E75" },
  { name: "Les océans", slug: "oceans", theme: "la vie sous-marine", banner: "/seasons/oceans.webp", primary_color: "#00B4D8", secondary_color: "#1194FF" },
  { name: "Les transports", slug: "transports", theme: "tous les transports", banner: "/seasons/transports.webp", primary_color: "#FFB300", secondary_color: "#FF8A00" },
  { name: "Les vacances", slug: "vacances", theme: "l'été et les vacances", banner: "/seasons/vacances.webp", primary_color: "#FF8A00", secondary_color: "#FFD95C" },
]

export const MONTH_INDEX = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6]

export const CHESTS: ChestDefinition[] = [
  {
    id: "bronze", name: "Coffre Bronze", icon: "🪙", day: 7, color: "#CD7F32",
    contents: [
      { type: "xp", quantity: 50 },
      { type: "stars", quantity: 10 },
      { type: "sticker", key: "sticker_common", quantity: 1, label: "Autocollant commun" },
    ],
  },
  {
    id: "silver", name: "Coffre Argent", icon: "🥈", day: 15, color: "#C0C0C0",
    contents: [
      { type: "xp", quantity: 150 },
      { type: "stars", quantity: 30 },
      { type: "background", key: "bg_silver", quantity: 1, label: "Fond argenté" },
    ],
  },
  {
    id: "gold", name: "Coffre Or", icon: "🥇", day: 30, color: "#FFD700",
    contents: [
      { type: "xp", quantity: 400 },
      { type: "stars", quantity: 80 },
      { type: "frame", key: "frame_gold", quantity: 1, label: "Cadre doré" },
      { type: "badge", key: "calendar_gold", quantity: 1, label: "Badge Calendrier d'Or" },
    ],
  },
  {
    id: "diamond", name: "Coffre Diamant", icon: "💎", day: 60, color: "#B9F2FF",
    contents: [
      { type: "xp", quantity: 1000 },
      { type: "stars", quantity: 200 },
      { type: "mascot", key: "mascot_diamond", quantity: 1, label: "Mascotte Diamant" },
      { type: "animation", key: "anim_diamond", quantity: 1, label: "Animation spéciale" },
    ],
  },
  {
    id: "legendary", name: "Coffre Légendaire", icon: "👑", day: 90, color: "#B26BFF",
    contents: [
      { type: "xp", quantity: 2500 },
      { type: "stars", quantity: 500 },
      { type: "pack", key: "pack_legendary", quantity: 1, label: "Pack Légendaire" },
      { type: "badge", key: "calendar_legendary", quantity: 1, label: "Badge Légende" },
    ],
  },
]

export const DEFAULT_MULTIPLIERS: XpMultiplier[] = [
  { id: "weekend", label: "Week-end", multiplier: 2, xpOnly: true, starts_at: "", ends_at: "" },
  { id: "vacances", label: "Vacances", multiplier: 2, starsOnly: true, starts_at: "", ends_at: "" },
  { id: "event_livres", label: "Événement Livres", multiplier: 3, appliesTo: ["BOOK_CREATED", "BOOK_PRINTED"], starts_at: "", ends_at: "" },
]

export const BATTLE_PASS_TIERS: BattlePassTier[] = Array.from({ length: 20 }, (_, i) => ({
  level: i + 1,
  xpRequired: (i + 1) * 100,
  freeRewards: i === 0 ? [{ type: "stars", key: "stars", label: "5 étoiles", quantity: 5 }] : [],
  premiumRewards: buildPremiumReward(i + 1),
}))

function buildPremiumReward(level: number): BattlePassReward[] {
  const rewards: BattlePassReward[] = []
  if (level === 1) rewards.push({ type: "background", key: "bg_battle", label: "Fond Battle Pass", quantity: 1 })
  if (level === 3) rewards.push({ type: "sticker", key: "sticker_battle", label: "Pack autocollants", quantity: 5 })
  if (level === 5) rewards.push({ type: "frame", key: "frame_battle", label: "Cadre Battle Pass", quantity: 1 })
  if (level === 8) rewards.push({ type: "book", key: "book_battle", label: "Livre exclusif", quantity: 1 })
  if (level === 10) rewards.push({ type: "avatar", key: "avatar_battle", label: "Avatar spécial", quantity: 1 })
  if (level === 12) rewards.push({ type: "mascot", key: "mascot_battle", label: "Mascotte Battle Pass", quantity: 1 })
  if (level === 15) rewards.push({ type: "background", key: "bg_battle_legend", label: "Fond légendaire", quantity: 1 })
  if (level === 20) rewards.push({ type: "mascot", key: "mascot_legend", label: "Mascotte Légendaire", quantity: 1 })
  if (rewards.length === 0) rewards.push({ type: "stars", key: "stars", label: "10 étoiles", quantity: 10 })
  return rewards
}

export const BATTLE_PASS_SEASON_LENGTH = 20

export const DIFFICULTY_STAR_BONUS: Record<string, number> = {
  easy: 0,
  medium: 5,
  hard: 10,
}

export const MISSION_ITEM_EMIT_EVENTS: Record<string, GameEventType> = {
  book_bonus: "BOOK_CREATED",
  book_special: "BOOK_CREATED",
  sticker_bonus: "GAME_COMPLETED",
  background_bonus: "MAGIC_DRAWING_CREATED",
  frame_gold: "COLORING_COMPLETED",
  mascot_special: "BOOK_CREATED",
  animation_special: "GAME_COMPLETED",
}
