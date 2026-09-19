// ============================================================
// Petit Baobab — Moteur de Génération d'Histoires (Section 12 & 30)
// Intégration Gemini / OpenAI + Repli Africain Déterministe
// ============================================================

import {
  StoryCreationInput,
  StoryPlannerOutput,
  StoryPlannerOutputSchema,
} from "./schemas"
import {
  SYSTEM_STORY_PLANNER,
  buildStoryPrompt,
  buildIllustrationPrompt,
} from "./prompts"
import { AFRICAN_COUNTRIES } from "./african-context"

const STORY_ILLUSTRATIONS_POOL = [
  "/illustrations/histoires/story-moussa-baobab.webp",
  "/illustrations/histoires/story-tortue-fleuve.webp",
  "/illustrations/histoires/story-lion-garcon.webp",
  "/illustrations/histoires/story-aicha-marche.webp",
  "/illustrations/histoires/story-ensemble.webp",
  "/illustrations/histoires/story-agricultrice.webp",
  "/illustrations/histoires/story-salif-reve.webp",
  "/illustrations/histoires/story-koffi.webp",
  "/illustrations/histoires/hero-moussa.webp",
  "/illustrations/histoires/bottom-banner.webp",
]

/**
 * Appelle Gemini pour générer le JSON structuré des 10 pages
 */
async function callGeminiStoryPlanner(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) return null

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_STORY_PLANNER}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    })

    if (!res.ok) {
      console.warn("Gemini API error:", res.status, await res.text())
      return null
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return text || null
  } catch (error) {
    console.warn("Gemini fetch failed:", error)
    return null
  }
}

/**
 * Repli sur OpenAI si présent
 */
async function callOpenAIStoryPlanner(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_STORY_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_STORY_PLANNER },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || null
  } catch (error) {
    console.warn("OpenAI fetch failed:", error)
    return null
  }
}

/**
 * Générateur déterministe riche pour les contextes africains
 * Garantit 100% de disponibilité sans rupture pour les enfants
 */
