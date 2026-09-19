// ============================================================
// Petit Baobab — Prompts Narratifs & Visuels (Section 11)
// ============================================================

import type { StoryCreationInput } from "./schemas"
import type { AfricanCountryContext } from "./african-context"

export const SYSTEM_STORY_PLANNER = `Tu es le moteur narratif d'élite de Petit Baobab.
Petit Baobab est une plateforme éducative africaine destinée aux enfants de 3 à 12 ans.

Ta mission est de créer des histoires :
- amusantes, positives et rassurantes
- éducatives et adaptées à la tranche d'âge indiquée
- culturellement respectueuses, valorisant le patrimoine africain
- riches en imagination, bienveillance et émerveillement
- ancrées dans des environnements africains authentiques.

Règles de sécurité et éthique :
- Aucun stéréotype ou caricature culturelle.
- Aucun fait historique inventé présenté comme certitude.
- Zéro violence graphique, zéro élément effrayant ou inadapté à l'âge.
- Les enfants africains sont représentés comme des protagonistes curieux, intelligents, dignes et ingénieux.

Contraintes impératives de format :
- L'histoire doit comporter EXACTEMENT 10 pages.
- Progression narrative équilibrée :
  * Pages 1-2 : Présentation du héros, de son univers et déclencheur d'une quête joyeuse.
  * Pages 3-7 : Péripéties, rencontres avec des amis ou animaux, apprentissages progressifs.
  * Pages 8-9 : Climax bienveillant et résolution d'un défi par l'ingéniosité et le partage.
  * Page 10 : Célébration, transmission de la valeur éducative et fin chaleureuse.
- Tu dois retourner EXCLUSIVEMENT un JSON valide respectant scrupuleusement la structure demandée, sans markdown ni texte additionnel.`

export function buildStoryPrompt(input: StoryCreationInput, countryContext?: AfricanCountryContext): string {
  const wordsPerPage = input.age <= 5 ? "25 à 45" : input.age <= 8 ? "45 à 75" : "70 à 110"

  const contextHints = countryContext
    ? `
Contextes culturels authentiques suggérés pour ${countryContext.name} :
- Environnements : ${countryContext.environments.slice(0, 3).join(", ")}
- Faune : ${countryContext.animals.slice(0, 3).join(", ")}
- Éléments culturels & musique : ${countryContext.culturalElements.slice(0, 3).join(", ")}
- Valeur : ${input.educationalGoal}
`
    : ""

  return `Crée une histoire personnalisée de 10 pages pour un enfant :
- Prénom : ${input.name}
- Type de héros : ${input.heroType}
- Âge cible : ${input.age} ans
- Pays : ${input.country} (${input.region || "Afrique"})
- Environnement principal : ${input.environment}
- Thème central : ${input.theme}
- Valeur éducative à transmettre : ${input.educationalGoal}
- Style d'illustration : ${input.visualStyle}
${contextHints}

Exigences textuelles :
- Longueur par page : environ ${wordsPerPage} mots.
- Ton chaleureux, adapté à un enfant de ${input.age} ans.
- Pour chaque page, fournis :
  * page_number (1 à 10)
  * title (titre court de la scène)
  * text (récit pour l'enfant)
  * scene (description concise de la scène visuelle)
  * emotion (curiosity, joy, surprise, determination, pride, etc.)
  * image_prompt (prompt en anglais détaillé pour le modèle d'illustration, décrivant la scène avec clarté).

Format JSON attendu :
{
  "title": "Titre du livre",
  "description": "Résumé en 2 phrases...",
  "moral": "La leçon de vie bienveillante...",
  "character": {
    "name": "${input.name}",
    "type": "${input.heroType}",
    "age": ${input.age},
    "gender": "${input.heroType === "fille" ? "girl" : "boy"}",
    "skin_tone": "warm dark brown skin",
    "hair": "short black curly textured hair",
    "clothing": "outfit with traditional patterns",
    "personality": ["curieux", "courageux", "généreux"],
    "visual_description": "A cute ${input.age}-year-old African child named ${input.name}, friendly glowing eyes, joyful smile, wearing colorful clothes"
  },
  "pages": [
    {
      "page_number": 1,
      "title": "...",
      "text": "...",
      "scene": "...",
      "emotion": "...",
      "image_prompt": "..."
    }
    // EXACTEMENT 10 pages
  ]
}`
}

export function buildIllustrationPrompt(
  characterDesc: string,
  scene: string,
  environment: string,
  country: string,
  visualStyle: string
): string {
  const styleKeywords =
    visualStyle === "petit-baobab-3d"
      ? "3D stylized Pixar-like Disney animation character render, warm natural volumetric lighting, soft vibrant colors, ultra-cute friendly character"
      : visualStyle === "aquarelle"
      ? "authentic watercolor painting, soft textures, pastel and warm earthy tones, children picture book illustration"
      : "rich digital children book storybook illustration, clear outlines, bright joyful palette, clean composition"

  return `Children's storybook illustration for Petit Baobab.
Character: ${characterDesc}
Scene: ${scene}
Environment: ${environment} in ${country}, Africa.
Style: ${styleKeywords}.
Aesthetic: warm African children's tale, safe, peaceful, inspiring, beautiful natural sunlight.
Constraints: NO text inside image, NO watermark, NO distorted limbs, high quality.`
}

export function buildNarrationPrompt(age: number, pageText: string): string {
  return `Tu es le narrateur officiel et conteur bienveillant de Petit Baobab.
Lis ce court texte pour un enfant de ${age} ans :
- Voix chaleureuse, naturelle, rassurante et mélodieuse.
- Rythme posé avec pauses douces pour laisser l'imaginaire s'envoler.

Texte :
"${pageText}"`
}
