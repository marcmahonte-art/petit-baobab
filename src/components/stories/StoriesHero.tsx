"use client"

import Image from "next/image"
import { Sparkles, Star } from "lucide-react"

interface StoriesHeroProps {
  onCreateClick?: () => void
}

export function StoriesHero({ onCreateClick }: StoriesHeroProps) {
  return (
    <section className="relative w-full rounded-[28px] md:rounded-[36px] bg-[#FFF9EA] border border-[#F4EAD4] p-6 sm:p-8 md:p-9 lg:pb-0 overflow-hidden shadow-2xs select-none">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Text & CTA Content */}
        <div className="lg:col-span-7 flex flex-col items-start lg:py-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFD84D] text-[#3B2416] text-xs md:text-sm font-extrabold shadow-2xs mb-4">
            <Star className="w-3.5 h-3.5 fill-[#3B2416]" />
            <span>Histoires</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-black text-[#3B2416] leading-[1.18] tracking-tight">
            Des histoires uniques pour imaginer, apprendre et grandir !
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-[15px] text-[#6B5645] font-semibold mt-3 sm:mt-4 leading-relaxed max-w-xl">
            Crée des histoires personnalisées avec l&apos;IA et découvre l&apos;Afrique à travers les yeux de ton héros préféré.
          </p>

          {/* CTA Button */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateClick}
              type="button"
              className="group relative inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#7D6AF8] hover:bg-[#6852F6] text-white font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-white/30 text-white transition-transform duration-300 group-hover:rotate-12" />
              <span>Créer mon histoire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Illustration: Moussa reading open book under baobab.
           Le conteneur porte TOUJOURS le ratio de l'image (514/361) : c'est ce qui
           garantit qu'aucun bord de l'illustration n'est rogné.

           Mobile / tablette : dans le flux, sous le texte, largeur plafonnée.
           Desktop (lg+) : en absolu, ancrée en bas à droite, hauteur = toute la
           hauteur du Hero (donc plus de bande vide au-dessus) ; la largeur en
           découle par le ratio. Le Hero la clippe proprement (overflow-hidden).
           `lg:max-w-none` est indispensable : sans lui, `sm:max-w-[420px]`
           continue de plafonner la largeur en desktop. */}
      <div className="relative mt-6 lg:mt-0 mx-auto w-full max-w-[360px] sm:max-w-[420px] aspect-[514/361] lg:absolute lg:right-0 lg:bottom-0 lg:mx-0 lg:h-full lg:w-auto lg:max-w-none">
        <Image
          src="/illustrations/histoires/hero-moussa.png"
          alt="Moussa découvrant des histoires magiques"
          fill
          priority
          sizes="(max-width: 1023px) 420px, 620px"
          className="object-cover object-right-bottom"
        />
      </div>
    </section>
  )
}
