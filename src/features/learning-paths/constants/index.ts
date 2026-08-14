import type {
  DifficultyDefinition,
  LessonType,
  LessonTypeDefinition,
  LearningLesson,
  LearningModule,
  LearningPath,
  PathTheme,
  ThemeDefinition,
} from "../types"
import type { GameEventType } from "../../gamification/types"

export const LESSON_TYPES: LessonTypeDefinition[] = [
  { type: "COLORING", label: "Coloriage", icon: "🎨", href: "/learn/coloriage", description: "Colorie une illustration" },
  { type: "MAGIC_DRAWING", label: "Dessin magique", icon: "✨", href: "/learn/magic-drawing", description: "Crée un dessin magique IA" },
  { type: "BOOK", label: "Livre", icon: "📖", href: "/learn/livres-de-coloriage", description: "Crée ou lis un livre" },
  { type: "GAME", label: "Jeu", icon: "🎮", href: "/learn/parcours", description: "Joue à un jeu éducatif" },
  { type: "QUIZ", label: "Quiz", icon: "❓", href: "/learn/parcours", description: "Réponds à un quiz" },
  { type: "STORY", label: "Histoire", icon: "📚", href: "/learn/parcours", description: "Écoute ou crée une histoire" },
  { type: "VIDEO", label: "Vidéo", icon: "🎬", href: "/learn/parcours", description: "Regarde une vidéo éducative" },
  { type: "CHALLENGE", label: "Défi", icon: "🏆", href: "/learn/parcours", description: "Relève un défi" },
  { type: "MISSION", label: "Mission", icon: "🎯", href: "/learn/parcours", description: "Accomplis une mission du jour" },
  { type: "COLLECTION", label: "Collection", icon: "🗂️", href: "/learn/world", description: "Débloque une collection du monde" },
]

export const LESSON_TYPE_ICON: Record<LessonType, string> = {
  COLORING: "🎨",
  MAGIC_DRAWING: "✨",
  BOOK: "📖",
  GAME: "🎮",
  QUIZ: "❓",
  STORY: "📚",
  VIDEO: "🎬",
  CHALLENGE: "🏆",
  MISSION: "🎯",
  COLLECTION: "🗂️",
}

/**
 * Événement de gamification qui valide automatiquement chaque type de leçon.
 * Les types sans événement (VIDEO) sont validés manuellement.
 */
export const LESSON_EVENT_MAP: Partial<Record<LessonType, GameEventType>> = {
  COLORING: "COLORING_COMPLETED",
  MAGIC_DRAWING: "MAGIC_DRAWING_CREATED",
  BOOK: "BOOK_CREATED",
  GAME: "GAME_COMPLETED",
  QUIZ: "QUIZ_COMPLETED",
  STORY: "STORY_CREATED",
  CHALLENGE: "CHALLENGE_COMPLETED",
  MISSION: "CHALLENGE_COMPLETED",
  COLLECTION: "WORLD_OBJECT_UNLOCKED",
}

export const LESSON_TYPES_AUTO_VALIDATED: LessonType[] = Object.keys(LESSON_EVENT_MAP) as LessonType[]

export function isLessonAutoValidated(type: LessonType): boolean {
  return type in LESSON_EVENT_MAP
}

export const PATH_DIFFICULTIES: DifficultyDefinition[] = [
  { key: "beginner", label: "Débutant", icon: "🌱", color: "#20C997", recommendedMinLevel: 1 },
  { key: "intermediate", label: "Intermédiaire", icon: "🌿", color: "#FFB300", recommendedMinLevel: 3 },
  { key: "advanced", label: "Avancé", icon: "🌳", color: "#FF6B35", recommendedMinLevel: 5 },
  { key: "expert", label: "Expert", icon: "🌟", color: "#7D6AF8", recommendedMinLevel: 8 },
]

export function getDifficulty(key: string): DifficultyDefinition {
  return PATH_DIFFICULTIES.find((d) => d.key === key) ?? PATH_DIFFICULTIES[0]
}

