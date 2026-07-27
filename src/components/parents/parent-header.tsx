"use client"

import { BookOpen, ChevronDown, Star, Settings, Users, LogOut } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import { useAuthStore } from "@/lib/auth-store"
import { getMascotImage } from "@/lib/mascots"

interface ParentHeaderProps {
  currentChild: string
  onChildChange: (child: string) => void
}

const getAvatarSrc = (mascot: string) => getMascotImage(mascot)

export function ParentHeader({ currentChild, onChildChange }: ParentHeaderProps) {
  const router = useRouter()
  const { account, profiles, activeProfileId, selectProfile } = useAuthStore()

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0]
  const starsBalance = account?.stars_balance ?? 0

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 py-4 md:py-6 select-none">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-[22px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-extrabold text-[#2D1846] leading-tight">
          Espace parents
        </h1>
        <p className="text-sm md:text-base font-medium text-[#7A6A5E] mt-0.5 md:mt-1">
          Gérez les comptes, les plans et suivez les activités de vos enfants.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Star Badge */}
        <div className="w-[120px] md:w-[140px] h-[46px] md:h-[58px] rounded-[12px] md:rounded-[16px] border border-[#EFE7DB] bg-white flex items-center gap-2 md:gap-3 px-2 md:px-3 shadow-sm">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300] shrink-0">
            <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </div>
          <span className="text-[14px] md:text-[16px] font-extrabold text-[#3B2416]">{starsBalance}</span>
        </div>

        {/* Mes Livres Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => router.push("/mes-livres")}
            className="w-[140px] md:w-[160px] h-[46px] md:h-[56px] rounded-[14px] md:rounded-[18px] bg-[#6D4CFF] text-white hover:bg-[#6D4CFF]/90 font-bold text-[14px] md:text-[16px] flex items-center justify-center gap-1.5 md:gap-2 shadow-md border-none cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mes livres</span>
          </Button>
        </motion.div>

        {/* Kid Selector Dropdown */}
        {profiles && profiles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 md:gap-3 h-[46px] md:h-[58px] rounded-full border border-[#EFE7DB] pl-1.5 md:pl-2 pr-3 md:pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm select-none">
                <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-neutral-100">
                  <AvatarImage 
                    src={getAvatarSrc(activeProfile?.mascot || "awa")}
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${activeProfile?.name || "child"}`
                    }}
                  />
                  <AvatarFallback>{activeProfile?.name?.slice(0, 2).toUpperCase() || "AW"}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] md:text-[16px] font-extrabold text-[#3B2416]">
                    {activeProfile?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#7A6A5E]" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-1.5">
              {profiles.map((profile) => (
                <DropdownMenuItem 
                  key={profile.id}
                  onClick={() => {
                    selectProfile(profile.id)
                    onChildChange(profile.name.toLowerCase())
                  }} 
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
              <DropdownMenuItem onClick={async () => { await useAuthStore.getState().logout(); router.push("/login") }} className="rounded-xl font-bold text-sm text-red-500">
                <LogOut className="inline w-4 h-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}


      </div>
    </header>
  )
}
