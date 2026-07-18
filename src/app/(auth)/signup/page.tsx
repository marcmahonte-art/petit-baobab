"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useI18n } from "@/lib/i18n-provider"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import { Mail, CheckCircle2 } from "lucide-react"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { InputField } from "@/components/auth/InputField"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { PrimaryButton } from "@/components/auth/PrimaryButton"
import { Divider } from "@/components/auth/Divider"
import { SocialButton } from "@/components/auth/SocialButton"
import { NeedHelpLink } from "@/components/auth/NeedHelpLink"

function SignupFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useI18n()
  const { signup, isLoading } = useAuthStore()

  // Espace ciblé : family (parent) ou school (enseignant). Par défaut family.
  const spaceParam = searchParams.get("space")
  const [accountType, setAccountType] = useState<"family" | "school">(
    spaceParam === "school" ? "school" : "family"
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ageConsent, setAgeConsent] = useState(false)

  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    ageConsent?: string
  }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Read redirect error parameters if any
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      if (errorParam === "exchange_failed" || errorParam === "callback_error") {
        setSubmitError(
          lang === "fr"
            ? "L'inscription avec Google a échoué. Veuillez réessayer."
            : "Google signup failed. Please try again."
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

  const switchType = (next: "family" | "school") => {
    setAccountType(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("space", next)
    router.replace(`/signup?${params.toString()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    setSubmitError(null)

    const errors: typeof validationErrors = {}

    // Validation checks
    if (!email.trim()) {
      errors.email = lang === "fr" ? "L'adresse e-mail est requise." : "Email address is required."
    } else if (!email.includes("@")) {
      errors.email = lang === "fr" ? "Veuillez saisir une adresse e-mail valide." : "Please enter a valid email address."
    }

    if (!password) {
      errors.password = lang === "fr" ? "Le mot de passe est requis." : "Password is required."
    } else if (password.length < 8) {
      errors.password =
        lang === "fr"
          ? "Le mot de passe doit comporter au moins 8 caractères."
          : "Password must be at least 8 characters long."
    }

    if (password !== confirmPassword) {
      errors.confirmPassword =
        lang === "fr" ? "Les mots de passe ne correspondent pas." : "Passwords do not match."
    }

    if (!ageConsent) {
      errors.ageConsent =
        lang === "fr"
          ? "Vous devez cocher cette case pour valider votre inscription."
          : "You must check this box to complete your registration."
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Call store signup
    const result = await signup(email, password, ageConsent, accountType)
    if (result.success) {
      setSuccessMessage(
        result.message ||
          (lang === "fr"
            ? "Compte créé ! Un e-mail de confirmation vous a été envoyé."
            : "Account created! A confirmation email has been sent to you.")
      )
      setIsSuccess(true)
    } else {
      setSubmitError(
        result.error ||
          (lang === "fr"
            ? "Une erreur est survenue lors de l'inscription."
            : "An error occurred during registration.")
      )
    }
  }

  const handleSocialLogin = async (provider: "google" | "apple" | "facebook") => {
    if (provider !== "google" && provider !== "facebook") {
      alert(lang === "fr" ? "Inscription sociale bientôt disponible !" : "Social signup coming soon!")
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
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
            ? "Une erreur est survenue lors de l'inscription."
            : "An error occurred during registration.")
      )
    }
  }

  const isSchool = accountType === "school"

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white px-6 py-8 md:p-12 md:shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:rounded-[32px] border border-gray-100/50 text-center flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-green-50 border-2 border-green-500 rounded-full flex items-center justify-center mb-6 text-green-500 select-none">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-3xl font-extrabold text-[#1C1C3A] leading-tight mb-4">
          {lang === "fr" ? "Vérifiez votre boîte mail !" : "Check your mailbox!"}
        </h2>
        <p className="text-sm font-semibold text-[#64748B] leading-relaxed mb-8">
          {successMessage}
        </p>

        <PrimaryButton
          onClick={() =>
            router.push(`/login?space=${accountType}${accountType === "school" ? "&school_signup=1" : ""}`)
          }
        >
          {lang === "fr" ? "Retour à la connexion" : "Back to Sign In"}
        </PrimaryButton>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full bg-white px-6 py-8 md:p-12 md:shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:rounded-[32px] border border-gray-100/50"
    >
      {/* Sélecteur de type de compte : Parent / École */}
      <div className="flex items-center gap-2 p-1 rounded-full bg-[#F5F0EB] mb-7">
        <button
          type="button"
          onClick={() => switchType("family")}
          className={`flex-1 h-11 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
            !isSchool ? "bg-white text-[#1C1C3A] shadow-sm" : "text-[#7A6A5E]"
          }`}
        >
          {lang === "fr" ? "Parent" : "Parent"}
        </button>
        <button
          type="button"
          onClick={() => switchType("school")}
          className={`flex-1 h-11 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
            isSchool ? "bg-white text-[#1C1C3A] shadow-sm" : "text-[#7A6A5E]"
          }`}
        >
          {lang === "fr" ? "École / Enseignant" : "School / Teacher"}
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-[40px] font-extrabold text-[#1C1C3A] leading-tight mb-2.5 font-sans">
          {lang === "fr" ? "Créer un compte" : "Create Account"}
        </h2>
        <p className="text-sm font-semibold text-[#64748B] leading-relaxed">
          {isSchool
            ? lang === "fr"
              ? "Créez le compte de votre école pour gérer vos classes et vos élèves."
              : "Create your school account to manage classes and students."
            : lang === "fr"
              ? "Rejoignez-nous pour offrir un univers créatif et éducatif à votre enfant."
              : "Join us to offer a creative and educational universe to your child."}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 mb-6">
        <SocialButton
          provider="google"
          label={lang === "fr" ? "S'inscrire avec Google" : "Sign up with Google"}
          onClick={() => handleSocialLogin("google")}
        />
        <SocialButton
          provider="facebook"
          label={lang === "fr" ? "S'inscrire avec Facebook" : "Sign up with Facebook"}
          onClick={() => handleSocialLogin("facebook")}
        />
      </div>

      <Divider label={lang === "fr" ? "ou" : "or"} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
            {submitError}
          </div>
        )}

        <InputField
          id="email-signup-input"
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

        <PasswordInput
          id="password-signup-input"
          label={lang === "fr" ? "Mot de passe" : "Password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
          disabled={isLoading}
          required
        />

        <PasswordInput
          id="confirm-password-input"
          label={lang === "fr" ? "Confirmer le mot de passe" : "Confirm Password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={validationErrors.confirmPassword}
          disabled={isLoading}
          required
        />

        {/* Age Consent Checkbox */}
        <div className="flex flex-col gap-1.5 mt-1 select-none">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              id="age-consent-checkbox"
              type="checkbox"
              checked={ageConsent}
              onChange={(e) => setAgeConsent(e.target.checked)}
              className="mt-1 w-4.5 h-4.5 rounded border-2 border-[#E8E8EF] text-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 accent-[#6D4CFF] cursor-pointer transition-all"
            />
            <span className="text-sm font-semibold text-[#64748B] group-hover:text-[#1C1C3A] leading-snug transition-colors">
              {lang === "fr"
                ? "Je certifie être majeur(e) (parent ou tuteur légal) et j'accepte les conditions d'utilisation."
                : "I certify that I am of legal age (parent or legal guardian) and I accept the terms of use."}
            </span>
          </label>
          {validationErrors.ageConsent && (
            <span className="text-xs font-bold text-red-500 mt-1 select-none leading-none pl-7.5">
              {validationErrors.ageConsent}
            </span>
          )}
        </div>

        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          className={`mt-4 ${isSchool ? "!bg-[#1D9E75] !border-[#1D9E75] shadow-[0_4px_12px_rgba(29,158,117,0.15)] hover:shadow-[0_6px_20px_rgba(29,158,117,0.25)] focus:ring-[#1D9E75]/50" : ""}`}
        >
          {lang === "fr" ? "S'inscrire" : "Sign Up"}
        </PrimaryButton>
      </form>

      <div className="mt-8 text-center text-sm font-semibold text-[#64748B]">
        <span>{lang === "fr" ? "Vous avez déjà un compte ? " : "Already have an account? "}</span>
        <button
          onClick={() => router.push(`/login?space=${accountType}`)}
          className="text-[#6D4CFF] hover:text-[#5A3EE0] font-extrabold hover:underline cursor-pointer"
        >
          {lang === "fr" ? "Se connecter" : "Sign In"}
          </button>
        </div>

        <NeedHelpLink />
    </motion.div>
  )
}

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SignupFormContent />
      </Suspense>
    </AuthLayout>
  )
}
