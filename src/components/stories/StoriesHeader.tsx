"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronDown, Settings, Users, LogOut, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getMascotImage } from "@/lib/mascots"
import { useProfile } from "@/lib/hooks/useProfile"
import { useProfileStore } from "@/lib/profile-store"
import { useAuthStore } from "@/lib/auth-store"

interface StoriesHeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
}

/**
 * En-tête de la page Histoires.
 *
 * La barre de recherche reste propre à la page (elle filtre la liste des
 * histoires), mais la cloche et le compte reprennent **le style et le
 * comportement de l'en-tête commun de /learn** (`app/learn/_components/
 * header.tsx`) : panneau de notifications, vrai profil (nom + âge + mascotte)
 * et menu déroulant. Auparavant la cloche était décorative (aucun clic, badge
 * qui pulse en permanence) et la pilule de compte n'était pas cliquable, avec
 * un nom « Moussa » codé en dur.
 */
export function StoriesHeader({ searchQuery, onSearchChange }: StoriesHeaderProps) {
  const router = useRouter()
  const { logout, studentSession } = useAuthStore()
  const { switchProfile } = useProfileStore()
  const profile = useProfile()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // En mode élève, l'identité vient de la session élève ; sinon du profil actif.
  const profileName = studentSession?.name || profile.name
  const profileMascot = studentSession?.mascot || profile.mascot
  const profileAge = profile.age ? `${profile.age} ans` : null

  const [unreadNotifications, setUnreadNotifications] = useState([
    { id: 1, text: "Félicitations ! Tu as gagné le badge Super Artiste !" },
    { id: 2, text: "Ton livre de coloriage est prêt à être téléchargé !" },
    { id: 3, text: "Nouveau dessin magique disponible." },
  ])

  // Fermeture des menus au clic extérieur (même comportement que l'en-tête /learn)
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false)
      setShowProfileDropdown(false)
    }
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  const renderNotifications = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-2rem)] max-w-[20rem] bg-white rounded-2xl border border-[#EFE7DB] shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between border-b border-[#F0E7DA] pb-2 mb-2">
        <span className="text-sm font-bold text-[#3B2416]">Notifications</span>
        {unreadNotifications.length > 0 && (
          <button
            onClick={() => setUnreadNotifications([])}
            className="text-xs font-bold text-[#6D4CFF] hover:underline bg-transparent border-none cursor-pointer"
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
                onClick={() => setUnreadNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                className="text-xs text-[#7A6A5E] hover:text-[#FF5E83] opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
                aria-label="Retirer la notification"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderProfileMenu = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-2rem)] max-w-[16rem] bg-white rounded-2xl border border-[#EFE7DB] shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center gap-3 border-b border-[#F0E7DA] pb-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={getMascotImage(profileMascot)} />
          <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left">
          <span className="text-sm font-black text-[#3B2416]">{profileName}</span>
          {profileAge && <span className="text-[11px] font-bold text-[#7A6A5E]">{profileAge}</span>}
        </div>
      </div>

      {!studentSession && profile.profiles.length > 1 && (
        <div className="mb-3">
          <span className="text-[10px] font-black text-[#7A6A5E] uppercase tracking-wider block mb-1.5">
            Changer de profil
          </span>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
            {profile.profiles.map((p) => {
              if (p.id === profile.activeProfileId) return null
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
                    <AvatarImage src={getMascotImage(p.mascot)} />
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
          onClick={() => setShowProfileDropdown(false)}
          className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
        >
          <Settings className="inline w-3.5 h-3.5 mr-1" /> Paramètres
        </Link>
        <Link
          href="/parents"
          onClick={() => setShowProfileDropdown(false)}
          className="text-xs font-bold text-[#7A6A5E] hover:text-[#3B2416] hover:bg-[#FFF9F2] p-2 rounded-xl transition-colors block text-left"
        >
          <Users className="inline w-3.5 h-3.5 mr-1" /> Espace Parents
        </Link>
        <button
          onClick={async () => {
            setShowProfileDropdown(false)
            await logout()
            router.push("/login?space=family")
          }}
          className="text-xs font-bold text-[#FF5E83] hover:bg-[#FF5E83]/10 p-2 rounded-xl transition-colors block text-left w-full border-none bg-transparent cursor-pointer"
        >
          <LogOut className="inline w-3.5 h-3.5 mr-1" /> Se déconnecter
        </button>
      </div>
    </div>
  )

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 select-none">
      {/* Barre de recherche — propre à la page, elle filtre la liste des histoires */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9C8E82]">
          <Search className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une histoire..."
          className="w-full h-11 md:h-12 pl-11 md:pl-12 pr-4 bg-[#F5EFEB]/90 hover:bg-[#F5EFEB] focus:bg-white text-[#3B2416] placeholder-[#A49488] text-sm md:text-base font-semibold rounded-full border border-transparent focus:border-[#7D6AF8]/40 focus:outline-none transition-all duration-200 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-[#A49488] hover:text-[#3B2416] cursor-pointer"
            aria-label="Effacer la recherche"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right controls: Notifications & Profile — alignés sur l'en-tête /learn */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowNotifications(!showNotifications)
              setShowProfileDropdown(false)
            }}
            className="w-11 h-11 rounded-full border border-[#EFE7DB] text-[#7A6A5E] relative bg-white hover:bg-neutral-50 shrink-0 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF5E83] rounded-full text-[9px] font-extrabold text-white flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </button>
          {showNotifications && renderNotifications()}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            onClick={(e) => {
              e.stopPropagation()
              setShowProfileDropdown(!showProfileDropdown)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 h-[56px] rounded-full border border-[#EFE7DB] pl-2 pr-4 bg-white cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={getMascotImage(profileMascot)} />
              <AvatarFallback>{profileName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-bold text-[#3B2416]">{profileName}</span>
              {profileAge && (
                <span className="text-[10px] font-bold text-[#7A6A5E] mt-0.5">{profileAge}</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-[#7A6A5E] ml-1 shrink-0" />
          </div>
          {showProfileDropdown && renderProfileMenu()}
        </div>
      </div>
    </header>
  )
}
