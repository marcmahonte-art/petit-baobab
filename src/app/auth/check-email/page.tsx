"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Mail } from "lucide-react"

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white px-8 py-12 md:p-12 md:shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:rounded-[32px] border border-gray-100/50 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-purple-50 border-2 border-[#6D4CFF] rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-[#6D4CFF]" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#1C1C3A] leading-tight mb-4">
          Vérifiez votre boîte mail
        </h1>

        <p className="text-sm font-semibold text-[#64748B] leading-relaxed mb-2">
          Un email de confirmation vous a été envoyé à l'adresse :
        </p>
        <p className="text-base font-bold text-[#1C1C3A] mb-6">
          {email || "votre adresse email"}
        </p>

        <p className="text-sm text-[#94A3B8] leading-relaxed">
          Cliquez sur le lien dans l&apos;email pour activer votre compte et accéder à l&apos;application.
        </p>

        <p className="text-xs text-[#94A3B8] mt-8">
          Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams ou réessayez l&apos;inscription.
        </p>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  )
}
