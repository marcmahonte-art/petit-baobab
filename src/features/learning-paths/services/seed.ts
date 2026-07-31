import type { SupabaseClient } from "@supabase/supabase-js"
import { flattenLessons, getActivePaths } from "../constants"

/**
 * Seed idempotent du contenu canonique des parcours dans Supabase.
 * Utilisé côté client (learning-service) et côté serveur (API routes).
 */
export async function seedLearningPaths(supabase: SupabaseClient): Promise<void> {
  const { count } = await supabase.from("learning_paths").select("id", { count: "exact", head: true })
  if ((count ?? 0) > 0) return

  const paths = getActivePaths()

  await supabase.from("learning_paths").insert(
    paths.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      age_min: p.age_min,
      age_max: p.age_max,
      difficulty: p.difficulty,
      theme: p.theme,
      cover: p.cover,
      icon: p.icon,
      estimated_duration: p.estimated_duration,
      order_index: p.order_index,
      is_active: p.is_active,
      tags: p.tags,
    })),
  )

  await supabase.from("learning_modules").insert(
    paths.flatMap((p) =>
      p.modules.map((m) => ({
        id: m.id,
        path_id: m.path_id,
        title: m.title,
        description: m.description,
        order_index: m.order_index,
        reward_xp: m.reward_xp,
        reward_stars: m.reward_stars,
        reward_badge: m.reward_badge,
      })),
    ),
  )

  await supabase.from("learning_lessons").insert(
    paths.flatMap((p) =>
      flattenLessons(p).map((l) => ({
        id: l.id,
        module_id: l.module_id,
        title: l.title,
        lesson_type: l.lesson_type,
        content_id: l.content_id,
        order_index: l.order_index,
        reward_xp: l.reward_xp,
        reward_stars: l.reward_stars,
      })),
    ),
  )
}
