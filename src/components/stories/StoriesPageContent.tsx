"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StoriesHeader } from "./StoriesHeader"
import { StoriesHero } from "./StoriesHero"
import { StoryCard } from "./StoryCard"
import { ThemeSelector } from "./ThemeSelector"
import { StoriesBottomBanner } from "./StoriesBottomBanner"
import { StoryReaderModal } from "./StoryReaderModal"
import { MY_STORIES, RECOMMENDED_STORIES, STORY_THEMES } from "@/lib/stories/mock-stories"
import { getCustomStoriesLocally } from "@/lib/stories/story-service"
import { Story, StoryThemeId } from "@/lib/stories/types"
import { ArrowRight, BookOpen, Heart } from "lucide-react"

export function StoriesPageContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTheme, setSelectedTheme] = useState<StoryThemeId | null>(null)
  const [readingStory, setReadingStory] = useState<Story | null>(null)
  const [customStories, setCustomStories] = useState<Story[]>([])

  useEffect(() => {
    setCustomStories(getCustomStoriesLocally())
  }, [])

  // All user stories (custom + default)
  const allMyStories = useMemo(() => {
    return [...customStories, ...MY_STORIES]
  }, [customStories])

  // Filtered stories according to search query and selected theme
  const filteredMyStories = useMemo(() => {
    return allMyStories.filter((story) => {
      const matchesSearch =
        !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.country && story.country.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTheme = !selectedTheme || story.themeId === selectedTheme

      return matchesSearch && matchesTheme
    })
  }, [allMyStories, searchQuery, selectedTheme])

  const filteredRecommendations = useMemo(() => {
    return RECOMMENDED_STORIES.filter((story) => {
      const matchesSearch =
        !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTheme = !selectedTheme || story.themeId === selectedTheme

      return matchesSearch && matchesTheme
    })
  }, [searchQuery, selectedTheme])

  return (
    <div className="flex flex-col gap-7 md:gap-9">
      {/* Top Header — le compte et la cloche viennent du profil réel */}
      <StoriesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Banner */}
      <StoriesHero
        onCreateClick={() => {
          router.push("/histoires/nouvelle")
        }}
      />

      {/* Section 1: Mes histoires */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#3B2416] tracking-tight">
              Mes histoires
            </h2>
            {/* Playful coral accent dashes */}
            <span className="text-[#FF6B8B] text-lg font-black tracking-widest select-none">
              彡
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedTheme(null)
              setSearchQuery("")
            }}
            className="group text-xs sm:text-sm font-extrabold text-[#7A6A5E] hover:text-[#7D6AF8] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Voir toutes</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Stories Grid */}
        {filteredMyStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredMyStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onRead={(s) => setReadingStory(s)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-[#F0E7DA] p-8 text-center flex flex-col items-center gap-2">
            <BookOpen className="w-8 h-8 text-[#A49488]" />
            <p className="text-sm font-bold text-[#3B2416]">
              Aucune histoire ne correspond à ta recherche.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedTheme(null)
              }}
              className="text-xs font-extrabold text-[#7D6AF8] underline cursor-pointer"
            >
              Afficher toutes les histoires
            </button>
          </div>
        )}
      </section>

      {/* Section 2: Explorer par thème */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#3B2416] tracking-tight">
              Explorer par thème
            </h2>
            <span className="text-[#FFB300] text-lg font-black tracking-widest select-none">
              彡
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTheme(null)}
            className="group text-xs sm:text-sm font-extrabold text-[#7A6A5E] hover:text-[#7D6AF8] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{selectedTheme ? "Réinitialiser" : "Voir tous les thèmes"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <ThemeSelector
          themes={STORY_THEMES}
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
        />
      </section>

      {/* Section 3: Les coups de cœur des enfants */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#3B2416] tracking-tight">
              Les coups de cœur des enfants
            </h2>
            <Heart className="w-5 h-5 text-[#FF4D6D] fill-[#FF4D6D]/20" />
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedTheme(null)
              setSearchQuery("")
            }}
            className="group text-xs sm:text-sm font-extrabold text-[#7A6A5E] hover:text-[#7D6AF8] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Voir toutes</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Recommended Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredRecommendations.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              compact
              onRead={(s) => setReadingStory(s)}
            />
          ))}
        </div>
      </section>

      {/* Bottom Illustrated Panoramic Banner */}
      <StoriesBottomBanner />

      {/* Reader Modal */}
      <StoryReaderModal
        story={readingStory}
        onClose={() => setReadingStory(null)}
      />
    </div>
  )
}
