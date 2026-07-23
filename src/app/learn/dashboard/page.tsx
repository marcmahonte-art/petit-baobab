"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/app/learn/_components/sidebar"
import { Header } from "@/app/learn/_components/header"
import { HeroBanner, FeatureModules, RecentColorings, ActivityPanel, RewardsCard, MobileBottomNav } from "@/components/child-dashboard"
import Image from "next/image"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"

export default function LearnDashboardPage() {
  const router = useRouter()
  const { user, account, studentSession, isInitialized, checkSession, setStudentSession } = useAuthStore()
  const [studentRestored, setStudentRestored] = useState(false)

  // Restauration unifiée :
  // - parent/enseignant : checkSession() (Supabase)
  // - élève : on restaure aussi depuis le cookie httpOnly (survie au refresh)
  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/student-session")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.session) {
          const s = data.session
          setStudentSession({
            type: "student",
            name: s.name,
            mascot: s.mascot,
            profileId: s.profile_id,
            classroomId: s.classroom_id,
            classroomName: s.classroom_name,
            accountId: s.account_id,
            starsBalance: s.stars_balance,
          })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStudentRestored(true)
      })
    return () => {
      cancelled = true
    }
  }, [setStudentSession])

  // Redirections de garde (cohérent avec l'ancien /dashboard)
  useEffect(() => {
    if (!isInitialized) return
    // Un compte école (ecole_pro) ne doit jamais rester dans cet espace.
    if (user && account?.plan === "ecole_pro") {
      router.push("/school/dashboard")
    }
  }, [isInitialized, user, account, router])

  const loading = !isInitialized || (!user && !studentSession) || !studentRestored

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Chargement de ton espace...</span>
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

      <MobileBottomNav homeHref="/learn/dashboard" />

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
