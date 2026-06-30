"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, CheckCircle2, AlertTriangle, ArrowRight, Star } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { t, lang, setLanguage } = useI18n()
  const { login, signup, isLoading, error: authError } = useAuthStore()

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [ageConsent, setAgeConsent] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [nextRedirect, setNextRedirect] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const next = params.get("next")
      if (next) {
        setNextRedirect(next)
      }
    }
  }, [])

  const handleLangToggle = () => {
    setLanguage(lang === "fr" ? "en" : "fr")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!email.trim() || !password.trim()) {
      setErrorMsg(lang === "fr" ? "Veuillez remplir tous les champs." : "Please fill in all fields.")
      return
    }

    if (activeTab === "signup") {
      if (password.length < 8) {
        setErrorMsg(
          lang === "fr"
            ? "Le mot de passe doit faire au moins 8 caractères."
            : "Password must be at least 8 characters long."
        )
        return
      }
      if (!ageConsent) {
        setErrorMsg(
          lang === "fr"
            ? "Veuillez confirmer que vous êtes majeur(e)."
            : "Please confirm that you are at least 18 years old."
        )
        return
      }

      // Signup Flow
      const result = await signup(email, password, ageConsent)
      if (result.success) {
        setSuccessMsg(
          lang === "fr"
            ? "Compte créé ! 5 étoiles offertes pour commencer à créer. Vous pouvez maintenant vous connecter !"
            : "Account created! 5 stars offered to start creating. You can now log in!"
        )
        setActiveTab("login")
        setPassword("")
      } else {
        setErrorMsg(result.error || (lang === "fr" ? "Erreur lors de l'inscription." : "Sign up error."))
      }
    } else {
      // Login Flow
      const result = await login(email, password)
      if (result.success) {
        if (nextRedirect) {
          router.push(nextRedirect)
        } else if (result.multipleProfiles) {
          router.push("/parents/select-profile")
        } else {
          router.push("/parents")
        }
      } else {
        setErrorMsg(result.error || (lang === "fr" ? "Identifiants incorrects." : "Incorrect credentials."))
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden flex flex-col items-center justify-center p-4 select-none">
      {/* Decorative Floating Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-[#FFE08A]/30 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FF8C39]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Language Switcher */}
      <button
        onClick={handleLangToggle}
        className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full border-2 border-[#3B2416] bg-white text-[#3B2416] font-bold text-xs shadow-[2px_2px_0px_0px_#3B2416] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3B2416] transition-all cursor-pointer z-20"
      >
        {lang === "fr" ? "English" : "Français"}
      </button>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border-4 border-[#3B2416] rounded-[36px] shadow-[8px_8px_0px_0px_#3B2416] overflow-hidden p-6 md:p-8 z-10 relative"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/illustrations/logo-petit-baobab.webp"
            alt="Petit Baobab Logo"
            width={180}
            height={60}
            className="w-auto h-[60px] object-contain"
            priority
          />
          <h2 className="text-[#3B2416] font-extrabold text-sm tracking-wider uppercase mt-2">
            {lang === "fr" ? "Espace Parents" : "Parents Area"}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F8FAFC] border-2 border-[#3B2416] rounded-2xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login")
              setErrorMsg("")
              setSuccessMsg("")
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-[#FFE08A] text-[#3B2416] border-2 border-[#3B2416] shadow-[2px_2px_0px_0px_#3B2416]"
                : "text-[#64748B] hover:text-[#3B2416]"
            }`}
          >
            {lang === "fr" ? "Connexion" : "Log In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup")
              setErrorMsg("")
              setSuccessMsg("")
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-[#FFE08A] text-[#3B2416] border-2 border-[#3B2416] shadow-[2px_2px_0px_0px_#3B2416]"
                : "text-[#64748B] hover:text-[#3B2416]"
            }`}
          >
            {lang === "fr" ? "Créer un compte" : "Sign Up"}
          </button>
        </div>

        {/* Informative Welcome Banner for Signup */}
        <AnimatePresence mode="wait">
          {activeTab === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#DDF26B]/20 border-2 border-[#BCE83E] rounded-2xl p-3.5 mb-5 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#BCE83E] flex items-center justify-center text-[#3B2416] shrink-0 animate-bounce">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-xs text-[#3B2416] font-bold leading-snug">
                {lang === "fr"
                  ? "Bienvenue ! Recevez 5 étoiles offertes à la création du compte pour tester le Dessin Magique avec vos enfants."
                  : "Welcome! Get 5 free stars upon registration to test Magic Drawing with your kids."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 rounded-2xl p-3 text-xs font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-2 border-green-500 text-green-700 rounded-2xl p-3 text-xs font-bold flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5 uppercase">
              {lang === "fr" ? "Adresse e-mail" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parents@example.com"
                className="w-full h-[50px] pl-11 pr-4 rounded-2xl border-2 border-[#3B2416] text-[#3B2416] font-bold text-sm bg-white placeholder-[#94A3B8] focus:outline-none focus:bg-[#FFF9F2] focus:ring-2 focus:ring-[#FFE08A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5 uppercase">
              {lang === "fr" ? "Mot de passe" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[50px] pl-11 pr-4 rounded-2xl border-2 border-[#3B2416] text-[#3B2416] font-bold text-sm bg-white placeholder-[#94A3B8] focus:outline-none focus:bg-[#FFF9F2] focus:ring-2 focus:ring-[#FFE08A]"
              />
            </div>
          </div>

          {/* Parental Age Consent Checkbox */}
          {activeTab === "signup" && (
            <label className="flex items-start gap-3 mt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ageConsent}
                onChange={(e) => setAgeConsent(e.target.checked)}
                className="mt-1.5 w-4 h-4 accent-[#3B2416] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#64748B] leading-snug">
                {lang === "fr"
                  ? "J'ai plus de 18 ans et j'autorise la création de ce compte familial conformément aux conditions."
                  : "I am over 18 years old and authorize the creation of this family account according to terms."}
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[54px] bg-[#6D4AFF] text-white border-2 border-[#3B2416] rounded-2xl font-bold text-sm shadow-[4px_4px_0px_0px_#3B2416] hover:bg-[#6D4AFF]/95 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#3B2416] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>
              {isLoading
                ? (lang === "fr" ? "Chargement..." : "Loading...")
                : activeTab === "login"
                ? (lang === "fr" ? "Se connecter" : "Log In")
                : (lang === "fr" ? "Créer mon compte" : "Create Account")}
            </span>
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-[#64748B] hover:text-[#3B2416] hover:underline cursor-pointer"
          >
            {lang === "fr" ? "← Retourner à l'accueil" : "← Go to Home"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
