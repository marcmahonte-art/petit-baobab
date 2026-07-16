"use client"

import { ArrowLeft, Download, FolderOpen, Printer, ChevronDown, Settings, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useProfileStore } from "@/lib/profile-store"
import { useRouter } from "next/navigation"

interface ColoringHeaderProps {
  onDownload?: () => void
  onPrint?: () => void
  onOpenDrawings?: () => void
}

const getAvatarSrc = (mascot: string) => {
  if (mascot === "lion") return "/illustrations/lion.webp"
  if (mascot === "robot") return "/illustrations/robot.webp"
  return "/illustrations/awa.webp"
}

export function ColoringHeader({ onDownload, onPrint, onOpenDrawings }: ColoringHeaderProps) {
  const router = useRouter()
  const { profiles, activeProfileId, switchProfile } = useProfileStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [profileName, setProfileName] = useState("Awa")
  const [profileAge] = useState("6 ans")
  const [profileMascot, setProfileMascot] = useState("awa")
  const activeProfile = profiles.find((p) => p.id === activeProfileId)

  useEffect(() => {
    if (activeProfile) {
      setProfileName(activeProfile.name)
      setProfileMascot(activeProfile.mascot)
    }
  }, [activeProfile])

  useEffect(() => {
    const handleClick = () => setShowDropdown(false)
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  return (
    <header className="min-h-[80px] md:h-[80px] flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 select-none shrink-0 w-full py-2 md:py-0">
      <div className="flex flex-row items-center gap-[12px] md:gap-[24px] w-full md:w-auto justify-between md:justify-start">
        <Link href="/dashboard" className="flex-1 sm:flex-initial sm:w-[140px] h-[52px] rounded-full border border-[#EFE7DB] text-[#3B2416] bg-white hover:bg-neutral-50 shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 transition-all duration-250 hover:scale-[1.03] font-bold text-sm xs:text-base cursor-pointer">
          <ArrowLeft className="w-5 h-5 xs:w-6 xs:h-6 text-[#7A6A5E]" />
          <span>Retour</span>
        </Link>

        <Button
          onClick={onOpenDrawings}
          className="flex-1 sm:flex-initial sm:w-[180px] h-[52px] rounded-full bg-gradient-to-b from-[#6D4CFF] to-[#5A3EE0] text-white font-bold text-sm xs:text-[16px] md:text-[18px] shadow-sm flex items-center justify-center gap-1.5 xs:gap-2 hover:opacity-95"
        >
          <FolderOpen className="w-5 h-5 xs:w-6 xs:h-6" />
          <span>Mes dessins</span>
        </Button>
      </div>

      <div className="flex flex-row items-center gap-[12px] md:gap-[24px] w-full md:w-auto justify-between md:justify-end">
        <Button
          onClick={onDownload}
          variant="premium"
          className="flex-1 sm:flex-initial sm:w-[180px] h-[52px] rounded-full bg-[#FFD53D] hover:bg-[#FFD53D]/90 text-[#3B2416] font-extrabold text-sm xs:text-[16px] border-none shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 cursor-pointer transition-all duration-250 hover:scale-[1.03]"
        >
          <Download className="w-5 h-5 xs:w-6 xs:h-6 text-[#3B2416]" />
          <span>Télécharger</span>
        </Button>

        <Button
          onClick={onPrint}
          variant="default"
          className="flex-1 sm:flex-initial sm:w-[180px] h-[52px] rounded-full bg-[#25C76F] hover:bg-[#25C76F]/90 text-white font-extrabold text-sm xs:text-[16px] border-none shadow-sm flex items-center justify-center gap-1.5 xs:gap-2.5 cursor-pointer transition-all duration-250 hover:scale-[1.03]"
        >
          <Printer className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
          <span>Imprimer</span>
        </Button>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            onClick={(e) => {
              e.stopPropagation()
              setShowDropdown(!showDropdown)
            }}
            className="flex items-center gap-2 h-[52px] rounded-full border border-[#EFE7DB] pl-1.5 pr-3.5 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <Avatar className="w-9 h-9 border border-neutral-100">
              <AvatarImage src={getAvatarSrc(profileMascot)} />
              <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-extrabold text-[#3B2416] capitalize">{profileName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A6A5E]" />
            </div>
          </div>

          {showDropdown && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-14 z-50 w-64 bg-white rounded-2xl border border-[#EFE7DB] shadow-lg p-4"
            >
              <div className="flex items-center gap-3 border-b border-[#F0E7DA] pb-3 mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={getAvatarSrc(profileMascot)} />
                  <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-[#3B2416]">{profileName}</span>
                  <span className="text-[11px] font-bold text-[#7A6A5E]">{profileAge}</span>
                </div>
              </div>

              {profiles.length > 1 && (
                <div className="mb-3">
                  <span className="text-[10px] font-black text-[#7A6A5E] uppercase tracking-wider block mb-1.5">
                    Changer de profil
                  </span>
                  <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                    {profiles.map((p) => {
                      if (p.id === activeProfileId) return null
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            switchProfile(p.id)
                            setShowDropdown(false)
                          }}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#FFF9F2] rounded-xl cursor-pointer transition-colors"
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={getAvatarSrc(p.mascot)} />
                            <AvatarFallback>{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-[#3B2416]">{p.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1 pt-1 border-t border-[#F0E7DA]/50">
                <Link
                  href="/parametres"
                  onClick={() => setShowDropdown(false)}
                  className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
                >
                  <Settings className="inline w-3.5 h-3.5 mr-1" /> Paramètres
                </Link>
                <Link
                  href="/parents"
                  onClick={() => setShowDropdown(false)}
                  className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
                >
                  <Users className="inline w-3.5 h-3.5 mr-1" /> Espace Parents
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
