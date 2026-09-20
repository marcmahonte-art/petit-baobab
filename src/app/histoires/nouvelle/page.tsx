import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"
import { StoryStudioContainer } from "@/components/stories/StoryStudioContainer"
import { MobileBottomNav } from "@/components/child-dashboard/mobile-bottom-nav"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Créer une histoire magique | Petit Baobab",
  description:
    "Écris ton idée d'histoire ou décris la situation de ton enfant pour générer un livre de conte personnalisé avec l'IA.",
}

export default function NouvelleHistoirePage() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] relative flex flex-col overflow-x-hidden text-[#3B2416]">
      <div className="w-full max-w-[1680px] mx-auto flex flex-row flex-1 p-2 sm:p-3 md:p-3.5 xl:p-4 gap-2.5 md:gap-3 xl:gap-4 relative z-10">
        {/* Left Sidebar: 210–220px on desktop (>=1200px), 64–72px on tablet (768-1199px), hidden on mobile */}
        <div className="hidden md:flex flex-col shrink-0 md:w-[68px] xl:w-[215px]">
          <div className="sticky top-3 h-[calc(100vh-24px)]">
            <Sidebar compact />
          </div>
        </div>

        {/* Main Content Area: Assistant + Storybook */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          <StoryStudioContainer />
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileBottomNav homeHref="/learn/dashboard" />
      </div>
    </div>
  )
}