export const PATH_THEMES: ThemeDefinition[] = [
  { theme: "art", label: "Art", icon: "🎨", primary: "#FF6B6B", secondary: "#FFD95C", accent: "#FF8A00" },
  { theme: "africa", label: "Afrique", icon: "🦁", primary: "#FF8A00", secondary: "#8BC34A", accent: "#FFD95C" },
  { theme: "alphabet", label: "Alphabet", icon: "🔤", primary: "#7D6AF8", secondary: "#B7C9FF", accent: "#5B4AE0" },
  { theme: "numbers", label: "Nombres", icon: "🔢", primary: "#20C997", secondary: "#B7F0E0", accent: "#128A6B" },
  { theme: "colors", label: "Couleurs", icon: "🌈", primary: "#FF5E83", secondary: "#FFD95C", accent: "#7D6AF8" },
  { theme: "animals", label: "Animaux", icon: "🐘", primary: "#1D9E75", secondary: "#DDF26B", accent: "#8A6B2E" },
  { theme: "nature", label: "Nature", icon: "🌿", primary: "#8BC34A", secondary: "#B7E4A0", accent: "#3E7B27" },
  { theme: "reading", label: "Lecture", icon: "📖", primary: "#1194FF", secondary: "#B7D9FF", accent: "#0A6FB8" },
  { theme: "creativity", label: "Créativité", icon: "💡", primary: "#FF6B35", secondary: "#FFD95C", accent: "#C44A1D" },
  { theme: "jobs", label: "Métiers", icon: "👩‍⚕️", primary: "#5B7CFA", secondary: "#C9D3FF", accent: "#3B55C4" },
  { theme: "music", label: "Musique", icon: "🎵", primary: "#C44AD8", secondary: "#F0B7FF", accent: "#8A2BA0" },
  { theme: "science", label: "Sciences", icon: "🔬", primary: "#00B4D8", secondary: "#B7ECFF", accent: "#007C99" },
  { theme: "planet", label: "Planète", icon: "🌍", primary: "#1194FF", secondary: "#8BC34A", accent: "#0A6FB8" },
  { theme: "emotions", label: "Émotions", icon: "💛", primary: "#FF8A00", secondary: "#FFD95C", accent: "#D96A00" },
  { theme: "health", label: "Santé", icon: "💧", primary: "#20C997", secondary: "#B7F0E0", accent: "#128A6B" },
  { theme: "safety", label: "Sécurité", icon: "🦺", primary: "#E63946", secondary: "#FFD1D1", accent: "#B02A35" },
]

export function getTheme(theme: PathTheme): ThemeDefinition {
  return PATH_THEMES.find((t) => t.theme === theme) ?? PATH_THEMES[0]
}

/** Récompense XP de base par type de leçon (surchargeable par leçon). */
export const LESSON_BASE_XP: Record<LessonType, number> = {
  COLORING: 10,
  MAGIC_DRAWING: 15,
  BOOK: 20,
  GAME: 15,
  QUIZ: 15,
  STORY: 15,
  VIDEO: 10,
  CHALLENGE: 25,
  MISSION: 25,
  COLLECTION: 20,
}

export const LESSON_BASE_STARS: Record<LessonType, number> = {
  COLORING: 1,
  MAGIC_DRAWING: 2,
  BOOK: 2,
  GAME: 2,
  QUIZ: 2,
  STORY: 2,
  VIDEO: 1,
  CHALLENGE: 3,
  MISSION: 3,
  COLLECTION: 2,
}

export const MODULE_COMPLETION_XP = 30
export const PATH_COMPLETION_XP = 100
export const PATH_COMPLETION_STARS = 5

export const MASCOT_IMAGES: Record<string, string> = {
  bobo: "/illustrations/mascots/bobo-lion.png",
  kaya: "/illustrations/mascots/kaya-elephant.png",
  zuri: "/illustrations/mascots/zuri-girafe.png",
  momo: "/illustrations/mascots/momo-singe.png",
  kiki: "/illustrations/mascots/kiki-perroquet.png",
  baobab: "/illustrations/mascots/baobab-guide.png",
}

export const CERTIFICATE_SIGNATURE = "Petit Baobab"

export const CERTIFICATE_VERIFY_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) || "https://www.monpetitbaobab.com"

// ---------------------------------------------------------------------------
// Contenu des parcours (canonique)
// ---------------------------------------------------------------------------

type LessonSeed = readonly [type: LessonType, title: string, contentId?: string]

interface ModuleSeed {
  title: string
  description: string
  lessons: readonly LessonSeed[]
}

interface PathSeed {
  slug: string
  title: string
  description: string
  age_min: number
  age_max: number
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  theme: PathTheme
  icon: string
  tags: string[]
  mascot: string
  badge: { id: string; name: string; icon: string }
  duration: number
  modules: readonly ModuleSeed[]
}

function buildPath(seed: PathSeed, index: number): LearningPath {
  const theme = getTheme(seed.theme)
  let moduleIndex = 0
  const modules: LearningModule[] = seed.modules.map((m) => {
    moduleIndex += 1
    const moduleId = `${seed.slug}_m${moduleIndex}`
    const lessons: LearningLesson[] = m.lessons.map(([type, title, contentId], lessonIndex) => ({
      id: `${moduleId}_l${lessonIndex + 1}`,
      module_id: moduleId,
      title,
      lesson_type: type,
      content_id: contentId ?? null,
      order_index: lessonIndex + 1,
      reward_xp: LESSON_BASE_XP[type],
      reward_stars: LESSON_BASE_STARS[type],
    }))
    const lessonXp = lessons.reduce((sum, l) => sum + l.reward_xp, 0)
    return {
      id: moduleId,
      path_id: seed.slug,
      title: m.title,
      description: m.description,
      order_index: moduleIndex,
      reward_xp: lessonXp + MODULE_COMPLETION_XP,
      reward_stars: lessons.reduce((sum, l) => sum + l.reward_stars, 0),
      reward_badge: null,
      lessons,
    }
  })

  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const pathXp = modules.reduce((sum, m) => sum + m.reward_xp, 0)

  return {
    id: seed.slug,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    age_min: seed.age_min,
    age_max: seed.age_max,
    difficulty: seed.difficulty,
    theme: seed.theme,
    cover: theme.icon,
    icon: seed.icon,
    estimated_duration: seed.duration,
    order_index: index + 1,
    is_active: true,
    tags: seed.tags,
    colors: { primary: theme.primary, secondary: theme.secondary, accent: theme.accent },
    mascot: seed.mascot,
    badge: seed.badge,
    certificate: {
      title: `Certificat ${seed.title}`,
      accent: theme.accent,
      footer: `Parcours "${seed.title}" — ${lessonCount} leçons accomplies`,
    },
    rewards: {
      xp: pathXp + PATH_COMPLETION_XP,
      stars: modules.reduce((sum, m) => sum + m.reward_stars, 0) + PATH_COMPLETION_STARS,
      badges: [seed.badge.id],
      stickers: [seed.icon],
      items: [],
    },
    modules,
  }
}

