"use client"

import Image from "next/image"
import { Sparkles, Star } from "lucide-react"

interface StoriesHeroProps {
  onCreateClick?: () => void
}

export function StoriesHero({ onCreateClick }: StoriesHeroProps) {
  return (
    <section className="relative w-full rounded-[28px] md:rounded-[36px] bg-gradient-to-br from-[#FFF5DD] via-[#FFF0CE] to-[#FFE7B8] p-6 sm:p-8 md:p-10 overflow-hidden border border-[#F4E8D0] shadow-xs select-none">
      {/* Subtle Background Decorative Shapes */}
      <div className="absolute top-6 left-12 w-24 h-24 bg-[#FFDE8A]/20 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-4 right-1/3 w-36 h-36 bg-[#FFB300]/15 rounded-full blur-2xl pointer-events-none" />
      
      {/* Decorative Floating Sparkles */}
      <span className="absolute top-8 right-12 text-[#FFAE33] text-xl opacity-70 animate-bounce hidden sm:inline">✦</span>
      <span className="absolute top-1/2 left-8 text-[#FF6F91] text-sm opacity-60 hidden md:inline">♥</span>
      <span className="absolute bottom-8 left-1/4 text-[#7D6AF8] text-base opacity-70 hidden md:inline">★</span>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Text & CTA Content */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFD747] text-[#3B2416] text-xs md:text-sm font-extrabold shadow-2xs mb-4">
            <Star className="w-3.5 h-3.5 fill-[#3B2416]" />
            <span>Histoires</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-[#3B2416] leading-[1.18] tracking-tight">
            Des histoires uniques pour imaginer, apprendre et grandir !
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#684C38] font-semibold mt-3 sm:mt-4 leading-relaxed max-w-xl">
            Crée des histoires personnalisées avec l&apos;IA et découvre l&apos;Afrique à travers les yeux de ton héros préféré.
          </p>

          {/* CTA Button */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateClick}
              type="button"
              className="group relative inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#6852F6] hover:from-[#6D58F7] hover:to-[#573EF4] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-white/30 text-white transition-transform duration-300 group-hover:rotate-12" />
              <span>Créer mon histoire</span>
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] aspect-[475/350] drop-shadow-md">
            <Image
              src="/illustrations/histoires/hero-moussa.webp"
              alt="Moussa découvrant des histoires magiques"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 440px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
