"use client"

import { motion } from "framer-motion"
import { Palette, Star, Save, Globe, ChevronRight, HelpCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { StudentLoginForm } from "@/components/auth/StudentLoginForm"
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher"
import { useI18n } from "@/lib/i18n-provider"

const FEATURES = [
  {
    icon: Palette,
    color: "#7D6AF8",
    bg: "#EEEDFE",
    title: "Dessine ce que tu imagines",
    desc: "Crée des dessins magiques avec l'IA",
  },
  {
    icon: Star,
    color: "#FFB300",
    bg: "#FFF4D6",
    title: "Gagne des étoiles",
    desc: "Chaque dessin te rapporte des points",
  },
  {
    icon: Save,
    color: "#1D9E75",
    bg: "#E1F5EE",
    title: "Tes créations sont sauvegardées",
    desc: "Retrouve tes dessins à tout moment",
  },
]

export default function SchoolLoginPage() {
  const { lang } = useI18n()

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row relative">
      {/* ───────────── Colonne gauche : panneau illustré crème ───────────── */}
      <div
        className="lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:h-screen bg-[#FFF9F2] border-r border-gray-100 flex flex-col px-6 md:px-12 lg:px-16 py-8 lg:py-12 overflow-hidden z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,249,242,0.80), rgba(255,249,242,0.80)), url('/illustrations/school-bg-children.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Logo */}
        <a
          href="https://www.monpetitbaobab.com/"
          className="shrink-0 cursor-pointer"
          aria-label="Retour à l'accueil Petit Baobab"
        >
          <Image
            src="/illustrations/logo-petit-baobab.svg"
            alt="Petit Baobab"
            width={780}
            height={258}
            className="h-36 md:h-48 w-auto object-contain"
            priority
          />
        </a>

        {/* Titre + sous-titre */}
        <div className="mt-8 lg:mt-12">
          <h1 className="text-3xl md:text-[40px] font-extrabold text-[#1C1C3A] leading-tight mb-3">
            Ta classe t&apos;attend ! <Palette className="w-5 h-5 inline" />
          </h1>
          <p className="text-base font-semibold text-[#64748B] leading-relaxed max-w-md">
            Ton maître t&apos;a donné un code ? Connecte-toi et commence à créer !
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 lg:mt-10 flex flex-col gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div
                className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: f.bg }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1C1C3A] leading-snug">
                  {f.title}
                </p>
                <p className="text-sm font-semibold text-[#64748B] leading-snug">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau bas */}
        <div className="mt-6 lg:mt-8 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white border border-[#E8E8EF] px-5 py-4">
          <span className="text-sm font-bold text-[#1C1C3A]">Tu es un adulte ?</span>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 h-11 rounded-full border-2 border-[#E8E8EF] hover:border-[#7D6AF8] text-[#1C1C3A] font-bold text-sm transition-colors"
          >
            Espace enseignant <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ───────────── Colonne droite : formulaire ───────────── */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen flex flex-col justify-between p-6 md:p-12 relative z-20 bg-white">
        <header className="w-full flex items-center justify-between">
          <Link
            href="/"
            className="lg:hidden text-sm font-bold text-[#7A6A5E] hover:text-[#1C1C3A] transition-colors"
          >
            ← Petit Baobab
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[520px]"
          >
            <StudentLoginForm />
          </motion.div>
        </main>

        <footer className="w-full text-center mt-8 py-4 border-t border-gray-100/50">
          <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-center text-xs font-semibold text-[#64748B] select-none">
            <button className="inline-flex items-center gap-1.5 hover:text-[#1C1C3A] transition-colors cursor-pointer bg-transparent border-none">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              <span>{lang === "fr" ? "Français" : "English"}</span>
            </button>
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <Link href="#" className="hover:text-[#1C1C3A] transition-colors">À propos</Link>
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <Link href="#" className="hover:text-[#1C1C3A] transition-colors">Aide</Link>
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <Link href="#" className="hover:text-[#1C1C3A] transition-colors">Conditions</Link>
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <Link href="#" className="hover:text-[#1C1C3A] transition-colors">Confidentialité</Link>
          </div>
          <div className="mt-4">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1C1C3A] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              <span>{lang === "fr" ? "Besoin d'aide ?" : "Need help?"}</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