export const LEARNING_PATHS: LearningPath[] = [
  buildPath(
    {
      slug: "petit-artiste",
      title: "Petit Artiste",
      description: "Colore, dessine et crée avec imagination. Découvre ta créativité étape par étape.",
      age_min: 3,
      age_max: 8,
      difficulty: "beginner",
      theme: "art",
      icon: "🎨",
      tags: ["art", "creativity", "colors"],
      mascot: "zuri",
      badge: { id: "badge_artiste", name: "Petit Artiste", icon: "🎨" },
      duration: 30,
      modules: [
        {
          title: "Mes premiers coloriages",
          description: "Fais tes premiers pas avec les couleurs.",
          lessons: [
            ["COLORING", "Coloriage des fruits", "coloring_fruits"],
            ["COLORING", "Coloriage du soleil", "coloring_soleil"],
            ["COLORING", "Coloriage de l'arc-en-ciel", "coloring_arc_en_ciel"],
          ] as const,
        },
        {
          title: "Dessin magique",
          description: "Laisse l'IA transformer tes dessins.",
          lessons: [
            ["MAGIC_DRAWING", "Dessine un animal magique"],
            ["MAGIC_DRAWING", "Dessine un paysage enchanté"],
            ["COLORING", "Coloriage de ton chef-d'œuvre"],
          ] as const,
        },
        {
          title: "Couleurs et formes",
          description: "Apprends les couleurs et les formes en jouant.",
          lessons: [
            ["QUIZ", "Quiz des couleurs"],
            ["GAME", "Jeu des formes"],
            ["COLORING", "Coloriage des formes géométriques"],
          ] as const,
        },
        {
          title: "Mon chef-d'œuvre",
          description: "Compose et présente ta grande œuvre.",
          lessons: [
            ["BOOK", "Crée ton livre d'art"],
            ["STORY", "Raconte l'histoire de ton dessin"],
            ["COLLECTION", "Débloque des fleurs dans ton monde"],
          ] as const,
        },
      ],
    },
    0,
  ),
  buildPath(
    {
      slug: "explorateur-afrique",
      title: "Explorateur d'Afrique",
      description: "Voyage à travers la savane, les animaux et les paysages d'Afrique.",
      age_min: 4,
      age_max: 10,
      difficulty: "intermediate",
      theme: "africa",
      icon: "🦁",
      tags: ["africa", "animals", "nature"],
      mascot: "bobo",
      badge: { id: "badge_explorateur", name: "Explorateur d'Afrique", icon: "🦁" },
      duration: 45,
      modules: [
        {
          title: "La savane",
          description: "Découvre les habitants de la savane.",
          lessons: [
            ["COLORING", "Coloriage du lion", "coloring_lion"],
            ["COLORING", "Coloriage de la girafe", "coloring_girafe"],
            ["QUIZ", "Quiz de la savane"],
          ] as const,
        },
        {
          title: "Les animaux géants",
          description: "Rencontre les géants d'Afrique.",
          lessons: [
            ["COLORING", "Coloriage de l'éléphant", "coloring_elephant"],
            ["STORY", "L'histoire de l'éléphant sage"],
            ["GAME", "Jeu des animaux de la savane"],
          ] as const,
        },
        {
          title: "L'eau et le Nil",
          description: "Suis le fleuve au cœur de l'Afrique.",
          lessons: [
            ["COLORING", "Coloriage du Nil", "coloring_nil"],
            ["MAGIC_DRAWING", "Dessine un paysage du Nil"],
            ["QUIZ", "Quiz de géographie africaine"],
          ] as const,
        },
        {
          title: "Le grand safari",
          description: "Termine ton safari avec panache.",
          lessons: [
            ["BOOK", "Crée ton livre du safari"],
            ["CHALLENGE", "Défi : 3 coloriages d'animaux"],
            ["COLLECTION", "Débloque un animal dans ton monde"],
          ] as const,
        },
      ],
    },
    1,
  ),
  buildPath(
    {
      slug: "alphabet",
      title: "Alphabet",
      description: "Découvre les lettres de A à Z en t'amusant.",
      age_min: 3,
      age_max: 6,
      difficulty: "beginner",
      theme: "alphabet",
      icon: "🔤",
      tags: ["reading", "letters", "language"],
      mascot: "momo",
      badge: { id: "badge_alphabet", name: "Maître de l'alphabet", icon: "🔤" },
      duration: 35,
      modules: [
        {
          title: "Les voyelles",
          description: "Apprends les voyelles A E I O U Y.",
          lessons: [
            ["COLORING", "Coloriage des voyelles", "coloring_voyelles"],
            ["GAME", "Jeu des voyelles"],
            ["QUIZ", "Quiz des voyelles"],
          ] as const,
        },
        {
          title: "Les consonnes",
          description: "Découvre les consonnes.",
          lessons: [
            ["COLORING", "Coloriage des consonnes", "coloring_consonnes"],
            ["GAME", "Jeu des consonnes"],
            ["MISSION", "Mission : écrire ton prénom"],
          ] as const,
        },
        {
          title: "Syllabes simples",
          description: "Assemble les lettres en syllabes.",
          lessons: [
            ["STORY", "L'histoire de l'alphabet"],
            ["QUIZ", "Quiz des syllabes"],
            ["COLORING", "Coloriage des syllabes", "coloring_syllabes"],
          ] as const,
        },
        {
          title: "Mes premiers mots",
          description: "Lis et écris tes premiers mots.",
          lessons: [
            ["BOOK", "Crée ton abécédaire"],
            ["CHALLENGE", "Défi : trouve 5 mots en A"],
            ["COLLECTION", "Débloque la décoration lettres"],
          ] as const,
        },
      ],
    },
    2,
  ),
  buildPath(
    {
      slug: "chiffres",
      title: "Chiffres",
      description: "Compte, compare et joue avec les nombres de 1 à 20.",
      age_min: 3,
      age_max: 6,
      difficulty: "beginner",
      theme: "numbers",
      icon: "🔢",
      tags: ["math", "numbers", "logic"],
      mascot: "momo",
      badge: { id: "badge_chiffres", name: "As des chiffres", icon: "🔢" },
      duration: 35,
      modules: [
        {
          title: "Compter de 1 à 5",
          description: "Les tout premiers nombres.",
          lessons: [
            ["COLORING", "Coloriage des chiffres 1 à 5", "coloring_1a5"],
            ["GAME", "Jeu de comptage"],
            ["QUIZ", "Quiz de comptage"],
          ] as const,
        },
        {
          title: "Compter de 6 à 10",
          description: "Continue de compter plus loin.",
          lessons: [
            ["COLORING", "Coloriage des chiffres 6 à 10", "coloring_6a10"],
            ["GAME", "Jeu des doigts"],
            ["MISSION", "Mission : compte 10 objets"],
          ] as const,
        },
        {
          title: "Comparer les nombres",
          description: "Plus grand, plus petit, égal.",
          lessons: [
            ["QUIZ", "Quiz plus grand / plus petit"],
            ["STORY", "L'histoire des deux singes et des bananes"],
            ["GAME", "Jeu de comparaison"],
          ] as const,
        },
        {
          title: "Jusqu'à 20",
          description: "Compte jusqu'à 20 comme un champion.",
          lessons: [
            ["BOOK", "Crée ton livre des nombres"],
            ["CHALLENGE", "Défi : compte jusqu'à 20"],
            ["COLLECTION", "Débloque une collection chiffres"],
          ] as const,
        },
      ],
    },
    3,
  ),
  buildPath(
    {
      slug: "couleurs",
      title: "Couleurs",
      description: "Reconnais et nomme toutes les couleurs de l'arc-en-ciel.",
      age_min: 2,
      age_max: 5,
      difficulty: "beginner",
      theme: "colors",
      icon: "🌈",
      tags: ["colors", "art", "observation"],
      mascot: "kiki",
      badge: { id: "badge_couleurs", name: "Magicien des couleurs", icon: "🌈" },
      duration: 30,
      modules: [
        {
          title: "Les couleurs primaires",
          description: "Rouge, jaune, bleu.",
          lessons: [
            ["COLORING", "Coloriage en rouge", "coloring_rouge"],
            ["COLORING", "Coloriage en jaune", "coloring_jaune"],
            ["COLORING", "Coloriage en bleu", "coloring_bleu"],
          ] as const,
        },
        {
          title: "Les couleurs secondaires",
          description: "Vert, orange, violet.",
          lessons: [
            ["COLORING", "Coloriage en vert", "coloring_vert"],
            ["COLORING", "Coloriage en orange", "coloring_orange"],
            ["QUIZ", "Quiz des couleurs"],
          ] as const,
        },
        {
          title: "L'arc-en-ciel",
          description: "Toutes les couleurs ensemble.",
          lessons: [
            ["MAGIC_DRAWING", "Dessine un arc-en-ciel magique"],
            ["STORY", "L'histoire de l'arc-en-ciel"],
            ["GAME", "Jeu des couleurs"],
          ] as const,
        },
        {
          title: "Peindre le monde",
          description: "Associe les couleurs au monde réel.",
          lessons: [
            ["BOOK", "Crée ton livre des couleurs"],
            ["CHALLENGE", "Défi : colorie avec 6 couleurs"],
            ["COLLECTION", "Débloque le décor arc-en-ciel"],
          ] as const,
        },
      ],
    },
    4,
  ),
  buildPath(
    {
      slug: "animaux",
      title: "Animaux",
      description: "Rencontre les animaux du monde entier et leurs secrets.",
      age_min: 3,
      age_max: 8,
      difficulty: "beginner",
      theme: "animals",
      icon: "🐘",
      tags: ["animals", "nature", "observation"],
      mascot: "kaya",
      badge: { id: "badge_animaux", name: "Amis des animaux", icon: "🐘" },
      duration: 40,
      modules: [
        {
          title: "La ferme",
          description: "Vache, poule, mouton et leurs amis.",
          lessons: [
            ["COLORING", "Coloriage de la vache", "coloring_vache"],
            ["COLORING", "Coloriage de la poule", "coloring_poule"],
            ["QUIZ", "Quiz de la ferme"],
          ] as const,
        },
        {
          title: "La forêt",
          description: "Renard, écureuil, hibou...",
          lessons: [
            ["COLORING", "Coloriage du renard", "coloring_renard"],
            ["STORY", "L'histoire du petit hibou"],
            ["GAME", "Jeu des animaux de la forêt"],
          ] as const,
        },
        {
          title: "Les océans",
          description: "Baleine, dauphin, poisson-clown.",
          lessons: [
            ["COLORING", "Coloriage du dauphin", "coloring_dauphin"],
            ["MAGIC_DRAWING", "Dessine un fond marin"],
            ["QUIZ", "Quiz des océans"],
          ] as const,
        },
        {
          title: "Le zoo des records",
          description: "Les animaux les plus étonnants.",
          lessons: [
            ["BOOK", "Crée ton livre des animaux"],
            ["CHALLENGE", "Défi : 3 coloriages d'animaux"],
            ["COLLECTION", "Débloque un animal dans ton monde"],
          ] as const,
        },
      ],
    },
    5,
  ),
  buildPath(
    {
      slug: "nature",
      title: "Nature",
      description: "Explore les plantes, les saisons et les trésors de la nature.",
      age_min: 4,
      age_max: 9,
      difficulty: "beginner",
      theme: "nature",
      icon: "🌿",
      tags: ["nature", "science", "observation"],
      mascot: "baobab",
      badge: { id: "badge_nature", name: "Garde de la nature", icon: "🌿" },
      duration: 40,
      modules: [
        {
          title: "Les plantes",
          description: "Comment poussent les plantes ?",
          lessons: [
            ["COLORING", "Coloriage de la fleur", "coloring_fleur"],
            ["STORY", "L'histoire de la petite graine"],
            ["QUIZ", "Quiz des plantes"],
          ] as const,
        },
        {
          title: "Les saisons",
          description: "Printemps, été, automne, hiver.",
          lessons: [
            ["COLORING", "Coloriage du printemps", "coloring_printemps"],
            ["COLORING", "Coloriage de l'automne", "coloring_automne"],
            ["MISSION", "Mission : observe la météo du jour"],
          ] as const,
        },
        {
          title: "Les insectes",
          description: "Papillons, abeilles et coccinelles.",
          lessons: [
            ["COLORING", "Coloriage du papillon", "coloring_papillon"],
            ["GAME", "Jeu des insectes"],
            ["MAGIC_DRAWING", "Dessine un jardin magique"],
          ] as const,
        },
        {
          title: "Protéger la nature",
          description: "Deviens un éco-héros.",
          lessons: [
            ["BOOK", "Crée ton livre écolo"],
            ["CHALLENGE", "Défi : plante une graine"],
            ["COLLECTION", "Débloque des fleurs dans ton monde"],
          ] as const,
        },
      ],
    },
    6,
  ),
  buildPath(
    {
      slug: "lecture",
      title: "Lecture",
      description: "Entre dans le monde des mots et des histoires.",
      age_min: 4,
      age_max: 8,
      difficulty: "intermediate",
      theme: "reading",
      icon: "📖",
      tags: ["reading", "stories", "language"],
      mascot: "zuri",
      badge: { id: "badge_lecteur", name: "Grand lecteur", icon: "📖" },
      duration: 40,
      modules: [
        {
          title: "Les mots du quotidien",
          description: "Lis les mots de tous les jours.",
          lessons: [
            ["QUIZ", "Quiz des mots du quotidien"],
            ["COLORING", "Coloriage des mots doux", "coloring_mots_doux"],
            ["MISSION", "Mission : lis un mot à un adulte"],
          ] as const,
        },
        {
          title: "Phrases simples",
          description: "Assemble les mots en phrases.",
          lessons: [
            ["STORY", "L'histoire du chaton curieux"],
            ["GAME", "Jeu des phrases"],
            ["MAGIC_DRAWING", "Illustre une phrase"],
          ] as const,
        },
        {
          title: "Mes premières histoires",
          description: "Écoute et raconte des histoires.",
          lessons: [
            ["BOOK", "Crée ton premier livre"],
            ["STORY", "Raconte l'histoire de ta journée"],
            ["QUIZ", "Quiz de compréhension"],
          ] as const,
        },
        {
          title: "Devenir lecteur",
          description: "Lis une histoire entière tout seul.",
          lessons: [
            ["BOOK", "Crée un livre de 6 pages"],
            ["CHALLENGE", "Défi : lire un livre entier"],
            ["COLLECTION", "Débloque la bibliothèque"],
          ] as const,
        },
      ],
    },
    7,
  ),
  buildPath(
    {
      slug: "creativite",
      title: "Créativité",
      description: "Imagine, invente et crée sans limites.",
      age_min: 4,
      age_max: 10,
      difficulty: "beginner",
      theme: "creativity",
      icon: "💡",
      tags: ["creativity", "art", "imagination"],
      mascot: "momo",
      badge: { id: "badge_creatif", name: "Créatif en chef", icon: "💡" },
      duration: 40,
      modules: [
        {
          title: "Inventer des personnages",
          description: "Crée tes propres héros.",
          lessons: [
            ["MAGIC_DRAWING", "Invente un personnage magique"],
            ["COLORING", "Coloriage de ton héros", "coloring_hero"],
            ["STORY", "L'histoire de ton personnage"],
          ] as const,
        },
        {
          title: "Imaginer des mondes",
          description: "Construis des mondes imaginaires.",
          lessons: [
            ["MAGIC_DRAWING", "Dessine une planète imaginaire"],
            ["BOOK", "Crée le livre de ton monde"],
            ["GAME", "Jeu d'imagination"],
          ] as const,
        },
        {
          title: "Créer avec les mains",
          description: "Fabrication et bricolage.",
          lessons: [
            ["COLORING", "Coloriage d'un masque", "coloring_masque"],
            ["CHALLENGE", "Défi : fabrique un objet"],
            ["MISSION", "Mission : dessine un cadeau"],
          ] as const,
        },
        {
          title: "L'artiste complet",
          description: "Réunis toutes tes créations.",
          lessons: [
            ["BOOK", "Crée ton portfolio"],
            ["STORY", "Présente tes créations"],
            ["COLLECTION", "Débloque le village"],
          ] as const,
        },
      ],
    },
    8,
  ),
  buildPath(
    {
      slug: "metiers",
      title: "Métiers",
      description: "Découvre les métiers qui font tourner le monde.",
      age_min: 4,
      age_max: 9,
      difficulty: "intermediate",
      theme: "jobs",
      icon: "👩‍⚕️",
      tags: ["jobs", "society", "observation"],
      mascot: "zuri",
      badge: { id: "badge_metiers", name: "Explorateur des métiers", icon: "👩‍⚕️" },
      duration: 45,
      modules: [
        {
          title: "Ceux qui soignent",
          description: "Médecin, infirmier, vétérinaire.",
          lessons: [
            ["COLORING", "Coloriage du médecin", "coloring_medecin"],
            ["STORY", "L'histoire de la docteure Awa"],
            ["QUIZ", "Quiz des soignants"],
          ] as const,
        },
        {
          title: "Ceux qui construisent",
          description: "Maçon, architecte, menuisier.",
          lessons: [
            ["COLORING", "Coloriage du maçon", "coloring_macon"],
            ["GAME", "Jeu de construction"],
            ["MAGIC_DRAWING", "Dessine ta maison de rêve"],
          ] as const,
        },
        {
          title: "Ceux qui nourrissent",
          description: "Fermier, pêcheur, boulanger.",
          lessons: [
            ["COLORING", "Coloriage du boulanger", "coloring_boulanger"],
            ["QUIZ", "Quiz des métiers"],
            ["MISSION", "Mission : remercie un métier"],
          ] as const,
        },
        {
          title: "Et toi, plus tard ?",
          description: "Imagine ton futur métier.",
          lessons: [
            ["BOOK", "Crée le livre de ton métier"],
            ["CHALLENGE", "Défi : dessine ton métier de rêve"],
            ["COLLECTION", "Débloque le village des métiers"],
          ] as const,
        },
      ],
    },
    9,
  ),
  buildPath(
    {
      slug: "musique",
      title: "Musique",
      description: "Écoute, chante et découvre les instruments.",
      age_min: 3,
      age_max: 8,
      difficulty: "beginner",
      theme: "music",
      icon: "🎵",
      tags: ["music", "rhythm", "art"],
      mascot: "kiki",
      badge: { id: "badge_musicien", name: "Petit musicien", icon: "🎵" },
      duration: 35,
      modules: [
        {
          title: "Les sons",
          description: "Écoute et reconnais les sons.",
          lessons: [
            ["VIDEO", "Vidéo : les sons du monde"],
            ["GAME", "Jeu des sons"],
            ["QUIZ", "Quiz des sons"],
          ] as const,
        },
        {
          title: "Les instruments",
          description: "Tambour, balafon, guitare...",
          lessons: [
            ["COLORING", "Coloriage du tambour", "coloring_tambour"],
            ["COLORING", "Coloriage du balafon", "coloring_balafon"],
            ["STORY", "L'histoire du griot musicien"],
          ] as const,
        },
        {
          title: "Le rythme",
          description: "Frappe des mains et joue en rythme.",
          lessons: [
            ["VIDEO", "Vidéo : apprendre le rythme"],
            ["GAME", "Jeu du rythme"],
            ["MISSION", "Mission : tape un rythme"],
          ] as const,
        },
        {
          title: "Chanter ensemble",
          description: "Chante tes chansons préférées.",
          lessons: [
            ["BOOK", "Crée ton livre de chansons"],
            ["CHALLENGE", "Défi : chante une chanson"],
            ["COLLECTION", "Débloque le tambour"],
          ] as const,
        },
      ],
    },
    10,
  ),
  buildPath(
    {
      slug: "sciences",
      title: "Sciences",
      description: "Expérimente, observe et découvre pourquoi le monde fonctionne.",
      age_min: 5,
      age_max: 10,
      difficulty: "advanced",
      theme: "science",
      icon: "🔬",
      tags: ["science", "logic", "experiment"],
      mascot: "baobab",
      badge: { id: "badge_scientifique", name: "Petit scientifique", icon: "🔬" },
      duration: 50,
      modules: [
        {
          title: "Les 5 sens",
          description: "Voir, entendre, toucher, sentir, goûter.",
          lessons: [
            ["VIDEO", "Vidéo : les 5 sens"],
            ["QUIZ", "Quiz des 5 sens"],
            ["GAME", "Jeu des sens"],
          ] as const,
        },
        {
          title: "L'eau et l'air",
          description: "Observe la matière autour de toi.",
          lessons: [
            ["MAGIC_DRAWING", "Dessine le cycle de l'eau"],
            ["STORY", "L'histoire de la goutte d'eau"],
            ["COLORING", "Coloriage des nuages", "coloring_nuages"],
          ] as const,
        },
        {
          title: "Les expériences",
          description: "Fais des expériences simples et sûres.",
          lessons: [
            ["CHALLENGE", "Défi : flotte ou coule"],
            ["VIDEO", "Vidéo : expérience du volcan"],
            ["MISSION", "Mission : observe une ombre"],
          ] as const,
        },
        {
          title: "Le laboratoire",
          description: "Deviens un vrai scientifique.",
          lessons: [
            ["BOOK", "Crée ton livre d'expériences"],
            ["QUIZ", "Quiz scientifique final"],
            ["COLLECTION", "Débloque le feu de camp"],
          ] as const,
        },
      ],
    },
    11,
  ),
  buildPath(
    {
      slug: "planete-terre",
      title: "Planète Terre",
      description: "Voyage autour de la Terre : continents, océans et protection du climat.",
      age_min: 5,
      age_max: 11,
      difficulty: "advanced",
      theme: "planet",
      icon: "🌍",
      tags: ["planet", "nature", "science", "africa"],
      mascot: "baobab",
      badge: { id: "badge_planete", name: "Gardien de la Terre", icon: "🌍" },
      duration: 50,
      modules: [
        {
          title: "Notre planète",
          description: "La Terre et son atmosphère.",
          lessons: [
            ["COLORING", "Coloriage de la Terre", "coloring_terre"],
            ["VIDEO", "Vidéo : la Terre vue de l'espace"],
            ["QUIZ", "Quiz de la planète"],
          ] as const,
        },
        {
          title: "Les continents",
          description: "L'Afrique, l'Europe, l'Amérique et plus.",
          lessons: [
            ["MAGIC_DRAWING", "Dessine une carte imaginaire"],
            ["STORY", "L'histoire du petit explorateur"],
            ["GAME", "Jeu des continents"],
          ] as const,
        },
        {
          title: "Les océans et le climat",
          description: "Protège les mers et le climat.",
          lessons: [
            ["COLORING", "Coloriage de l'océan", "coloring_ocean"],
            ["CHALLENGE", "Défi : économise l'eau"],
            ["MISSION", "Mission : trie un déchet"],
          ] as const,
        },
        {
          title: "Protéger la planète",
          description: "Deviens un gardien de la Terre.",
          lessons: [
            ["BOOK", "Crée ton livre pour la Terre"],
            ["QUIZ", "Quiz du gardien de la Terre"],
            ["COLLECTION", "Débloque l'école écolo"],
          ] as const,
        },
      ],
    },
    12,
  ),
  buildPath(
    {
      slug: "emotions",
      title: "Émotions",
      description: "Comprends tes émotions et celles des autres.",
      age_min: 3,
      age_max: 8,
      difficulty: "intermediate",
      theme: "emotions",
      icon: "💛",
      tags: ["emotions", "empathy", "social"],
      mascot: "momo",
      badge: { id: "badge_emotions", name: "Cœur d'or", icon: "💛" },
      duration: 40,
      modules: [
        {
          title: "La joie et la tristesse",
          description: "Reconnais et exprime tes sentiments.",
          lessons: [
            ["COLORING", "Coloriage des visages", "coloring_visages"],
            ["STORY", "L'histoire de la joie perdue"],
            ["QUIZ", "Quiz des émotions"],
          ] as const,
        },
        {
          title: "La colère et la peur",
          description: "Apprivoise les émotions fortes.",
          lessons: [
            ["VIDEO", "Vidéo : quand on est en colère"],
            ["COLORING", "Coloriage de l'apaisement", "coloring_apaisement"],
            ["GAME", "Jeu des émotions"],
          ] as const,
        },
        {
          title: "L'empathie",
          description: "Ressens ce que ressentent les autres.",
          lessons: [
            ["STORY", "L'histoire de la main tendue"],
            ["MISSION", "Mission : rends service"],
            ["MAGIC_DRAWING", "Dessine un sourire"],
          ] as const,
        },
        {
          title: "Mon jardin d'émotions",
          description: "Tout va bien : tu comprends tes émotions !",
          lessons: [
            ["BOOK", "Crée ton livre des émotions"],
            ["CHALLENGE", "Défi : aide un ami"],
            ["COLLECTION", "Débloque les lucioles"],
          ] as const,
        },
      ],
    },
    13,
  ),
  buildPath(
    {
      slug: "hygiene",
      title: "Hygiène",
      description: "Apprends à prendre soin de ton corps chaque jour.",
      age_min: 2,
      age_max: 6,
      difficulty: "beginner",
      theme: "health",
      icon: "💧",
      tags: ["health", "hygiene", "daily"],
      mascot: "kaya",
      badge: { id: "badge_hygiene", name: "Propre comme un sou neuf", icon: "💧" },
      duration: 30,
      modules: [
        {
          title: "Se laver les mains",
          description: "Lave-toi les mains comme un champion.",
          lessons: [
            ["VIDEO", "Vidéo : les mains propres"],
            ["COLORING", "Coloriage du savon", "coloring_savon"],
            ["MISSION", "Mission : lave-toi les mains"],
          ] as const,
        },
        {
          title: "Se brosser les dents",
          description: "Des dents éclatantes de santé.",
          lessons: [
            ["COLORING", "Coloriage de la brosse à dents", "coloring_brosse"],
            ["STORY", "L'histoire de la dent brillante"],
            ["CHALLENGE", "Défi : brosse-toi les dents 2 fois"],
          ] as const,
        },
        {
          title: "Se laver et s'habiller",
          description: "Prends soin de ton corps.",
          lessons: [
            ["VIDEO", "Vidéo : le bain du soir"],
            ["QUIZ", "Quiz de l'hygiène"],
            ["GAME", "Jeu de la toilette"],
          ] as const,
        },
        {
          title: "Manger sain",
          description: "De bonnes habitudes pour grandir.",
          lessons: [
            ["BOOK", "Crée ton livre bien manger"],
            ["COLORING", "Coloriage des fruits et légumes", "coloring_fruits_legumes"],
            ["COLLECTION", "Débloque le lac"],
          ] as const,
        },
      ],
    },
    14,
  ),
  buildPath(
    {
      slug: "securite",
      title: "Sécurité",
      description: "Les règles d'or pour rester en sécurité à la maison et dehors.",
      age_min: 3,
      age_max: 7,
      difficulty: "intermediate",
      theme: "safety",
      icon: "🦺",
      tags: ["safety", "daily", "empathy"],
      mascot: "bobo",
      badge: { id: "badge_securite", name: "Gardien de la sécurité", icon: "🦺" },
      duration: 35,
      modules: [
        {
          title: "En sécurité à la maison",
          description: "Les dangers cachés de la maison.",
          lessons: [
            ["VIDEO", "Vidéo : les dangers de la maison"],
            ["COLORING", "Coloriage des dangers", "coloring_dangers"],
            ["QUIZ", "Quiz de la maison"],
          ] as const,
        },
        {
          title: "La route",
          description: "Traverser la route en sécurité.",
          lessons: [
            ["STORY", "L'histoire du passage piéton"],
            ["COLORING", "Coloriage du feu rouge", "coloring_feu"],
            ["GAME", "Jeu de la traversée"],
          ] as const,
        },
        {
          title: "Les gestes qui sauvent",
          description: "Quoi faire en cas de danger.",
          lessons: [
            ["VIDEO", "Vidéo : appeler le 17"],
            ["MISSION", "Mission : connais ton adresse"],
            ["CHALLENGE", "Défi : récite le numéro d'urgence"],
          ] as const,
        },
        {
          title: "Le code du petit héros",
          description: "La sécurité, c'est aussi protéger les autres.",
          lessons: [
            ["BOOK", "Crée ton livre de la sécurité"],
            ["QUIZ", "Quiz du petit héros"],
            ["COLLECTION", "Débloque le phare"],
          ] as const,
        },
      ],
    },
    15,
  ),
]

export function getPathBySlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug)
}

export function getPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id)
}

export function getActivePaths(): LearningPath[] {
  return LEARNING_PATHS.filter((p) => p.is_active).sort((a, b) => a.order_index - b.order_index)
}

export function flattenLessons(path: LearningPath): LearningLesson[] {
  return path.modules.flatMap((m) => m.lessons)
}
