import type { GameEventType, Difficulty, PlanType, Level, LevelReward } from "./types"

export const GAME_EVENTS: GameEventType[] = [
  "DRAWING_CREATED",
  "DRAWING_COMPLETED",
  "BOOK_CREATED",
  "BOOK_PRINTED",
  "MAGIC_DRAWING_CREATED",
  "COLORING_COMPLETED",
  "GAME_COMPLETED",
  "QUIZ_COMPLETED",
  "STORY_CREATED",
  "LOGIN",
  "DAILY_LOGIN",
  "STREAK_DAY",
  "PROFILE_COMPLETED",
  "FIRST_DOWNLOAD",
  "SHOP_PURCHASE",
  "SHOP_REVIEW",
  "INVITE_PARENT",
  "INVITE_CHILD",
  "CLASS_CREATED",
  "STUDENT_JOINED",
  "STARS_USED",
  "STARS_EARNED",
  "LEVEL_UP",
  "BADGE_UNLOCKED",
  "CHALLENGE_COMPLETED",
  "WORLD_OBJECT_UNLOCKED",
  "WORLD_MEMORY_CREATED",
]

export const XP_PER_EVENT: Record<string, number> = {
  DRAWING_CREATED: 5,
  DRAWING_COMPLETED: 10,
  BOOK_CREATED: 30,
  BOOK_PRINTED: 10,
  MAGIC_DRAWING_CREATED: 20,
  COLORING_COMPLETED: 10,
  GAME_COMPLETED: 12,
  QUIZ_COMPLETED: 10,
  STORY_CREATED: 8,
  LOGIN: 5,
  DAILY_LOGIN: 10,
  STREAK_DAY: 15,
  PROFILE_COMPLETED: 25,
  FIRST_DOWNLOAD: 5,
  SHOP_PURCHASE: 20,
  SHOP_REVIEW: 10,
  INVITE_PARENT: 50,
  INVITE_CHILD: 30,
  CLASS_CREATED: 20,
  STUDENT_JOINED: 10,
  STARS_USED: 0,
  STARS_EARNED: 0,
  LEVEL_UP: 0,
  BADGE_UNLOCKED: 0,
  CHALLENGE_COMPLETED: 0,
  WORLD_OBJECT_UNLOCKED: 0,
  WORLD_MEMORY_CREATED: 0,
}

export const STARS_PER_EVENT: Record<string, number> = {
  DRAWING_COMPLETED: 1,
  LOGIN: 1,
  DAILY_LOGIN: 2,
  STREAK_DAY: 3,
  PROFILE_COMPLETED: 5,
  SHOP_PURCHASE: 2,
  SHOP_REVIEW: 3,
  INVITE_PARENT: 10,
  INVITE_CHILD: 5,
  CLASS_CREATED: 5,
  STUDENT_JOINED: 2,
}

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
}

export const PLAN_XP_BONUS: Record<PlanType, number> = {
  free: 0,
  decouverte: 0.1,
  "super-baobab": 0.25,
  "ecole-pro": 0.5,
}

export const PLAN_STARS_MULTIPLIER: Record<PlanType, number> = {
  free: 1,
  decouverte: 1,
  "super-baobab": 1.5,
  "ecole-pro": 2,
}

export const DURATION_BONUS_THRESHOLD = 300
export const DURATION_BONUS_XP = 5
export const DURATION_BONUS_STARS = 1

export const STREAK_BONUSES = [
  { days: 3, xp: 10, stars: 1 },
  { days: 7, xp: 20, stars: 2 },
  { days: 14, xp: 30, stars: 3 },
  { days: 30, xp: 50, stars: 5 },
  { days: 60, xp: 100, stars: 10 },
  { days: 100, xp: 200, stars: 20 },
]

export const DAILY_REWARDS = [
  { day: 1, xp: 10, stars: 1 },
  { day: 2, xp: 15, stars: 1 },
  { day: 3, xp: 20, stars: 2 },
  { day: 4, xp: 25, stars: 2 },
  { day: 5, xp: 30, stars: 3 },
  { day: 6, xp: 40, stars: 3 },
  { day: 7, xp: 50, stars: 5 },
]