export function generateAfricanStoryFallback(input: StoryCreationInput): StoryPlannerOutput {
  const country = AFRICAN_COUNTRIES.find((c) => c.name.toLowerCase() === input.country.toLowerCase()) || AFRICAN_COUNTRIES[0]
  const heroName = input.name?.trim() || "Milo"
  const envName = input.environment || "savane"
  const valName = input.educationalGoal || "le courage et la tendresse"

  const promptLower = (input.prompt || "").toLowerCase()

  // Détection spécifique du scénario "dormir chez grand-mère / surmonter la peur du noir / soirée pyjama"
  if (
    promptLower.includes("grand-mère") ||
    promptLower.includes("dormir") ||
    promptLower.includes("pyjama") ||
    promptLower.includes("peur") ||
    promptLower.includes("ours")
  ) {
    const characterDesc = `Un adorable petit garçon de ${input.age || 7} ans nommé Milo, aux yeux pétillants de curiosité, portant un t-shirt bleu et un short confortable.`

    return {
      title: "L'aventure au clair de lune de Milo",
      description: `J'ai écrit une histoire pour un enfant de ${input.age || 7} ans. Elle raconte l'histoire de Milo, un petit garçon qui surmonte son appréhension lors d'une soirée pyjama chez sa grand-mère en découvrant la magie de ses histoires du soir et d'un vieil ours en peluche protecteur nommé Barnaby.`,
      moral: "L'amour d'une grand-mère et la tendresse d'un doudou veillent sur nos rêves et dissipent toutes les peurs.",
      character: {
        name: "Milo",
        type: "garcon",
        age: input.age || 7,
        gender: "boy",
        skin_tone: "warm brown skin",
        hair: "soft curly dark brown hair",
        clothing: "t-shirt bleu et short décontracté",
        personality: ["curieux", "sensible", "courageux"],
        visual_description: characterDesc,
      },
      pages: [
        {
          page_number: 1,
          title: "L'arrivée chez Grand-mère",
          text: `Le soleil se couchait doucement derrière les toits du village lorsque Milo arriva chez Grand-mère Hattie. C'était sa toute première nuit sans ses parents, et son petit cœur battait un peu plus fort que d'habitude.`,
          scene: `Milo tenant son petit sac à dos devant la porte accueillante de Grand-mère Hattie au crépuscule`,
          emotion: "apprehension",
          image_prompt: buildIllustrationPrompt(characterDesc, "Milo arriving at cozy grandmother house at warm twilight", "village chaleureux", country.name, input.visualStyle),
        },
        {
          page_number: 2,
          title: "Le parfum de la cuisine",
          text: `Dans la maison, une douce odeur de beignets chauds et d'infusion à la menthe flottait dans l'air. Grand-mère Hattie accueillit Milo avec une grande étreinte réconfortante qui sentait la vanille.`,
          scene: `Grand-mère Hattie souriant chaleureusement en préparant une collation pour Milo`,
          emotion: "warmth",
          image_prompt: buildIllustrationPrompt(characterDesc, "Grandmother lovingly hugging young boy in warm kitchen", "maison familiale", country.name, input.visualStyle),
        },
        {
          page_number: 3,
          title: "L'heure du pyjama",
          text: `Après le repas et un jeu amusant de dominos, vint l'heure d'aller au lit. Milo enfila son pyjama bleu, mais la chambre d'amis lui semblait immense et pleine de bruits inconnus.`,
          scene: `Milo assis sur le bord du grand lit regardant la fenêtre où la lune commence à briller`,
          emotion: "hesitation",
          image_prompt: buildIllustrationPrompt(characterDesc, "Young boy sitting on large cozy bed looking at night window", "chambre chaleureuse", country.name, input.visualStyle),
        },
        {
          page_number: 4,
          title: "L'ami d'enfance de Papa",
          text: `Grand-mère Hattie s'assit à côté de lui et lui tendit un vieil ours en peluche tout doux auquel il manquait un bouton pour l'œil. « Voici Barnaby », dit-elle doucement.`,
          scene: `Grand-mère tendant un ours en peluche vintage avec un bouton à Milo émerveillé`,
          emotion: "curiosity",
          image_prompt: buildIllustrationPrompt(characterDesc, "Kind elderly grandmother handing a gentle teddy bear named Barnaby to boy", "chambre familiale", country.name, input.visualStyle),
        },
        {
          page_number: 5,
          title: "Le secret de Barnaby",
          text: `« C'était le meilleur ami de ton père quand il était petit et qu'il avait peur. Barnaby est un expert pour les premières nuits chez les grands-parents. Il sait exactement comment chasser les ombres. »`,
          scene: `Milo tenant le petit ours en peluche et écoutant sa grand-mère avec attention`,
          emotion: "reassurance",
          image_prompt: buildIllustrationPrompt(characterDesc, "Boy holding cozy teddy bear listening intently to grandmother", "chambre de nuit", country.name, input.visualStyle),
        },
        {
          page_number: 6,
          title: "La lune argentée",
          text: `Par la fenêtre, la pleine lune éclairait la chambre d'une lumière d'argent. Milo serra Barnaby contre lui. Les ombres sur le mur ne faisaient plus peur du tout : elles dansaient comme des papillons.`,
          scene: `La lumière de la pleine lune éclairant doucement la chambre et Milo tenant l'ours`,
          emotion: "wonder",
          image_prompt: buildIllustrationPrompt(characterDesc, "Moonlight gently filling children bedroom, peaceful atmosphere", "chambre paisible", country.name, input.visualStyle),
        },
        {
          page_number: 7,
          title: "L'histoire des étoiles",
          text: `Grand-mère Hattie commença à raconter l'histoire du voyageur des étoiles qui protège les enfants endormis. Sa voix était comme une berceuse douce qui berçait le vent du soir.`,
          scene: `Grand-mère racontant une histoire au bord du lit avec des gestes doux et bienveillants`,
          emotion: "peace",
          image_prompt: buildIllustrationPrompt(characterDesc, "Grandmother storytelling beside bed, magical twilight lighting", "chambre de nuit", country.name, input.visualStyle),
        },
        {
          page_number: 8,
          title: "Un câlin tout doux",
          text: `Milo posa sa tête sur l'oreiller moelleux. Barnaby niché sous son bras, il sentit son corps se détendre complètement. La maison de Grand-mère était en réalité l'endroit le plus sûr du monde.`,
          scene: `Milo blotti sous la couverture avec Barnaby, un léger sourire sur les lèvres`,
          emotion: "serenity",
          image_prompt: buildIllustrationPrompt(characterDesc, "Boy snuggled comfortably under warm quilt with teddy bear", "lit douillet", country.name, input.visualStyle),
        },
        {
          page_number: 9,
          title: "Le pays des beaux rêves",
          text: `Tandis que Grand-mère embrassait son front en murmurant « Bonne nuit mon petit prince », Milo ferma les yeux en souriant. Le sommeil vint le cueillir comme une caresse d'étoile.`,
          scene: `Grand-mère embrassant le front de l'enfant endormi paisiblement`,
          emotion: "love",
          image_prompt: buildIllustrationPrompt(characterDesc, "Loving grandmother gently kissing boy forehead while he sleeps peacefully", "nuit étoilée", country.name, input.visualStyle),
        },
        {
          page_number: 10,
          title: "Le grand réveil triomphant",
          text: `Le lendemain matin, le chant des oiseaux et l'odeur des crêpes réveillèrent Milo. Il sauta du lit tout joyeux : il avait réussi sa première nuit et avait déjà hâte de recommencer !`,
          scene: `Milo en pyjama souriant radieusement le matin au soleil avec son ours Barnaby`,
          emotion: "triumph",
          image_prompt: buildIllustrationPrompt(characterDesc, "Joyful boy jumping out of bed in sunny morning holding teddy bear", "matin radieux", country.name, input.visualStyle),
        },
      ],
    }
  }

  const titles: Record<string, string> = {
    aventure: `${heroName} et le mystère du grand baobab`,
    amitie: `${heroName} et l'amitié des oiseaux chanteurs`,
    nature: `${heroName}, gardien de la nature en fleurs`,
    famille: `${heroName} et la merveilleuse fête du village`,
    culture: `${heroName} et le secret des tambours magiques`,
    education: `${heroName} et la clé du savoir éclatant`,
  }

  const title = titles[input.theme] || `${heroName} à la découverte de ${country.name}`

  const characterDesc = `Un enfant africain souriant de ${input.age} ans nommé ${heroName}, aux yeux vifs et chaleureux, vêtu d'une jolie tenue traditionnelle en tissu artisanal.`

  const pages = [
    {
      page_number: 1,
      title: "L'aube dorée",
      text: `Ce matin, dans son beau pays du ${country.name}, ${heroName} se réveille avec un grand sourire. Les rayons du soleil illuminent la chambre et une douce brise annonce une journée exceptionnelle.`,
      scene: `${heroName} souriant sur le pas de sa maison au lever du soleil africain`,
      emotion: "curiosity",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} waking up happily at sunrise in an African village`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 2,
      title: "Une étrange découverte",
      text: `En marchant près de ${envName}, ${heroName} aperçoit une petite plume scintillante posée délicatement au pied d'un grand arbre. De quel oiseau mystérieux peut-elle bien venir ?`,
      scene: `${heroName} observant une plume scintillante au sol avec émerveillement`,
      emotion: "surprise",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} kneeling to examine a magical glowing feather under an acacia tree`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 3,
      title: "La rencontre sur le sentier",
      text: `Sur le chemin de terre, ${heroName} croise un petit compagnon aux yeux pétillants. "Bonjour ${heroName} ! Si nous cherchions ensemble d'où vient ce trésor ?", propose-t-il avec entrain.`,
      scene: `${heroName} saluant chaleureusement un ami sur un sentier en terre rouge`,
      emotion: "joy",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} greeting a cheerful friend on a sunny red earth pathway`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 4,
      title: "L'arbre aux mille oiseaux",
      text: `Tous les deux s'avancent vers un immense baobab séculaire. Dans ses branches majestueuses, des calaos et des perroquets chantent des mélodies douces qui enchantent le cœur.`,
      scene: `Un majestueux baobab abritant des oiseaux colorés qui chantent`,
      emotion: "wonder",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} and friend looking up in awe at a gigantic baobab filled with singing birds`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 5,
      title: "Le conseil du doyen",
      text: `Assis à l'ombre bienveillante, le sage du village sourit à ${heroName}. "Pour trouver le secret que tu cherches, souviens-toi que ${valName} ouvre toutes les portes du monde."`,
      scene: `Un ancien assis sous l'arbre racontant une histoire avec bienveillance`,
      emotion: "respect",
      image_prompt: buildIllustrationPrompt(characterDesc, `A kind wise village elder speaking with warmth to ${heroName} under the shade`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 6,
      title: "Le petit défi à surmonter",
      text: `Un ruisseau chantant leur barre la route. Quelques pierres semblent glissantes, mais ${heroName} respire profondément et tend la main pour aider son ami à traverser pas à pas.`,
      scene: `${heroName} aidant son camarade à traverser un petit ruisseau d'eau claire`,
      emotion: "determination",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} holding hands helping friend step across clean stream stones`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 7,
      title: "L'oiseau argenté",
      text: `Sur une branche basse, un magnifique oiseau aux ailes soyeuses les attend. Il a perdu une plume de son aile et regarde ${heroName} avec des yeux pleins de reconnaissance.`,
      scene: `Un splendide oiseau perché sur une branche basse regardant les enfants`,
      emotion: "kindness",
      image_prompt: buildIllustrationPrompt(characterDesc, `A gentle African bird with magnificent plumage looking gratefully at ${heroName}`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 8,
      title: "Le geste du cœur",
      text: `${heroName} dépose délicatement la plume devant l'oiseau et partage avec lui quelques graines savoureuses. L'oiseau déploie aussitôt ses ailes en poussant un chant éclatant de joie !`,
      scene: `${heroName} tendant des graines et rendant la plume avec un doux sourire`,
      emotion: "generosity",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} gently placing the feather near the joyful bird who opens radiant wings`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 9,
      title: "La fête au village",
      text: `De retour au village, le son joyeux du balafon et des rires résonne. Tous les enfants se rassemblent pour écouter le récit de ${heroName} et danser sous les étoiles naissantes.`,
      scene: `Les enfants et les villageois réunis joyeusement avec instruments de musique`,
      emotion: "celebration",
      image_prompt: buildIllustrationPrompt(characterDesc, `African children gathered happily clapping and playing traditional music under twilight sky`, envName, country.name, input.visualStyle),
    },
    {
      page_number: 10,
      title: "La promesse de Petit Baobab",
      text: `Avant de s'endormir sous la nuit étoilée, ${heroName} sait que le vrai trésor n'était pas la plume magique, mais la joie d'avoir cultivé ${valName}. Quelle belle aventure !`,
      scene: `${heroName} souriant paisiblement sous un ciel africain scintillant d'étoiles`,
      emotion: "peace",
      image_prompt: buildIllustrationPrompt(characterDesc, `${heroName} smiling peacefully under a stunning African starry night sky`, envName, country.name, input.visualStyle),
    },
  ]

  return {
    title,
    description: `Une aventure lumineuse de ${heroName} au ${country.name}, illustrant les valeurs de ${valName} et d'émerveillement.`,
    moral: `C'est en cultivant ${valName} et la bienveillance que l'on accomplit les plus grands voyages.`,
    character: {
      name: heroName,
      type: input.heroType,
      age: input.age,
      gender: input.heroType === "fille" ? "girl" : "boy",
      skin_tone: "warm dark brown skin",
      hair: "short black curly textured hair",
      clothing: "tenue traditionnelle colorée en tissu africain",
      personality: ["curieux", "courageux", "joyeux", "solidaire"],
      visual_description: characterDesc,
    },
    pages,
  }
}

