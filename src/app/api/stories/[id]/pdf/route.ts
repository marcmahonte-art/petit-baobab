// ============================================================
// Petit Baobab — API /api/stories/[id]/pdf
// Génération et téléchargement du livre PDF
// ============================================================

import { NextResponse } from "next/server"
import { MY_STORIES, RECOMMENDED_STORIES } from "@/lib/stories/mock-stories"
import { generateStoryPdf } from "@/lib/stories/pdf-generator"
import { getSupabaseServer } from "@/lib/supabaseServer"

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params

    let story =
      MY_STORIES.find((s) => s.id === id) ||
      RECOMMENDED_STORIES.find((s) => s.id === id)

    if (!story) {
      try {
        const supabase = await getSupabaseServer()
        const { data: dbStory } = await supabase
          .from("stories")
          .select("*, story_pages(*)")
          .eq("id", id)
          .single()

        if (dbStory) {
          story = {
            id: dbStory.id,
            title: dbStory.title,
            description: dbStory.description,
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
        }
      } catch {
        // Continue
      }
    }

    if (!story) {
      return NextResponse.json({ error: "Histoire non trouvée" }, { status: 404 })
    }

    const doc = await generateStoryPdf(story)
    const pdfArrayBuffer = doc.output("arraybuffer")

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(story.title)}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("Erreur génération PDF:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
