"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { useAuthStore } from "@/lib/auth-store"
import {
  ChevronDown,
  Menu,
  Globe,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navLinks = [
  { label: "Accueil", href: "#hero" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
  { label: "À propos", href: "#about" },
]

export default function Header() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const { user, logout } = useAuthStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleLangToggle = () => {
    setLanguage(lang === "fr" ? "en" : "fr")
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 h-20 bg-white/90 backdrop-blur-sm border-b border-brand-border">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-full flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => router.push("/")}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="shrink-0">
            <rect x="16" y="26" width="8" height="10" rx="2" fill="#8B5A2B" />
            <ellipse cx="20" cy="14" rx="12" ry="10" fill="#20C997" />
            <circle cx="20" cy="13" r="4" fill="#FFF9F2" />
          </svg>
          <div className="flex flex-col leading-tight">
            <div className="flex gap-1">
              <span className="text-[18px] font-bold text-[#1A1A2E]">Petit</span>
              <span className="text-[18px] font-extrabold text-[#7D6AF8]">Baobab</span>
            </div>
            <span className="text-[11px] font-medium text-[#6B6B7B] hidden sm:block">
              Apprendre, créer, grandir !
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-semibold text-[#1A1A2E] hover:text-[#7D6AF8] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-[15px] font-semibold text-[#1A1A2E] hover:text-[#7D6AF8] transition-colors duration-200 cursor-pointer">
              Livres
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem>Coloriages</DropdownMenuItem>
              <DropdownMenuItem>Histoires</DropdownMenuItem>
              <DropdownMenuItem>Jeux éducatifs</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Lang switcher */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLangToggle}
                  className="w-10 h-10 rounded-full border border-[#E5E0D5] bg-transparent flex items-center justify-center hover:bg-[#FFF9F2] transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#1A1A2E]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-semibold">
                  {lang === "fr" ? "Switch to English" : "Passer en Français"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {user ? (
            <>
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-11 px-6 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-semibold shadow-card transition-all duration-200 cursor-pointer"
              >
                {lang === "fr" ? "Mon Espace" : "My Space"}
              </Button>
              <Button
                onClick={handleLogout}
                className="h-11 px-6 rounded-full bg-[#FF5E83] hover:bg-[#e04a6b] text-white font-semibold shadow-card transition-all duration-200 cursor-pointer"
              >
                {lang === "fr" ? "Quitter" : "Sign Out"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="hidden sm:inline-flex h-11 rounded-full px-6 border border-[#E5E0D5] bg-transparent font-semibold text-[#1A1A2E] hover:bg-[#FFF9F2] transition-colors cursor-pointer"
              >
                {lang === "fr" ? "Se connecter" : "Log In"}
              </Button>
              <Button
                onClick={() => router.push("/login?tab=signup")}
                className="h-11 rounded-full px-6 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-semibold shadow-card hover:shadow-hover hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer"
              >
                {lang === "fr" ? "Créer un compte" : "Create Account"}
              </Button>
            </>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-[#E5E0D5] bg-transparent cursor-pointer">
                <Menu className="w-5 h-5 text-[#1A1A2E]" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white pt-16">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className="text-[15px] font-semibold text-[#1A1A2E] hover:text-[#7D6AF8] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="text-[15px] font-semibold text-[#1A1A2E]">
                  Livres
                </div>
                <div className="flex flex-col gap-3 pl-4 text-[14px] text-[#6B6B7B]">
                  <a href="#">Coloriages</a>
                  <a href="#">Histoires</a>
                  <a href="#">Jeux éducatifs</a>
                </div>
              </nav>
              <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-3">
                <Button
                  onClick={() => { setSheetOpen(false); router.push("/login") }}
                  variant="outline"
                  className="w-full h-11 rounded-full border border-[#E5E0D5]"
                >
                  {lang === "fr" ? "Se connecter" : "Log In"}
                </Button>
                <Button
                  onClick={() => { setSheetOpen(false); router.push("/login?tab=signup") }}
                  className="w-full h-11 rounded-full bg-[#7D6AF8] hover:bg-[#6552E8] text-white"
                >
                  {lang === "fr" ? "Créer un compte" : "Create Account"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