export const BADGE_DEFINITIONS = [
  { id: "first_drawing", name: "Premier Dessin", description: "Termine ton premier coloriage", iconUrl: "/badges/first-drawing.svg", category: "art" as const },
  { id: "super_artist", name: "Super Artiste", description: "Colorie 10 dessins", iconUrl: "/badges/super-artist.svg", category: "art" as const },
  { id: "explorer", name: "Explorateur", description: "Colorie 25 dessins", iconUrl: "/badges/explorer.svg", category: "art" as const },
  { id: "master_artist", name: "Maître Artiste", description: "Colorie 100 dessins", iconUrl: "/badges/master-artist.svg", category: "art" as const },
  { id: "creative_mind", name: "Esprit Créatif", description: "Crée 5 dessins IA", iconUrl: "/badges/creative.svg", category: "creativity" as const },
  { id: "ai_master", name: "Maître de l'IA", description: "Crée 25 dessins IA", iconUrl: "/badges/ai-master.svg", category: "creativity" as const },
  { id: "bookworm", name: "Lecteur", description: "Crée ton premier livre", iconUrl: "/badges/bookworm.svg", category: "reading" as const },
  { id: "author", name: "Auteur", description: "Crée 10 livres", iconUrl: "/badges/author.svg", category: "reading" as const },
  { id: "storyteller", name: "Conteur", description: "Crée 5 histoires", iconUrl: "/badges/storyteller.svg", category: "reading" as const },
  { id: "gamer", name: "Joueur", description: "Joue à 10 jeux", iconUrl: "/badges/gamer.svg", category: "learning" as const },
  { id: "scholar", name: "Érudit", description: "Termine 20 quiz", iconUrl: "/badges/scholar.svg", category: "learning" as const },
  { id: "streak_7", name: "Semaine Complète", description: "7 jours d'affilée", iconUrl: "/badges/streak-7.svg", category: "streak" as const },
  { id: "streak_30", name: "Mois de Folie", description: "30 jours d'affilée", iconUrl: "/badges/streak-30.svg", category: "streak" as const },
  { id: "streak_100", name: "Légende Vivante", description: "100 jours d'affilée", iconUrl: "/badges/streak-100.svg", category: "streak" as const, secret: true },
  { id: "level_10", name: "Apprenti", description: "Atteins le niveau 10", iconUrl: "/badges/level-10.svg", category: "special" as const },
  { id: "level_25", name: "Confirmé", description: "Atteins le niveau 25", iconUrl: "/badges/level-25.svg", category: "special" as const },
  { id: "level_50", name: "Expert", description: "Atteins le niveau 50", iconUrl: "/badges/level-50.svg", category: "special" as const },
  { id: "level_100", name: "Légende", description: "Atteins le niveau 100", iconUrl: "/badges/level-100.svg", category: "special" as const, secret: true },
  { id: "social_butterfly", name: "Papillon Social", description: "Invite 5 amis", iconUrl: "/badges/social.svg", category: "social" as const },
  { id: "teacher_pet", name: "Chouchou", description: "Rejoins une classe", iconUrl: "/badges/teacher-pet.svg", category: "social" as const },
  { id: "shopper", name: "Acheteur", description: "Premier achat boutique", iconUrl: "/badges/shopper.svg", category: "shop" as const },
]

export const BADGE_THRESHOLDS: Record<string, { event: string; count: number }[]> = {
  first_drawing: [{ event: "DRAWING_COMPLETED", count: 1 }],
  super_artist: [{ event: "DRAWING_COMPLETED", count: 10 }],
  explorer: [{ event: "DRAWING_COMPLETED", count: 25 }],
  master_artist: [{ event: "DRAWING_COMPLETED", count: 100 }],
  creative_mind: [{ event: "MAGIC_DRAWING_CREATED", count: 5 }],
  ai_master: [{ event: "MAGIC_DRAWING_CREATED", count: 25 }],
  bookworm: [{ event: "BOOK_CREATED", count: 1 }],
  author: [{ event: "BOOK_CREATED", count: 10 }],
  storyteller: [{ event: "BOOK_CREATED", count: 5 }],
  gamer: [{ event: "GAME_COMPLETED", count: 10 }],
  scholar: [{ event: "QUIZ_COMPLETED", count: 20 }],
  shopper: [{ event: "SHOP_PURCHASE", count: 1 }],
  social_butterfly: [{ event: "INVITE_PARENT", count: 5 }],
  teacher_pet: [{ event: "STUDENT_JOINED", count: 1 }],
}

export const LEVELS: Record<number, Level> = buildLevels()

function buildLevels(): Record<number, Level> {
  const levels: Record<number, Level> = {}
  let cumulativeXp = 0

  for (let i = 1; i <= 100; i++) {
    const xpRequired = i <= 10 ? i * 10 : i <= 30 ? i * 15 : i <= 60 ? i * 25 : i * 50

    const rewards: LevelReward[] = []
    if (i % 5 === 0) rewards.push({ type: "stars", value: Math.min(i * 2, 200) })
    if (i % 10 === 0) rewards.push({ type: "badge", value: `level_${i}` })
    if (i % 25 === 0) rewards.push({ type: "mascot_evolution", value: `evolution_${i}` })

    levels[i] = { level: i, xpRequired, cumulativeXp, rewards }
    cumulativeXp += xpRequired
  }

  return levels
}

export const MAX_LEVEL = 100
export const MAX_STREAK_BONUS = 100
export const DAILY_RESET_HOUR = 0
