// ============================================================
// Petit Baobab — Service Histoires (Client & Serveur)
// Gère la persistance, le catalogue et la création
// ============================================================

import { MY_STORIES, RECOMMENDED_STORIES } from "./mock-stories"
import type { Story, StoryPage } from "./types"
import type { StoryCreationInput, StoryPlannerOutput } from "./schemas"
import { getPageIllustrationUrl } from "./generator"

const LOCAL_STORAGE_KEY = "petit_baobab_custom_stories"

/**
 * Convertit la sortie du Story Planner en modèle d'histoire complet
 */
export function buildStoryFromPlanner(
  input: StoryCreationInput,
  plannerOutput: StoryPlannerOutput
): Story {
  const storyId = `story-${Date.now()}`

  const pages: StoryPage[] = plannerOutput.pages.map((p) => ({
    pageNumber: p.page_number,
    title: p.title,
    text: p.text,
    scene: p.scene,
    emotion: p.emotion,
    illustrationUrl: getPageIllustrationUrl(p.page_number),
  }))

  const themeCategories: Record<string, { label: string; color: string }> = {
    aventure: { label: "Aventure", color: "#FFB300" },
    amitie: { label: "Amitié", color: "#FF5E83" },
    nature: { label: "Nature", color: "#20C997" },
    famille: { label: "Famille", color: "#FFD95C" },
    culture: { label: "Culture", color: "#7D6AF8" },
    education: { label: "Éducation", color: "#1194FF" },
  }

  const categoryMeta = themeCategories[input.theme] || { label: "Aventure", color: "#FFB300" }

  return {
    id: storyId,
    title: plannerOutput.title,
    description: plannerOutput.description,
    moral: plannerOutput.moral,
    coverUrl: pages[0]?.illustrationUrl || null,
    ageRange: `${input.age - 1}-${input.age + 1} ans`,
    themeId: input.theme,
    themeLabel: categoryMeta.label,
    category: categoryMeta.label,
    categoryColor: categoryMeta.color,
    country: input.country,
    environment: input.environment,
    pages,
    status: "ready",
    characterName: plannerOutput.character.name,
    character: {
      name: plannerOutput.character.name,
      type: plannerOutput.character.type,
      age: plannerOutput.character.age,
      gender: plannerOutput.character.gender,
      skinTone: plannerOutput.character.skin_tone,
      hair: plannerOutput.character.hair,
      clothing: plannerOutput.character.clothing,
      personality: plannerOutput.character.personality,
      visualDescription: plannerOutput.character.visual_description,
    },
    educationalGoal: input.educationalGoal,
    visualStyle: input.visualStyle,
    isFavorite: false,
    readCount: 0,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Sauvegarde locale pour le mode client
 */
export function saveCustomStoryLocally(story: Story): void {
  if (typeof window === "undefined") return
  try {
    const existing = getCustomStoriesLocally()
    const updated = [story, ...existing.filter((s) => s.id !== story.id)]
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn("Impossible de sauvegarder l'histoire localement:", err)
  }
}

/**
 * Récupère les histoires créées par l'utilisateur en local
 */
export function getCustomStoriesLocally(): Story[] {
  if (typeof window === "undefined") return []
  try {
    const data = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Récupère une histoire par son ID (cherche dans les personnalisées puis le catalogue démo)
 */
export function getStoryById(id: string): Story | undefined {
  const custom = getCustomStoriesLocally()
  const foundInCustom = custom.find((s) => s.id === id)
  if (foundInCustom) return foundInCustom

  return (
    MY_STORIES.find((s) => s.id === id) ||
    RECOMMENDED_STORIES.find((s) => s.id === id)
  )
}
