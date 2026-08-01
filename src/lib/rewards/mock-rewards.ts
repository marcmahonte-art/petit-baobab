// ============================================================
// Petit Baobab — Données mockées du Centre des récompenses
// Aucune connexion Supabase. UI uniquement.
// Source unique pour /learn/rewards.
// ============================================================

export type BadgeTone =
  | "amber"
  | "emerald"
  | "purple"
  | "blue"
  | "pink"
  | "orange";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji (léger, pas d'image lourde)
  tone: BadgeTone;
  earned: boolean;
  obtainedAt?: string;
}

export interface ProgressItem {
  id: string;
  label: string;
  value: number;
  goal: number;
}

export interface UpcomingReward {
  id: string;
  name: string;
  icon: string;
  xpRequired: number;
  currentXp: number;
}

export interface CollectionItem {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

export interface RewardStats {
  level: number;
  xp: number;
  xpForNextLevel: number;
  stars: number;
  starsForNextGift: number;
  badgesEarned: number;
  badgesTotal: number;
  challengesWon: number;
}

export interface RewardsData {
  childName: string;
  stats: RewardStats;
  badges: Badge[];
  progress: ProgressItem[];
  upcomingRewards: UpcomingReward[];
  collection: CollectionItem[];
  advice: string;
}

const BADGE_TONES: Record<string, BadgeTone> = {
  amber: "amber",
  emerald: "emerald",
  purple: "purple",
  blue: "blue",
  pink: "pink",
  orange: "orange",
};

export const MOCK_REWARDS: RewardsData = {
  childName: "Marc",
  stats: {
    level: 7,
    xp: 1800,
    xpForNextLevel: 2500,
    stars: 245,
    starsForNextGift: 300,
    badgesEarned: 12,
    badgesTotal: 20,
    challengesWon: 8,
  },
  badges: [
    { id: "premier-coloriage", name: "Premier coloriage", description: "Ton tout premier coloriage terminé.", icon: "✏️", tone: "amber", earned: true, obtainedAt: "12 mars 2026" },
    { id: "explorateur", name: "Explorateur", description: "Découvre 5 paysages différents.", icon: "🧭", tone: "emerald", earned: true, obtainedAt: "20 mars 2026" },
    { id: "createur", name: "Créateur", description: "Crée 10 dessins magiques.", icon: "⭐", tone: "purple", earned: true, obtainedAt: "2 avr. 2026" },
    { id: "lecteur", name: "Lecteur", description: "Termine 3 livres.", icon: "📖", tone: "blue", earned: true, obtainedAt: "10 avr. 2026" },
    { id: "scientifique", name: "Scientifique", description: "Réalise 5 expériences.", icon: "🔬", tone: "orange", earned: true, obtainedAt: "18 avr. 2026" },
    { id: "mathematicien", name: "Mathématicien", description: "Résous 20 énigmes.", icon: "🔢", tone: "pink", earned: true, obtainedAt: "25 avr. 2026" },
    { id: "artiste", name: "Artiste", description: "Compose une fresque colorée.", icon: "🎨", tone: "purple", earned: true, obtainedAt: "1 mai 2026" },
    { id: "inventeur", name: "Inventeur", description: "Imagine une machine farfelue.", icon: "💡", tone: "amber", earned: true, obtainedAt: "9 mai 2026" },
    { id: "petit-baobab", name: "Petit Baobab", description: "Rejoins la grande famille.", icon: "🌳", tone: "emerald", earned: true, obtainedAt: "1 janv. 2026" },
    // Non débloqués (grisés)
    { id: "musicien", name: "Musicien", description: "Compose ta première chanson.", icon: "🎵", tone: "blue", earned: false },
    { id: "explorateur-pole", name: "Explorateur polaire", description: "Visite les pôles enneigés.", icon: "❄️", tone: "orange", earned: false },
    { id: "gardien", name: "Gardien de la forêt", description: "Protège 10 arbres.", icon: "🌿", tone: "emerald", earned: false },
    { id: "astronaute", name: "Astronaute", description: "Fais un voyage spatial.", icon: "🚀", tone: "purple", earned: false },
    { id: "chef", name: "Petit chef", description: "Prépare un plat africain.", icon: "🍲", tone: "pink", earned: false },
    { id: "poete", name: "Poète", description: "Écris un joli poème.", icon: "📝", tone: "amber", earned: false },
    { id: "danseur", name: "Danseur", description: "Apprends une danse traditionnelle.", icon: "💃", tone: "blue", earned: false },
    { id: "bricoleur", name: "Bricoleur", description: "Construis un objet utile.", icon: "🔧", tone: "orange", earned: false },
    { id: "naturaliste", name: "Naturaliste", description: "Observe 15 animaux.", icon: "🐘", tone: "emerald", earned: false },
    { id: "hero", name: "Héros du village", description: "Aide tous tes amis.", icon: "🦸", tone: "purple", earned: false },
    { id: "legende", name: "Légende vivante", description: "Atteins le niveau maximum.", icon: "👑", tone: "pink", earned: false },
  ],
  progress: [
    { id: "coloriages", label: "Coloriages", value: 6, goal: 10 },
    { id: "livres", label: "Livres créés", value: 2, goal: 5 },
    { id: "defis", label: "Défis réussis", value: 4, goal: 6 },
    { id: "jeux", label: "Jeux gagnés", value: 3, goal: 8 },
    { id: "dessins-ia", label: "Dessins IA", value: 5, goal: 12 },
    { id: "xp", label: "XP gagnés", value: 350, goal: 500 },
  ],
  upcomingRewards: [
    { id: "baobab-geant", name: "Baobab géant", icon: "🌳", xpRequired: 500, currentXp: 1800 },
    { id: "nouveau-compagnon", name: "Nouveau compagnon", icon: "🦁", xpRequired: 750, currentXp: 1800 },
    { id: "coupe-or", name: "Coupe d'or", icon: "🏆", xpRequired: 1000, currentXp: 1800 },
    { id: "livre-magique", name: "Livre magique", icon: "📖", xpRequired: 1250, currentXp: 1800 },
    { id: "nouvelle-ile", name: "Nouvelle île", icon: "🏝️", xpRequired: 1500, currentXp: 1800 },
  ],
  collection: [
    { id: "crayon-magique", name: "Crayon magique", icon: "🖍️", unlocked: true },
    { id: "plume-doree", name: "Plume dorée", icon: "🪶", unlocked: true },
    { id: "papillon", name: "Papillon", icon: "🦋", unlocked: true },
    { id: "coeur", name: "Cœur", icon: "💗", unlocked: true },
    { id: "piece", name: "Pièce", icon: "🪙", unlocked: true },
    { id: "cristal", name: "Cristal", icon: "💎", unlocked: true },
    { id: "masque-africain", name: "Masque africain", icon: "🎭", unlocked: true },
    { id: "tambour", name: "Tambour", icon: "🥁", unlocked: true },
    { id: "panier", name: "Panier", icon: "🧺", unlocked: true },
    { id: "etrange", name: "Objet mystère", icon: "❓", unlocked: false },
  ],
  advice:
    "Continue comme ça ! Tu es très proche du niveau suivant. Aujourd'hui je te conseille de terminer un coloriage.",
};

export function getRewardsData(): RewardsData {
  return MOCK_REWARDS;
}

export { BADGE_TONES };
