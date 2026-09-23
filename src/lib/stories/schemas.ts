// ============================================================
// Petit Baobab — Schémas de Validation Zod (Section 11.3 & 16)
// ============================================================

import { z } from "zod"

export const StoryCreationInputSchema = z.object({
  prompt: z.string().optional(),
  name: z.string().max(30).optional(),
  heroType: z.enum(["garcon", "fille", "enfant", "animal", "imaginaire"]).optional(),
  age: z.number().int().min(3).max(12).nullish().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  environment: z.string().optional(),
  theme: z.enum(["aventure", "amitie", "nature", "famille", "culture", "education"]).optional(),
  educationalGoal: z.string().optional(),
  visualStyle: z.enum(["petit-baobab-3d", "album-jeunesse", "aquarelle"]).optional(),
  authorName: z.string().optional(),
})

export type StoryCreationInput = z.infer<typeof StoryCreationInputSchema>

export const StoryPageOutputSchema = z.object({
  page_number: z.number().int().min(1).max(10),
  title: z.string(),
  text: z.string().min(10),
  scene: z.string().min(5),
  emotion: z.string().default("curiosity"),
  image_prompt: z.string().min(10),
})

export const StoryCharacterOutputSchema = z.object({
  name: z.string(),
  type: z.string().default("child"),
  age: z.number().optional(),
  gender: z.string().optional(),
  skin_tone: z.string().default("dark brown"),
  hair: z.string().default("short curly black hair"),
  clothing: z.string().default("tenue traditionnelle colorée"),
  personality: z.array(z.string()).default(["curieux", "courageux", "joyeux"]),
  visual_description: z.string(),
})

export const StoryPlannerOutputSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  moral: z.string().min(5),
  character: StoryCharacterOutputSchema,
  pages: z.array(StoryPageOutputSchema).length(10, "L'histoire doit comporter exactement 10 pages"),
})

export type StoryPlannerOutput = z.infer<typeof StoryPlannerOutputSchema>
