import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"
import { StoriesPageContent } from "@/components/stories/StoriesPageContent"
import { MobileBottomNav } from "@/components/child-dashboard/mobile-bottom-nav"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Histoires pour enfants | Petit Baobab",
  description:
    "Des histoires uniques pour imaginer, apprendre et grandir. Crée des histoires personnalisées avec l'IA et découvre l'Afrique à travers les yeux de ton héros préféré.",
  alternates: { canonical: "/histoires" },
  openGraph: {
    title: "Histoires | Petit Baobab",
    description:
      "Des histoires personnalisées avec l'IA et l'imaginaire africain pour les enfants.",
    url: "/histoires",
  },
}

export default function HistoiresPage() {
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
        <main className="flex flex-col min-h-[calc(100vh-48px)]">
          <StoriesPageContent />
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
