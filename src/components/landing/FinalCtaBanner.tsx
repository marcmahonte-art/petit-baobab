"use client"

import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { useAuthStore } from "@/lib/auth-store"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function FinalCtaBanner() {
  const router = useRouter()
  const { lang } = useI18n()
  const { user } = useAuthStore()

  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 mb-20">
      <div className="bg-[#7D6AF8] rounded-3xl p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden relative">
        {/* Left column */}
        <div className="z-10">
          <h2 className="text-headline-lg lg:text-display-md font-extrabold text-white leading-tight">
            {lang === "fr"
              ? "Prêt à éveiller la créativité"
              : "Ready to awaken the creativity"}
            <br />
            {lang === "fr" ? "de votre enfant ?" : "of your child?"}
          </h2>
          <p className="text-body-md text-white/85 mt-3">
            {lang === "fr"
              ? "Rejoignez des milliers de familles qui font déjà confiance à Petit Baobab."
              : "Join thousands of families who already trust Petit Baobab."}
          </p>

          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <Button
              onClick={() =>
                user
                  ? router.push("/dashboard")
                  : router.push("/login?tab=signup")
              }
              className="h-[52px] px-7 bg-white text-[#7D6AF8] font-bold rounded-full hover:bg-white/90 transition-colors cursor-pointer"
            >
              {lang === "fr"
                ? "Commencer gratuitement"
                : "Start Free"}
            </Button>
            <span className="text-white/80 text-[14px] font-medium">
              {lang === "fr"
                ? "Aucune carte bancaire requise"
                : "No credit card required"}
            </span>
          </div>
        </div>

        {/* Right column - illustration */}
        <div className="relative h-[280px] z-10">
          <div className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
            <Image
              src="/illustrations/enfant-Crayons de couleur.webp"
              alt="Enfant dessinant"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 z-0" />
      </div>
    </section>
  )
}
