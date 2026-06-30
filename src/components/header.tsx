"use client"

import { Search, Bell, Globe, Menu, ChevronDown, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCreditStore } from "@/lib/credit-store"
import { useProfileStore } from "@/lib/profile-store"
import { useI18n } from "@/lib/i18n-provider"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

export function Header() {
  const router = useRouter()
  const { lang, setLanguage, t } = useI18n()
  
  // Credits/Stars store
  const credits = useCreditStore()
  const creditInfo = credits.useCredits()
  const { account } = useAuthStore()
  const displayStars = account ? account.stars_balance : creditInfo.remaining

  // Profiles store
  const { profiles, activeProfileId, switchProfile } = useProfileStore()
  const activeProfile = profiles.find((p) => p.id === activeProfileId)

  // Profile local states
  const [profileName, setProfileName] = useState("Awa")
  const [profileAge, setProfileAge] = useState("6 ans")
  const [profileMascot, setProfileMascot] = useState("awa")

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Notifications mock data
  const [unreadNotifications, setUnreadNotifications] = useState([
    { id: 1, text: "🎨 Félicitations ! Tu as gagné le badge Super Artiste !" },
    { id: 2, text: "📚 Ton livre de coloriage est prêt à être téléchargé !" },
    { id: 3, text: "✨ Nouveau dessin magique disponible." },
  ])

  useEffect(() => {
    if (activeProfile) {
      setProfileName(activeProfile.name)
      setProfileMascot(activeProfile.mascot)
      setProfileAge("6 ans") // Age par défaut
    } else {
      const storedName = localStorage.getItem("pb_child_name")
      const storedMascot = localStorage.getItem("pb_mascot")
      if (storedName) setProfileName(storedName)
      if (storedMascot) setProfileMascot(storedMascot)
    }
  }, [activeProfile])

  // Click away listener for dropdowns
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false)
      setShowProfileDropdown(false)
    }
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  const getAvatarSrc = (mascot: string) => {
    if (mascot === "lion") return "/illustrations/lion.webp"
    if (mascot === "robot") return "/illustrations/robot.webp"
    return "/illustrations/awa.webp"
  }

  const toggleLanguage = () => {
    setLanguage(lang === "fr" ? "en" : "fr")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/magic-drawing?prompt=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleMarkAllRead = () => {
    setUnreadNotifications([])
  }

  const handleRemoveNotification = (id: number) => {
    setUnreadNotifications(unreadNotifications.filter((n) => n.id !== id))
  }

  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-2 lg:h-[72px] select-none relative w-full">
      {/* Mobile Top Bar (Brand + Actions) & Desktop Actions Alignment */}
      <div className="flex items-center justify-between lg:hidden w-full">
        {/* Mobile Left: Menu Toggle + Mini Logo */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10 text-[#7A6A5E]">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 w-[280px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/illustrations/logo-petit-baobab.webp"
                alt="Petit Baobab"
                width={120}
                height={40}
                className="h-[36px] w-auto object-contain cursor-pointer"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Mobile Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Star Credit Badge Mobile */}
          <div className="flex items-center gap-1 h-9 px-2.5 rounded-full border border-[#FFE08A] bg-[#FFF5CC] text-[#3B2416]">
            <Star className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
            <span className="text-xs font-black">{displayStars}</span>
          </div>

          {/* Language Toggle Mobile */}
          <Button
            onClick={(e) => {
              e.stopPropagation()
              toggleLanguage()
            }}
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full border border-[#EFE7DB] text-[#7A6A5E] bg-white hover:bg-neutral-50 shrink-0 flex items-center justify-center text-[10px] font-bold"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase ml-0.5">{lang}</span>
          </Button>

          {/* Bell Toggle Mobile */}
          <Button
            onClick={(e) => {
              e.stopPropagation()
              setShowNotifications(!showNotifications)
              setShowProfileDropdown(false)
            }}
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full border border-[#EFE7DB] text-[#7A6A5E] relative bg-white hover:bg-neutral-50 shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#FF5E83] rounded-full text-[8px] font-extrabold text-white flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </Button>

          {/* Profile Dropdown Toggle Mobile */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              setShowProfileDropdown(!showProfileDropdown)
              setShowNotifications(false)
            }}
            className="flex items-center gap-1.5 h-[40px] rounded-full border border-[#EFE7DB] pl-1.5 pr-2 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm select-none"
          >
            <Avatar className="w-7 h-7">
              <AvatarImage src={getAvatarSrc(profileMascot)} />
              <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <ChevronDown className="w-3 h-3 text-[#7A6A5E] shrink-0" />
          </div>
        </div>
      </div>

      {/* Search Bar - Responsive layout */}
      <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-[640px]">
        <button
          type="submit"
          className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7A6A5E] hover:text-[#3B2416] transition-colors border-none bg-transparent cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>
        <Input
          placeholder={t("search.placeholder") || "Que veux-tu créer aujourd'hui ? (ex : un éléphant...)"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-14 pr-6 w-full h-[54px] rounded-full border border-[#EFE7DB] bg-white text-base font-medium text-[#3B2416] placeholder-[#7A6A5E]/60 focus-visible:ring-1 focus-visible:ring-[#FFD95C]"
        />
      </form>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-3 relative shrink-0">
        {/* Stars/Credits Indicator */}
        <div className="flex items-center gap-2 h-11 px-4 rounded-full border border-[#FFE08A] bg-[#FFF5CC] text-[#3B2416]">
          <Star className="w-5 h-5 text-[#FFB300] fill-[#FFB300]" />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-black">{displayStars}</span>
            <span className="text-[9px] font-bold text-[#7A6A5E]">
              {displayStars > 1 ? "Étoiles restantes" : "Étoile restante"}
            </span>
          </div>
        </div>

        {/* Language Selection */}
        <Button
          onClick={(e) => {
            e.stopPropagation()
            toggleLanguage()
          }}
          variant="ghost"
          className="h-11 px-4 rounded-full border border-[#EFE7DB] text-[#7A6A5E] bg-white hover:bg-neutral-50 flex items-center gap-2 text-sm font-bold"
        >
          <Globe className="w-4 h-4" />
          <span className="uppercase text-xs">{lang}</span>
        </Button>

        {/* Notifications */}
        <Button
          onClick={(e) => {
            e.stopPropagation()
            setShowNotifications(!showNotifications)
            setShowProfileDropdown(false)
          }}
          variant="ghost"
          size="icon"
          className="w-11 h-11 rounded-full border border-[#EFE7DB] text-[#7A6A5E] relative bg-white hover:bg-neutral-50 shrink-0"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF5E83] rounded-full text-[9px] font-extrabold text-white flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </Button>

        {/* Profile Dropdown */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setShowProfileDropdown(!showProfileDropdown)
            setShowNotifications(false)
          }}
          className="flex items-center gap-2 h-[56px] rounded-full border border-[#EFE7DB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={getAvatarSrc(profileMascot)} />
            <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left leading-none">
            <span className="text-sm font-bold text-[#3B2416]">{profileName}</span>
            <span className="text-[10px] font-bold text-[#7A6A5E] mt-0.5">{profileAge}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#7A6A5E] ml-1 shrink-0" />
        </div>
      </div>

      {/* Global Notifications Dropdown */}
      {showNotifications && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 lg:right-16 top-16 z-50 w-80 bg-white rounded-2xl border border-[#EFE7DB] shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#F0E7DA] pb-2 mb-2">
            <span className="text-sm font-bold text-[#3B2416]">Notifications</span>
            {unreadNotifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#7C57FF] hover:underline bg-transparent border-none cursor-pointer"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <p className="text-xs text-[#7A6A5E] text-center py-4 font-semibold">
                Aucune nouvelle notification
              </p>
            ) : (
              unreadNotifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-2 p-2 hover:bg-[#FFF9F2] rounded-xl group transition-colors"
                >
                  <span className="text-xs font-bold text-[#3B2416] leading-snug">{n.text}</span>
                  <button
                    onClick={() => handleRemoveNotification(n.id)}
                    className="text-xs text-[#7A6A5E] hover:text-[#FF5E83] opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Global Profile Dropdown */}
      {showProfileDropdown && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-16 z-50 w-64 bg-white rounded-2xl border border-[#EFE7DB] shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200"
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

          {/* Switch profile section */}
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
                        setShowProfileDropdown(false)
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

          {/* Links */}
          <div className="flex flex-col gap-1 pt-1 border-t border-[#F0E7DA]/50">
            <Link
              href="/parametres"
              onClick={() => setShowProfileDropdown(false)}
              className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
            >
              ⚙️ Paramètres
            </Link>
            <Link
              href="/parents"
              onClick={() => setShowProfileDropdown(false)}
              className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
            >
              👨‍👩‍👧 Espace Parents
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

