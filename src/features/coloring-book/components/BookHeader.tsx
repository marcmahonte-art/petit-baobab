"use client"

import { BookOpen, ChevronDown, Settings, Users, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useAuthStore } from "@/lib/auth-store"
import { useProfileStore } from "@/lib/profile-store"

const getAvatarSrc = (mascot: string) => {
  if (mascot === "lion") return "/illustrations/lion.webp"
  if (mascot === "robot") return "/illustrations/robot.webp"
  return "/illustrations/awa.webp"
}

export function BookHeader() {
  const router = useRouter()
  const { account, logout } = useAuthStore()
  const { profiles, activeProfileId, switchProfile } = useProfileStore()
  const activeProfile = profiles.find((p) => p.id === activeProfileId)
  const displayName = activeProfile?.name ?? "Enfant"

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 py-3 md:py-4 px-0 md:px-2">
        <div>
          <h1 className="text-[22px] md:text-[40px] font-extrabold text-[#2D1846] leading-none tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-[#6D4CFF]" /> Livres de coloriage
          </h1>
          <p className="text-[13px] md:text-[16px] font-bold text-[#7A6A5E] mt-1 md:mt-1.5 flex items-center gap-1">
            Crée ton propre livre de coloriage personnalisé !
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Mes Livres Button */}
          <Link href="/mes-livres">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button className="w-[150px] h-[52px] rounded-[16px] bg-[#6D4CFF] text-white hover:bg-[#6D4CFF]/90 font-bold text-[15px] flex items-center justify-center gap-2 shadow-md border-none cursor-pointer">
                <BookOpen className="w-5 h-5" />
                <span>Mes livres</span>
              </Button>
            </motion.div>
          </Link>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 h-[52px] rounded-full border border-[#EFE7DB] pl-1.5 pr-3.5 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm">
                <Avatar className="w-9 h-9 border border-neutral-100">
                  <AvatarImage src={`${getAvatarSrc(activeProfile?.mascot || "awa")}`} />
                  <AvatarFallback>{displayName.toUpperCase().slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-extrabold text-[#3B2416] capitalize">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7A6A5E]" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-1.5">
              {profiles.length === 0 && (
                <DropdownMenuItem disabled className="rounded-xl font-bold text-sm text-[#7A6A5E]">
                  Aucun profil
                </DropdownMenuItem>
              )}
              {profiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => switchProfile(profile.id)}
                  className="rounded-xl font-bold text-sm text-[#3B2416]"
                >
                  <Avatar className="w-7 h-7 mr-2">
                    <AvatarImage src={getAvatarSrc(profile.mascot)} />
                    <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {profile.name}
                </DropdownMenuItem>
              ))}
              <div className="h-px bg-[#F0E7DA] my-1" />
              <DropdownMenuItem onClick={() => router.push("/parametres")} className="rounded-xl font-bold text-sm text-[#7A6A5E]">
                <Settings className="inline w-4 h-4 mr-2" /> Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/parents")} className="rounded-xl font-bold text-sm text-[#7A6A5E]">
                <Users className="inline w-4 h-4 mr-2" /> Espace Parents
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await logout()
                  router.push("/login?space=family")
                }}
                className="rounded-xl font-bold text-sm text-[#FF5E83]"
              >
                <LogOut className="inline w-4 h-4 mr-2" /> Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
  )
}
