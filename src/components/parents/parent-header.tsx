"use client"

import { BookOpen, ChevronDown, Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

import { useAuthStore } from "@/lib/auth-store"

interface ParentHeaderProps {
  currentChild: string
  onChildChange: (child: string) => void
}

export function ParentHeader({ currentChild, onChildChange }: ParentHeaderProps) {
  const { account, profiles, activeProfileId, selectProfile } = useAuthStore()

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0]
  const starsBalance = account?.stars_balance ?? 0

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 select-none">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-[36px] font-extrabold text-[#334155] leading-tight">
          Espace parents
        </h1>
        <p className="text-base font-medium text-[#64748B] mt-1">
          Gérez les comptes, les plans et suivez les activités de vos enfants.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Star Badge */}
        <div className="w-[140px] h-[58px] rounded-[16px] border border-[#E5E7EB] bg-white flex items-center gap-3 px-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[16px] font-extrabold text-[#334155]">{starsBalance}</span>
            <span className="text-[10px] font-bold text-[#64748B]">Mes étoiles</span>
          </div>
        </div>

        {/* Mes Livres Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-[160px] h-[56px] rounded-[18px] bg-[#6D4AFF] text-white hover:bg-[#6D4AFF]/90 font-bold text-[16px] flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mes livres</span>
          </Button>
        </motion.div>

        {/* Kid Selector Dropdown */}
        {profiles && profiles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 h-[58px] rounded-full border border-[#E5E7EB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm select-none">
                <Avatar className="w-10 h-10 border border-neutral-100">
                  <AvatarImage 
                    src={`/illustrations/mascot_${activeProfile?.mascot || "awa"}.webp`}
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${activeProfile?.name || "child"}`
                    }}
                  />
                  <AvatarFallback>{activeProfile?.name?.slice(0, 2).toUpperCase() || "AW"}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5">
                  <span className="text-[16px] font-extrabold text-[#334155]">
                    {activeProfile?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px] rounded-2xl p-1.5">
              {profiles.map((profile) => (
                <DropdownMenuItem 
                  key={profile.id}
                  onClick={() => {
                    selectProfile(profile.id)
                    onChildChange(profile.name.toLowerCase())
                  }} 
                  className="rounded-xl font-bold text-sm text-[#334155]"
                >
                  {profile.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Déconnexion Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={async () => {
              await useAuthStore.getState().logout()
              window.location.href = "/login"
            }}
            variant="outline"
            className="h-[58px] px-5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-white"
          >
            <span>Déconnexion</span>
          </Button>
        </motion.div>
      </div>
    </header>
  )
}
