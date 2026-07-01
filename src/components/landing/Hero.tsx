"use client"

import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { useAuthStore } from "@/lib/auth-store"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Ban,
  Award,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const router = useRouter()
  const { lang } = useI18n()
  const { user } = useAuthStore()

  return (
    <section
      id="hero"
      className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24 relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div>
          <h1 className="text-[36px] lg:text-display-lg font-extrabold leading-tight">
            <span className="text-[#1A1A2E]">Le coloriage</span>
            <br />
            <span className="text-[#1A1A2E]">qui éveille la </span>
            <span className="text-[#7D6AF8]">créativité</span>
            <br />
            <span className="text-[#1A1A2E]">et célèbre </span>
            <span className="text-[#20C997]">l&apos;Afrique</span>
          </h1>

          <p className="text-body-lg text-[#6B6B7B] max-w-[480px] mt-6">
            Des milliers de dessins africains, des histoires captivantes et des
            outils intelligents pour apprendre en s&apos;amusant.
          </p>

          <div className="flex gap-4 mt-8 flex-wrap">
            {user ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-14 px-8 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-[16px] rounded-full shadow-hover hover:scale-[1.03] transition-all duration-200 cursor-pointer"
              >
                <span>
                  {lang === "fr" ? "Accéder à mon espace" : "Access My Space"}
                </span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/login?tab=signup")}
                  className="h-14 px-8 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-[16px] rounded-full shadow-hover hover:scale-[1.03] transition-all duration-200 cursor-pointer"
                >
                  {lang === "fr" ? "Commencer gratuitement" : "Start Free"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="h-14 px-8 bg-white text-[#1A1A2E] font-bold text-[16px] rounded-full border border-[#E5E0D5] hover:bg-[#FFF9F2] transition-colors cursor-pointer flex items-center gap-3"
                >
                  <span className="w-7 h-7 rounded-full bg-[#7D6AF8]/10 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-[#7D6AF8] text-[#7D6AF8]" />
                  </span>
                  {lang === "fr"
                    ? "Découvrir Petit Baobab"
                    : "Discover Petit Baobab"}
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-6 mt-10 flex-wrap">
            <span className="flex items-center gap-2 text-[14px] font-semibold text-[#6B6B7B]">
              <span className="w-8 h-8 rounded-full bg-[#20C997]/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#20C997]" />
              </span>
              100% sécurisé
            </span>
            <span className="flex items-center gap-2 text-[14px] font-semibold text-[#6B6B7B]">
              <span className="w-8 h-8 rounded-full bg-[#FF5E5E]/10 flex items-center justify-center">
                <Ban className="w-4 h-4 text-[#FF5E5E]" />
              </span>
              Sans publicité
            </span>
            <span className="flex items-center gap-2 text-[14px] font-semibold text-[#6B6B7B]">
              <span className="w-8 h-8 rounded-full bg-[#FFD95C]/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-[#FFD95C]" />
              </span>
              Approuvé par les parents
            </span>
          </div>
        </div>

        {/* Right Column - Illustration */}
        <div className="relative h-[480px] lg:h-[560px]">
          {/* Decorative blob background */}
          <div className="absolute inset-0 z-0">
            <div className="w-[400px] h-[400px] rounded-full bg-[#FFD95C]/20 absolute top-0 right-0 blur-3xl" />
            <div className="w-[300px] h-[300px] rounded-full bg-[#7D6AF8]/10 absolute bottom-0 left-0 blur-3xl" />
          </div>

          {/* Animated illustration group */}
          <motion.div
            className="relative w-full h-full z-10"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Main child illustration */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#FFD95C]/30 border-2 border-[#E5E0D5]">
                <Image
                  src="/illustrations/enfant-Crayons de couleur.webp"
                  alt="Enfant créatif"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* African hut + baobab */}
            <div className="absolute top-8 right-0 w-[35%] h-[30%] z-10">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#FFB300]/20 border border-[#E5E0D5]">
                <Image
                  src="/illustrations/Petite fille tenant un crayon-village-girafe.webp"
                  alt="Village africain"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Open book (centerpiece) */}
            <div className="absolute bottom-0 left-0 w-[85%] h-[45%] z-20">
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-hover bg-white border-2 border-[#E5E0D5]">
                <Image
                  src="/illustrations/Deux enfants lisant ensemble.webp"
                  alt="Livre ouvert"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Pencil pot */}
            <div className="absolute bottom-0 right-0 w-[18%] h-[25%] z-20">
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#7D6AF8]/20 border border-[#E5E0D5]">
                <Image
                  src="/illustrations/crayons.webp"
                  alt="Crayons de couleur"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
