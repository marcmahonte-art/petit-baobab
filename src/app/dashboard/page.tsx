"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/app/dashboard/_components/sidebar"
import { Header } from "@/app/dashboard/_components/header"
import { HeroBanner, FeatureModules, RecentColorings, ActivityPanel, RewardsCard, MobileBottomNav } from "@/components/child-dashboard"
import Image from "next/image"

export default function DashboardPage() {
  const router = useRouter()
  const { user, account, isInitialized, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/login")
    }
    // Un compte école (ecole_pro) ne doit jamais rester dans cet espace.
    if (isInitialized && user && account?.plan === "ecole_pro") {
      router.push("/school/dashboard")
    }
  }, [isInitialized, user, account, router])

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Chargement de votre espace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          <HeroBanner />

          <FeatureModules />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_392px] gap-6">
            <RecentColorings />
            <div>
              <ActivityPanel />
              <RewardsCard />
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />

      {/* Decorative Grassy Footer Background */}
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
