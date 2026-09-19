// ============================================================
// Petit Baobab — API /api/stories
// Création et récupération des histoires
// ============================================================

import { NextResponse } from "next/server"
import { StoryCreationInputSchema } from "@/lib/stories/schemas"
import { generateStory } from "@/lib/stories/generator"
import { buildStoryFromPlanner } from "@/lib/stories/story-service"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { MY_STORIES, RECOMMENDED_STORIES } from "@/lib/stories/mock-stories"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get("theme")

    const supabase = await getSupabaseServer()
    const { data: userAuth } = await supabase.auth.getUser()

    let stories = [...MY_STORIES, ...RECOMMENDED_STORIES]

    if (userAuth?.user) {
      const { data: dbStories } = await supabase
        .from("stories")
        .select("*, story_pages(*)")
        .order("created_at", { ascending: false })

      if (dbStories && dbStories.length > 0) {
        stories = dbStories.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          coverUrl: s.cover_url || "/illustrations/histoires/story-moussa-baobab.webp",
          ageRange: `${s.age_min}-${s.age_max} ans`,
          themeId: s.theme,
          themeLabel: s.theme,
          category: s.theme,
          categoryColor: "#FFB300",
          country: s.country,
          environment: s.environment,
          pages: (s.story_pages || []).map((p: any) => ({
            pageNumber: p.page_number,
            title: p.title,
            text: p.text,
            illustrationUrl: p.image_url || "/illustrations/histoires/story-moussa-baobab.webp",
            audioUrl: p.audio_url,
          })),
        }))
      }
    }

    if (theme) {
      stories = stories.filter((s) => s.themeId === theme)
    }

    return NextResponse.json({ success: true, stories })
  } catch (error: any) {
    console.error("Erreur GET /api/stories:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedInput = StoryCreationInputSchema.parse(body)

    // 1. Génération de l'histoire (Gemini ou repli déterministe)
    const plannerOutput = await generateStory(validatedInput)

    // 2. Construction de l'objet conte
    const story = buildStoryFromPlanner(validatedInput, plannerOutput)

    // 3. Sauvegarde optionnelle dans Supabase si l'utilisateur est authentifié
    try {
      const supabase = await getSupabaseServer()
      const { data: userAuth } = await supabase.auth.getUser()

      if (userAuth?.user) {
        const { data: insertedStory, error: insertError } = await supabase
          .from("stories")
          .insert({
            user_id: userAuth.user.id,
            title: story.title,
            description: story.description,
            moral: story.moral,
            status: "ready",
            age_min: validatedInput.age - 1,
            age_max: validatedInput.age + 1,
            country: validatedInput.country,
            environment: validatedInput.environment,
            theme: validatedInput.theme,
            educational_goal: validatedInput.educationalGoal,
            visual_style: validatedInput.visualStyle,
            cover_url: story.coverUrl,
            total_pages: 10,
          })
          .select()
          .single()

        if (insertedStory && !insertError) {
          story.id = insertedStory.id

          // Insertion des 10 pages
          const pagesToInsert = story.pages.map((p) => ({
            story_id: insertedStory.id,
            page_number: p.pageNumber,
            title: p.title,
            text: p.text,
            scene: p.scene,
            emotion: p.emotion,
            image_url: p.illustrationUrl,
          }))

          await supabase.from("story_pages").insert(pagesToInsert)
        }
      }
    } catch (dbErr) {
      console.warn("Notice: Sauvegarde Supabase ignorée (mode hors-ligne ou session anonyme):", dbErr)
    }

    return NextResponse.json({
      success: true,
      storyId: story.id,
      story,
    })
  } catch (error: any) {
    console.error("Erreur POST /api/stories:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.errors || error.message || "Erreur lors de la création de l'histoire",
      },
      { status: 400 }
    )
  }
}
