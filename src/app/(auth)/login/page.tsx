"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useI18n } from "@/lib/i18n-provider"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { logger } from "@/lib/logger"
import { getSiteUrl } from "@/lib/site"
import { getHomeRedirect } from "@/lib/admin/client-guard"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { InputField } from "@/components/auth/InputField"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { RememberMe } from "@/components/auth/RememberMe"
import { ForgotPasswordLink } from "@/components/auth/ForgotPasswordLink"
import { PrimaryButton } from "@/components/auth/PrimaryButton"
import { SocialButton } from "@/components/auth/SocialButton"
import { Divider } from "@/components/auth/Divider"
import { NeedHelpLink } from "@/components/auth/NeedHelpLink"

function LoginFormContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang } = useI18n()
  const { login, isLoading, error, user, account } = useAuthStore()

  // Espace ciblé : family (parent) ou school (enseignant). Par défaut family.
  const spaceParam = searchParams.get("space")
  const [space, setSpace] = useState<"family" | "school">(
    spaceParam === "school" ? "school" : "family"
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const next = searchParams.get("next")
      if (next) {
        router.push(next)
      } else if (account?.plan === "ecole_pro" || space === "school") {
        router.push("/school/dashboard")
      } else {
        router.push("/parents")
      }
    }
  }, [user, account, space, router, searchParams])

  // Read redirect error parameters if any
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      if (errorParam === "exchange_failed" || errorParam === "callback_error") {
        setSubmitError(
          lang === "fr"
            ? "La connexion avec Google a échoué. Veuillez réessayer."
            : "Google login failed. Please try again."
        )
      } else if (errorParam === "code_missing") {
        setSubmitError(
          lang === "fr"
            ? "Code d'authentification manquant."
            : "Authentication code missing."
        )
      } else {
        setSubmitError(errorParam)
      }
    }
  }, [searchParams, lang])

  const switchSpace = (next: "family" | "school") => {
    setSpace(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("space", next)
    const newUrl = `${pathname}?${params.toString()}`
    window.history.replaceState(null, "", newUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    setSubmitError(null)

    // Basic Validation
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) {
      errors.email = lang === "fr" ? "Veuillez saisir votre adresse e-mail." : "Please enter your email address."
    } else if (!email.includes("@")) {
      errors.email = lang === "fr" ? "Veuillez saisir une adresse e-mail valide." : "Please enter a valid email address."
    }

    if (!password) {
      errors.password = lang === "fr" ? "Veuillez saisir votre mot de passe." : "Please enter your password."
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Call store login
    const result = await login(email, password)
    if (result.success) {
      const next = searchParams.get("next")
      const plan = useAuthStore.getState().account?.plan
      if (next) {
        router.push(next)
      } else if (plan === "ecole_pro") {
        router.push("/school/dashboard")
      } else if (result.multipleProfiles) {
        router.push("/parents/select-profile")
      } else {
        // Espace famille : on redirige vers l'espace apprenant.
        // Si c'est un Super Admin, il va vers le back-office /dashboard.
        router.push(getHomeRedirect())
      }
    } else {
      setSubmitError(result.error || (lang === "fr" ? "Identifiants de connexion incorrects." : "Incorrect login credentials."))
    }
  }

  const handleSocialLogin = async (provider: "google" | "apple" | "facebook") => {
    if (provider !== "google" && provider !== "facebook") {
      alert(lang === "fr" ? "Connexion sociale bientôt disponible !" : "Social login coming soon!")
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          scopes: provider === "facebook" ? "public_profile" : undefined,
          redirectTo: `${getSiteUrl()}/api/auth/callback?accountType=${space === "school" ? "school" : "family"}`,
        },
      })
      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error("OAuth error:", err)
      setSubmitError(
        err.message ||
          (lang === "fr"
            ? "Une erreur est survenue lors de l'authentification."
            : "An error occurred during authentication.")
      )
    }
  }

  const isSchool = space === "school"
  const signupHref = `/signup?space=${space}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full bg-white px-6 py-8 md:p-12 md:shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:rounded-[32px] border border-gray-100/50"
    >
      {/* Sélecteur d'espace : Parent / École */}
      <div className="flex items-center gap-2 p-1 rounded-full bg-[#F5F0EB] mb-7">
        <button
          type="button"
          onClick={() => switchSpace("family")}
          className={`flex-1 h-11 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
            !isSchool ? "bg-white text-[#1C1C3A] shadow-sm" : "text-[#7A6A5E]"
          }`}
        >
          {lang === "fr" ? "Espace parent" : "Parent space"}
        </button>
        <button
          type="button"
          onClick={() => switchSpace("school")}
          className={`flex-1 h-11 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
            isSchool ? "bg-white text-[#1C1C3A] shadow-sm" : "text-[#7A6A5E]"
          }`}
        >
          {lang === "fr" ? "Espace école" : "School space"}
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-[40px] font-extrabold text-[#1C1C3A] leading-tight mb-2.5 font-sans">
          {lang === "fr" ? "Se connecter" : "Sign In"}
        </h2>
        <p className="text-sm font-semibold text-[#64748B] leading-relaxed">
          {isSchool
            ? lang === "fr"
              ? "Bon retour ! Connectez-vous à l'espace enseignant de votre école."
              : "Welcome back! Log in to your school teacher space."
            : lang === "fr"
              ? "Ravi de vous revoir ! Connectez-vous pour gérer l'espace de votre enfant."
              : "Nice to see you again! Log in to manage your child's space."}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 mb-6">
        <SocialButton
          provider="google"
          label={lang === "fr" ? "Continuer avec Google" : "Continue with Google"}
          onClick={() => handleSocialLogin("google")}
        />
        <SocialButton
          provider="facebook"
          label={lang === "fr" ? "Continuer avec Facebook" : "Continue with Facebook"}
          onClick={() => handleSocialLogin("facebook")}
        />
      </div>

      <Divider label={lang === "fr" ? "ou" : "or"} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5.5 mt-5">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
            {submitError}
          </div>
        )}

        <InputField
          id="email-input"
          label={lang === "fr" ? "E-mail" : "Email"}
          type="email"
          icon={Mail}
          placeholder={lang === "fr" ? "parents@exemple.com" : "parents@example.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationErrors.email}
          disabled={isLoading}
          required
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            id="password-input"
            label={lang === "fr" ? "Mot de passe" : "Password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={validationErrors.password}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <RememberMe
            id="remember-me-checkbox"
            checked={rememberMe}
            onChange={setRememberMe}
            label={lang === "fr" ? "Se souvenir de moi" : "Remember me"}
          />
          <ForgotPasswordLink
            label={lang === "fr" ? "Mot de passe oublié ?" : "Forgot password?"}
            href="#"
          />
        </div>

        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          className={`mt-4 ${isSchool ? "!bg-[#1D9E75] !border-[#1D9E75] shadow-[0_4px_12px_rgba(29,158,117,0.15)] hover:shadow-[0_6px_20px_rgba(29,158,117,0.25)] focus:ring-[#1D9E75]/50" : ""}`}
        >
          {lang === "fr" ? "Se connecter" : "Sign In"}
        </PrimaryButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 w-full text-[#B7A99A] text-xs font-bold">
          <span className="h-px flex-1 bg-[#EFE7DB]" />
          {lang === "fr" ? "ou" : "or"}
          <span className="h-px flex-1 bg-[#EFE7DB]" />
        </div>

        <p className="text-center text-xs text-[#64748B] font-semibold">
          {lang === "fr"
            ? "Vous êtes un élève ? Utilisez votre code de classe."
            : "You are a student? Use your class code."}
        </p>

        <button
          type="button"
          onClick={() => router.push("/school")}
          className="w-full h-11 md:h-14 rounded-full bg-transparent border-2 border-[#E8E8EF] hover:border-[#7D6AF8] text-[#1C1C3A] font-bold text-sm md:text-base transition-colors cursor-pointer"
        >
          {lang === "fr" ? "Connexion élève (code de classe) →" : "Student login (class code) →"}
        </button>
      </div>

      <div className="mt-8 text-center text-sm font-semibold text-[#64748B]">
        <span>{lang === "fr" ? "Vous n'avez pas de compte ? " : "Don't have an account? "}</span>
        <button
          onClick={() => router.push(signupHref)}
          className="text-[#6D4CFF] hover:text-[#5A3EE0] font-extrabold hover:underline cursor-pointer"
        >
          {lang === "fr" ? "S'inscrire" : "Sign Up"}
        </button>
      </div>

      <NeedHelpLink />
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </AuthLayout>
  )
}