/**
 * Fonction maîtresse : génère une histoire complète de 10 pages
 */
export async function generateStory(input: StoryCreationInput): Promise<StoryPlannerOutput> {
  const countryContext = AFRICAN_COUNTRIES.find(
    (c) => c.name.toLowerCase() === input.country.toLowerCase()
  )

  const prompt = buildStoryPrompt(input, countryContext)

  // 1. Essai Gemini
  let rawJson = await callGeminiStoryPlanner(prompt)

  // 2. Essai OpenAI
  if (!rawJson) {
    rawJson = await callOpenAIStoryPlanner(prompt)
  }

  // 3. Validation ou repli déterministe
  if (rawJson) {
    try {
      // Nettoyer les balises markdown ```json si présentes
      const cleaned = rawJson.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim()
      const parsed = JSON.parse(cleaned)
      const validated = StoryPlannerOutputSchema.parse(parsed)
      return validated
    } catch (parseError) {
      console.warn("Échec validation JSON du modèle IA, utilisation du repli déterministe:", parseError)
    }
  }

  // Repli automatique haut de gamme
  return generateAfricanStoryFallback(input)
}

/**
 * Associe une image à chaque page (soit générée, soit issue de la photothèque Petit Baobab)
 */
export function getPageIllustrationUrl(pageNumber: number): string {
  const index = (pageNumber - 1) % STORY_ILLUSTRATIONS_POOL.length
  return STORY_ILLUSTRATIONS_POOL[index]
}
