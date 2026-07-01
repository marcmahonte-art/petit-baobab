"use client"

import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { useAuthStore } from "@/lib/auth-store"
import { Star } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function CreateBookBanner() {
  const router = useRouter()
  const { lang } = useI18n()
  const { user } = useAuthStore()

  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 my-16">
      <div className="bg-[#FFD95C]/15 rounded-3xl p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.2fr] gap-8 items-center overflow-hidden relative">
        {/* Left - children illustration */}
        <div className="relative z-10">
          <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
            <Image
              src="/illustrations/Deux enfants lisant ensemble.webp"
              alt="Enfants lisant"
              fill
              className="object-cover"
            />
          </div>
          {/* Decorative foliage */}
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#20C997]/20 to-transparent z-0" />
        </div>

        {/* Center - text */}
        <div className="z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-[#FFD95C]/20 flex items-center justify-center">
              <Star className="w-3 h-3 fill-[#FFD95C] text-[#FFD95C]" />
            </span>
            <span className="text-[14px] font-semibold text-[#1A1A2E]">
              {lang === "fr" ? "NOUVEAU" : "NEW"}
            </span>
          </div>
          <h2 className="text-headline-lg font-extrabold text-[#1A1A2E] leading-tight">
            {lang === "fr" ? "Crée ton propre livre" : "Create your own"}{" "}
            <br />
            {lang === "fr" ? "de coloriage" : "coloring book"}
          </h2>
          <p className="text-body-md text-[#6B6B7B] mt-3">
            {lang === "fr"
              ? "Un livre unique, à ton image. Parfait pour s'amuser, apprendre et offrir !"
              : "A unique book, just like you. Perfect for fun, learning, and gifting!"}
          </p>
          <Button
            onClick={() =>
              router.push(user ? "/livres-de-coloriage" : "/login?tab=signup")
            }
            className="h-12 px-7 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold rounded-full mt-6 cursor-pointer"
          >
            {lang === "fr" ? "Créer mon livre" : "Create my book"}
          </Button>
        </div>

        {/* Right - 3 book covers in fan layout */}
        <div className="relative flex items-center justify-center h-[220px] z-10">
          {/* Book 1 */}
          <div className="absolute left-0 w-[140px] h-[180px] rounded-xl shadow-hover overflow-hidden rotate-[-6deg] bg-[#FFF5E0] border border-[#F0E7DA] z-0">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <p className="text-[10px] font-bold text-center text-[#8B5A2B]">
                  Les animaux de la savane
                </p>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB300]" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FFB300]" />
            </div>
          </div>

          {/* Book 2 (center, elevated) */}
          <div className="relative w-[150px] h-[195px] rounded-xl shadow-hover overflow-hidden bg-[#7D6AF8]/10 border-2 border-[#7D6AF8] z-10 -mx-4">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <p className="text-[10px] font-bold text-center text-[#7D6AF8]">
                  Mon livre de coloriage
                </p>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#7D6AF8]" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#7D6AF8]" />
            </div>
          </div>

          {/* Book 3 */}
          <div className="absolute right-0 w-[140px] h-[180px] rounded-xl shadow-hover overflow-hidden rotate-[6deg] bg-[#E8FFF0] border border-[#F0E7DA] z-0">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <p className="text-[10px] font-bold text-center text-[#20C997]">
                  Les instruments africains
                </p>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#20C997]" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#20C997]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
