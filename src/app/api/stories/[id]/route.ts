// ============================================================
// Petit Baobab — API /api/stories/[id]
// Détail complet d'une histoire
// ============================================================

import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { MY_STORIES, RECOMMENDED_STORIES } from "@/lib/stories/mock-stories"

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params

    // 1. Recherche dans Supabase si présent
    try {
      const supabase = await getSupabaseServer()
      const { data: dbStory } = await supabase
        .from("stories")
        .select("*, story_pages(*)")
        .eq("id", id)
        .single()

      if (dbStory) {
        const story = {
          id: dbStory.id,
          title: dbStory.title,
          description: dbStory.description,
          moral: dbStory.moral,
          coverUrl: dbStory.cover_url || "/illustrations/histoires/story-moussa-baobab.webp",
          ageRange: `${dbStory.age_min}-${dbStory.age_max} ans`,
          themeId: dbStory.theme,
          themeLabel: dbStory.theme,
          category: dbStory.theme,
          categoryColor: "#FFB300",
          country: dbStory.country,
          environment: dbStory.environment,
          pages: (dbStory.story_pages || [])
            .sort((a: any, b: any) => a.page_number - b.page_number)
            .map((p: any) => ({
              pageNumber: p.page_number,
              title: p.title,
              text: p.text,
              illustrationUrl: p.image_url || "/illustrations/histoires/story-moussa-baobab.webp",
              audioUrl: p.audio_url,
            })),
        }

        return NextResponse.json({ success: true, story })
      }
    } catch {
      // Poursuivre vers les mocks si pas de DB
    }

    // 2. Recherche dans le catalogue statique
    const mock =
      MY_STORIES.find((s) => s.id === id) ||
      RECOMMENDED_STORIES.find((s) => s.id === id)

    if (mock) {
      return NextResponse.json({ success: true, story: mock })
    }

    return NextResponse.json(
      { success: false, error: "Histoire non trouvée" },
      { status: 404 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
