"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { motion } from "framer-motion"
import Image from "next/image"

const mascotAssets: Record<string, string> = {
  awa: "/illustrations/mascot_awa.webp",
  lion: "/illustrations/mascot_lion.webp",
  robot: "/illustrations/mascot_robot.webp",
}

const mascotColors: Record<string, string> = {
  awa: "bg-[#FFE08A] hover:bg-[#FFE08A]/90 border-[#D97706]",
  lion: "bg-[#FFC4A8] hover:bg-[#FFC4A8]/90 border-[#EA580C]",
  robot: "bg-[#E0F2FE] hover:bg-[#E0F2FE]/90 border-[#0284C7]",
}

export default function SelectProfilePage() {
  const router = useRouter()
  const { lang } = useI18n()
  const { profiles, selectProfile, user } = useAuthStore()

  // Guard: if not authenticated or no profiles, redirect
  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/login")
    }
    return null
  }

  const handleSelect = (profileId: string) => {
    selectProfile(profileId)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 select-none relative">
      <div className="absolute top-10 left-10 w-36 h-36 bg-[#DDF26B]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-[#FFE08A]/20 rounded-full blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl text-center z-10"
      >
        <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#3B2416] mb-2 leading-tight">
          {lang === "fr" ? "Qui va dessiner aujourd'hui ?" : "Who is coloring today?"}
        </h1>
        <p className="text-base font-bold text-[#7A6A5E] mb-10">
          {lang === "fr"
            ? "Sélectionnez le profil de votre enfant pour commencer la magie !"
            : "Choose your child's profile to start the magic!"}
        </p>

        {/* Profile Grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {profiles.map((profile, idx) => {
            const mascot = profile.mascot || "awa"
            const colorClass = mascotColors[mascot] || mascotColors.awa
            const imagePath = mascotAssets[mascot] || "/illustrations/logo-petit-baobab.webp"

            return (
              <motion.button
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                onClick={() => handleSelect(profile.id)}
                className={`w-[180px] p-5 border-4 border-[#3B2416] rounded-[32px] shadow-[6px_6px_0px_0px_#3B2416] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_#3B2416] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#3B2416] transition-all cursor-pointer flex flex-col items-center gap-4 ${colorClass}`}
              >
                <div className="relative w-24 h-24 bg-white/60 border-2 border-[#3B2416] rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Since actual assets may vary, use dicebear or local fallback if image fails */}
                  <Image
                    src={imagePath}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="w-auto h-[80px] object-contain object-bottom mt-2"
                    onError={(e) => {
                      // Fallback seed using index
                      e.currentTarget.src = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${profile.name}`
                    }}
                  />
                </div>
                <span className="text-xl font-extrabold text-[#3B2416] leading-tight">
                  {profile.name}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Espace parents direct link */}
        <div className="mt-12">
          <button
            onClick={() => router.push("/parents")}
            className="px-6 py-2.5 bg-white border-2 border-[#3B2416] rounded-full font-bold text-sm text-[#3B2416] shadow-[3px_3px_0px_0px_#3B2416] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3B2416] transition-all cursor-pointer"
          >
            {lang === "fr" ? "Accéder à l'Espace Parents" : "Go to Parents Area"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
