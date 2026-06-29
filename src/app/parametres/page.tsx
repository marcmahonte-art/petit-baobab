"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Volume2,
  Languages,
  Shield,
  Lock,
  Info,
  Check,
  Music,
  User,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const mascottes = [
  { id: "awa", name: "Awa", desc: "La petite fille curieuse", image: "/illustrations/avatar-awa.png" },
  { id: "lion", name: "Bébé Lion", desc: "Le roi courageux de la savane", image: "/illustrations/avatar-lion.png" },
  { id: "robot", name: "Baobab Robot", desc: "Le robot ami de la nature", image: "/illustrations/avatar-robot.png" },
]

export default function ParametresPage() {
  // State variables with local storage support
  const [childName, setChildName] = useState("Awa")
  const [selectedMascot, setSelectedMascot] = useState("awa")
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [language, setLanguage] = useState("fr")
  const [parentalLockEnabled, setParentalLockEnabled] = useState(false)
  const [parentPin, setParentPin] = useState("1234")
  const [isSavedToastOpen, setIsSavedToastOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("pb_child_name")
      const storedMascot = localStorage.getItem("pb_mascot")
      const storedMusic = localStorage.getItem("pb_music")
      const storedSfx = localStorage.getItem("pb_sfx")
      const storedLang = localStorage.getItem("pb_lang")
      const storedLock = localStorage.getItem("pb_lock")
      const storedPin = localStorage.getItem("pb_pin")

      setTimeout(() => {
        if (storedName) setChildName(storedName)
        if (storedMascot) setSelectedMascot(storedMascot)
        if (storedMusic) setMusicEnabled(storedMusic === "true")
        if (storedSfx) setSfxEnabled(storedSfx === "true")
        if (storedLang) setLanguage(storedLang)
        if (storedLock) setParentalLockEnabled(storedLock === "true")
        if (storedPin) setParentPin(storedPin)
      }, 0)
    }
  }, [])

  // Save settings handler
  const handleSave = () => {
    localStorage.setItem("pb_child_name", childName)
    localStorage.setItem("pb_mascot", selectedMascot)
    localStorage.setItem("pb_music", String(musicEnabled))
    localStorage.setItem("pb_sfx", String(sfxEnabled))
    localStorage.setItem("pb_lang", language)
    localStorage.setItem("pb_lock", String(parentalLockEnabled))
    localStorage.setItem("pb_pin", parentPin)

    setIsSavedToastOpen(true)
    setTimeout(() => setIsSavedToastOpen(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24 text-[#3B2416] font-sans">
      {/* Toast Notification */}
      {isSavedToastOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-[#20C997] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 border border-white/20"
        >
          <Check className="w-5 h-5" />
          <span>Paramètres enregistrés avec succès !</span>
        </motion.div>
      )}

      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          {/* Header */}
          <div className="flex flex-col gap-1 select-none">
            <h1 className="text-3xl sm:text-[40px] font-extrabold text-[#261B4B] leading-none tracking-tight">
              Paramètres
            </h1>
            <p className="text-sm sm:text-base font-bold text-[#7A6A5E] mt-1.5">
              Personnalise ton expérience de jeu sur Petit Baobab !
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_392px] gap-6 items-start">
            {/* Left Side: Settings forms */}
            <div className="flex flex-col gap-6">
              
              {/* Profile settings */}
              <Card className="rounded-[28px] border border-[#F0E7DA] p-6 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col gap-6">
                <div className="flex items-center gap-2.5 border-b border-[#F0E7DA] pb-4">
                  <div className="w-9 h-9 rounded-full bg-[#7D6AF8]/10 flex items-center justify-center text-[#7D6AF8]">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#261B4B]">Profil de l&apos;enfant</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-[#7A6A5E] uppercase tracking-wider">
                      Prénom de l&apos;enfant
                    </label>
                    <Input
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Ex: Awa, Kofi..."
                      className="rounded-xl border-[#F0E7DA] h-12 px-4 text-sm font-bold text-[#3B2416] bg-[#FFF9F2]/30 focus-visible:ring-[#7D6AF8]"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-black text-[#7A6A5E] uppercase tracking-wider">
                      Choisis ta Mascotte
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mascottes.map((m) => {
                        const isSelected = selectedMascot === m.id
                        return (
                          <motion.div
                            key={m.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMascot(m.id)}
                            className={`rounded-2xl border-2 p-4 flex flex-col items-center text-center cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#7D6AF8] bg-[#7D6AF8]/5 shadow-sm"
                                : "border-[#F0E7DA] bg-white hover:border-[#7D6AF8]/50"
                            }`}
                          >
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#FFF9F2] border border-[#F0E7DA] mb-2 flex items-center justify-center">
                              <div className="text-2xl select-none">
                                {m.id === "awa" ? "👧🏾" : m.id === "lion" ? "🦁" : "🤖"}
                              </div>
                            </div>
                            <span className="font-extrabold text-sm text-[#261B4B]">{m.name}</span>
                            <span className="text-[10px] font-bold text-[#7A6A5E] mt-1 leading-tight">{m.desc}</span>
                            
                            {isSelected && (
                              <div className="mt-2 w-5 h-5 rounded-full bg-[#7D6AF8] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Audio Settings */}
              <Card className="rounded-[28px] border border-[#F0E7DA] p-6 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col gap-6">
                <div className="flex items-center gap-2.5 border-b border-[#F0E7DA] pb-4">
                  <div className="w-9 h-9 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-[#FFB300]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#261B4B]">Préférences Audio</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F2]/30 border border-[#F0E7DA]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#F0E7DA] text-[#7A6A5E]">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-[#261B4B]">Musique d&apos;ambiance</span>
                        <span className="text-xs font-semibold text-[#7A6A5E]">Mélodie africaine douce en arrière-plan</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMusicEnabled(!musicEnabled)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer outline-none border-none ${
                        musicEnabled ? "bg-[#20C997]" : "bg-neutral-200"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-6 h-6 rounded-full bg-white shadow-md"
                        animate={{ x: musicEnabled ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F2]/30 border border-[#F0E7DA]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#F0E7DA] text-[#7A6A5E]">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-[#261B4B]">Effets sonores</span>
                        <span className="text-xs font-semibold text-[#7A6A5E]">Sons interactifs lors du coloriage et des clics</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSfxEnabled(!sfxEnabled)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer outline-none border-none ${
                        sfxEnabled ? "bg-[#20C997]" : "bg-neutral-200"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-6 h-6 rounded-full bg-white shadow-md"
                        animate={{ x: sfxEnabled ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Language Settings */}
              <Card className="rounded-[28px] border border-[#F0E7DA] p-6 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col gap-6">
                <div className="flex items-center gap-2.5 border-b border-[#F0E7DA] pb-4">
                  <div className="w-9 h-9 rounded-full bg-[#1194FF]/10 flex items-center justify-center text-[#1194FF]">
                    <Languages className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#261B4B]">Langue de l&apos;application</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { code: "fr", label: "Français", detail: "Langue par défaut", flag: "🇫🇷" },
                    { code: "moore", label: "Mooré", detail: "Burkina Faso", flag: "🇧🇫" },
                    { code: "dioula", label: "Dioula", detail: "Afrique de l'Ouest", flag: "🇧🇫" },
                  ].map((l) => {
                    const isSelected = language === l.code
                    return (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`rounded-2xl border-2 p-4 text-left cursor-pointer transition-all flex flex-col justify-between h-[96px] outline-none ${
                          isSelected
                            ? "border-[#1194FF] bg-[#1194FF]/5 shadow-sm"
                            : "border-[#F0E7DA] bg-white hover:border-[#1194FF]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-2xl">{l.flag}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#1194FF] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col mt-2">
                          <span className="font-extrabold text-sm text-[#261B4B]">{l.label}</span>
                          <span className="text-[10px] font-bold text-[#7A6A5E] mt-0.5">{l.detail}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              {/* Parental lock / Safety validation */}
              <Card className="rounded-[28px] border border-[#F0E7DA] p-6 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col gap-6">
                <div className="flex items-center gap-2.5 border-b border-[#F0E7DA] pb-4">
                  <div className="w-9 h-9 rounded-full bg-[#FF5E83]/10 flex items-center justify-center text-[#FF5E83]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#261B4B]">Contrôle Parental</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F2]/30 border border-[#F0E7DA]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#F0E7DA] text-[#7A6A5E]">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-[#261B4B]">Vérification parentale active</span>
                        <span className="text-xs font-semibold text-[#7A6A5E]">
                          Vérifier avec le code PIN pour accéder à l&apos;espace parents
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setParentalLockEnabled(!parentalLockEnabled)}
                      className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer outline-none border-none ${
                        parentalLockEnabled ? "bg-[#20C997]" : "bg-neutral-200"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-6 h-6 rounded-full bg-white shadow-md"
                        animate={{ x: parentalLockEnabled ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {parentalLockEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-col gap-1.5 p-3 rounded-2xl bg-neutral-50 border border-dashed border-[#F0E7DA]"
                    >
                      <label className="text-xs font-black text-[#7A6A5E] uppercase tracking-wider">
                        Code PIN Parent (4 chiffres)
                      </label>
                      <Input
                        type="password"
                        maxLength={4}
                        value={parentPin}
                        onChange={(e) => setParentPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="1234"
                        className="rounded-xl border-[#F0E7DA] h-12 w-32 px-4 text-center font-bold text-lg text-[#3B2416] bg-white focus-visible:ring-[#FF5E83]"
                      />
                    </motion.div>
                  )}
                </div>
              </Card>

              {/* Bottom Actions */}
              <div className="flex items-center gap-4 mt-2 justify-end">
                <Button
                  onClick={handleSave}
                  className="w-full sm:w-[200px] h-[56px] rounded-[18px] bg-[#6D4AFF] text-white hover:bg-[#6D4AFF]/90 font-bold text-[16px] flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Enregistrer</span>
                </Button>
              </div>
            </div>

            {/* Right Side: Informative Card */}
            <div className="flex flex-col gap-6">
              {/* App Info Card */}
              <Card className="rounded-[28px] border border-[#F0E7DA] p-6 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col gap-4">
                <div className="flex items-center gap-2.5 border-b border-[#F0E7DA] pb-3">
                  <div className="w-8 h-8 rounded-full bg-[#20C997]/10 flex items-center justify-center text-[#20C997]">
                    <Info className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-[#261B4B]">À Propos</h3>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-[#7A6A5E]">Version</span>
                    <span className="font-extrabold text-[#261B4B]">1.0.0 (Bêta)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-[#7A6A5E]">Nom de code</span>
                    <span className="font-extrabold text-[#261B4B]">Petit Baobab</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-[#7A6A5E]">Localisation</span>
                    <span className="font-extrabold text-[#261B4B]">Ouagadougou, BF 🇧🇫</span>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-[#FFF5CC] border border-[#FFE08A] flex flex-col gap-2 mt-2">
                    <span className="text-xs font-black text-[#3B2416] uppercase tracking-wider block">
                      💡 Astuce Mascotte
                    </span>
                    <p className="text-xs font-semibold text-[#7A6A5E] leading-relaxed">
                      La mascotte choisie t&apos;accompagnera partout sur le site et te donnera des encouragements quand tu finiras tes dessins !
                    </p>
                  </div>
                </div>
              </Card>
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
