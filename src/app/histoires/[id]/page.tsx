"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { StoryReaderView } from "@/components/stories/StoryReaderView"
import { MobileBottomNav } from "@/components/child-dashboard/mobile-bottom-nav"
import { getStoryById } from "@/lib/stories/story-service"
import type { Story } from "@/lib/stories/types"
import Image from "next/image"
import { ArrowLeft, Loader2, BookOpen } from "lucide-react"

interface StoryDetailPageProps {
  params: Promise<{ id: string }>
}

export default function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { id } = use(params)
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStory() {
      // 1. Essayer le cache local
      const localStory = getStoryById(id)
      if (localStory) {
        setStory(localStory)
        setLoading(false)
        return
      }

      // 2. Essayer l'API
      try {
        const res = await fetch(`/api/stories/${id}`)
        const data = await res.json()
        if (data?.story) {
          setStory(data.story)
        }
      } catch (err) {
        console.warn("Échec chargement API histoire:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStory()
  }, [id])

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-6 flex flex-col justify-between">
            <Sidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex flex-col min-h-[calc(100vh-48px)] justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-[#7D6AF8] animate-spin" />
              <p className="text-sm font-bold text-[#684C38]">
                Ouverture de ton livre magique...
              </p>
            </div>
          ) : story ? (
            <StoryReaderView story={story} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white p-8 rounded-3xl border border-[#F0E7DA] max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-[#3B2416]">
                Histoire introuvable
              </h2>
              <p className="text-sm text-[#684C38]">
                Ce conte n&apos;est plus disponible ou a été déplacé.
              </p>
              <Link
                href="/histoires"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7D6AF8] text-white font-extrabold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour au catalogue</span>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav homeHref="/learn/dashboard" />

      {/* Grassy Footer Background */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 hidden lg:block select-none pointer-events-none">
        <Image
          src="/illustrations/footer_bas.webp"
          alt="Grass Footer"
          width={1920}
          height={346}
          className="w-full h-auto block"
          priority
        />
      </div>
    </div>
  )
}
