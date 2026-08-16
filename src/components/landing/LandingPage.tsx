"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { Header } from "@/components/landing/Header"
import MainFooter from "@/components/landing/MainFooter"
import { Star } from "lucide-react"
import { getHomeRedirect } from "@/lib/admin/client-guard"

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const { user, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleCTA = () => {
    if (user) {
      router.push(getHomeRedirect())
    } else {
      router.push("/signup")
    }
  }

  const handleLogin = () => {
    if (user) {
      router.push(getHomeRedirect())
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="bg-[#fef5e0] font-sans text-[#1F2937] antialiased overflow-x-hidden min-h-screen">
      <Header />

      {/* BEGIN: HeroSection */}
      <section className="relative mt-[15px] pt-6 md:pt-8 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6">
              Chaque <span className="text-[#ff6aab]">enfant</span> a un monde à faire <span className="text-[#1ecc9c]">grandir</span>.
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg">
              Des coloriages, des histoires et des livres personnalisés pour apprendre en s'amusant.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={handleCTA}
                className="px-8 py-4 bg-[#6D4CFF] text-white font-bold rounded-[8px] hover:scale-105 transition-transform shadow-lg shadow-[#6D4CFF]/30 cursor-pointer"
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-800 font-bold rounded-[8px] flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 bg-[#6D4CFF] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Découvrir Petit Baobab
              </button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                100% sécurisé
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Sans publicité
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                Approuvé par les parents
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Main Hero Illustration */}
            <img
              alt="Enfant coloriant un livre"
              className="relative z-10 w-full md:scale-110 lg:scale-120 xl:scale-125 origin-center transition-transform duration-300 drop-shadow-2xl rounded-[24px]"
              src="/illustrations/awa-village-girafe.webp"
            />
            {/* Background Elements (Simulated) */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#6D4CFF]/10 rounded-full blur-3xl opacity-50 -z-10"></div>
          </div>

        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: FeaturesGrid */}
      <section id="features" className="py-16 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <img
                  alt="Coloriages uniques"
                  className="w-24 h-24 object-contain"
                  src="/illustrations/Coloriages%20uniques.svg"
                />
              </div>
              <h3 className="font-bold text-sm mb-2">Coloriages uniques</h3>
              <p className="text-xs text-gray-500">Des centaines de dessins inspirés de l'Afrique.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <img
                  alt="Dessin magique"
                  className="w-24 h-24 object-contain"
                  src="/illustrations/Dessin%20magique.svg"
                />
              </div>
              <h3 className="font-bold text-sm mb-2 text-[#22C55E]">Dessin magique</h3>
              <p className="text-xs text-gray-500">Transforme tes idées en coloriages.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <img
                  alt="Livres personnalisés"
                  className="w-24 h-24 object-contain"
                  src="/illustrations/Livres%20personnalis%C3%A9s.svg"
                />
              </div>
              <h3 className="font-bold text-sm mb-2">Livres personnalisés</h3>
              <p className="text-xs text-gray-500">Crée ton propre livre de coloriage.</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <img
                  alt="Jeux éducatifs"
                  className="w-24 h-24 object-contain"
                  src="/illustrations/Jeux%20%C3%A9ducatifs.svg"
                />
              </div>
              <h3 className="font-bold text-sm mb-2">Jeux éducatifs</h3>
              <p className="text-xs text-gray-500">Apprends en jouant avec des jeux amusants.</p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-32 h-32 bg-pink-100 text-pink-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <img
                  alt="Histoires captivantes"
                  className="w-24 h-24 object-contain"
                  src="/illustrations/Histoires%20captivantes.svg"
                />
              </div>
              <h3 className="font-bold text-sm mb-2">Histoires captivantes</h3>
              <p className="text-xs text-gray-500">Lis des histoires qui éveillent l'imagination.</p>
            </div>

          </div>
        </div>
      </section>
      {/* END: FeaturesGrid */}

      {/* BEGIN: HowItWorks */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">Comment ça marche ?</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 w-8 h-8 bg-[#6D4CFF]/20 text-[#6D4CFF] font-bold rounded-full flex items-center justify-center text-xs">1</div>
            <div className="h-56 flex items-center justify-center mb-6">
              <img
                alt="Step 1"
                className="w-full h-full object-contain"
                src="/illustrations/Choisis.webp"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">Choisis</h3>
            <p className="text-sm text-gray-500">Parmi des centaines de dessins.</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:block">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 w-8 h-8 bg-[#22C55E]/20 text-[#22C55E] font-bold rounded-full flex items-center justify-center text-xs">2</div>
            <div className="h-56 flex items-center justify-center mb-6">
              <img
                alt="Step 2"
                className="w-full h-full object-contain"
                src="/illustrations/Personnalise.webp"
              />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[#22C55E]">Personnalise</h3>
            <p className="text-sm text-gray-500">Ton livre avec tes couleurs et ton style.</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:block">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 w-8 h-8 bg-orange-100 text-orange-600 font-bold rounded-full flex items-center justify-center text-xs">3</div>
            <div className="h-56 flex items-center justify-center mb-6">
              <img
                alt="Step 3"
                className="w-full h-full object-contain"
                src="/illustrations/Aper%C3%A7ois.webp"
              />
            </div>
            <h3 className="font-bold text-lg mb-2 text-orange-600">Aperçois</h3>
            <p className="text-sm text-gray-500">Ton livre avant de le télécharger.</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:block">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-xs">4</div>
            <div className="h-56 flex items-center justify-center mb-6">
              <img
                alt="Step 4"
                className="w-full h-full object-contain"
                src="/illustrations/T%C3%A9l%C3%A9charge.webp"
              />
            </div>
            <h3 className="font-bold text-lg mb-2">Télécharge</h3>
            <p className="text-sm text-gray-500">Ton livre ou demande une impression.</p>
          </div>

        </div>
      </section>
      {/* END: HowItWorks */}

      {/* BEGIN: Pricing teaser */}
      <section id="pricing" className="py-12 px-6">
        <div className="max-w-7xl mx-auto bg-amber-50 rounded-[40px] p-8 md:p-12 overflow-hidden border border-amber-100 shadow-xl shadow-amber-900/5">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-2/3 text-center md:text-left">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <Star className="w-6 h-6 text-[#FFB300] fill-[#FFB300]" />
                <h2 className="text-3xl font-extrabold">Des formules pour toutes les créations</h2>
              </div>
              <p className="text-gray-600 mb-8">
                Découverte, Super Baobab ou Espace École — trouvez le plan qui vous convient et commencez à créer dès aujourd'hui.
              </p>
              <button
                onClick={() => router.push("/tarification")}
                className="px-8 py-3 bg-[#6D4CFF] text-white font-bold rounded-[8px] hover:scale-105 transition-transform cursor-pointer"
              >
                Voir tous les tarifs
              </button>
            </div>

            <div className="md:w-1/3 flex justify-center items-center">
              <img
                alt="Illustration tarifs"
                className="w-full max-w-[320px] md:max-w-[380px] drop-shadow-xl object-contain"
                src="/illustrations/pricing_illustration.webp"
              />
            </div>
          </div>
        </div>
      </section>
      {/* END: Pricing teaser */}

      {/* BEGIN: Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-16">Ils adorent Petit Baobab</h2>
          <div className="relative px-12">
            
            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    alt="Aminata"
                    className="w-12 h-12 rounded-full border-2 border-[#6D4CFF]/20 object-cover"
                    src="/illustrations/aminata-maman.png"
                  />
                  <div>
                    <h4 className="font-bold text-sm">Aminata, maman</h4>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"Mon fils adore créer ses propres livres. Les dessins sont magnifiques et éducatifs."</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    alt="Yacouba"
                    className="w-12 h-12 rounded-full border-2 border-[#6D4CFF]/20 object-cover"
                    src="/illustrations/yacouba-enseignant.png"
                  />
                  <div>
                    <h4 className="font-bold text-sm">Yacouba, enseignant</h4>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"Parfait pour mes élèves ! Les histoires et activités sont très enrichissantes."</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    alt="Fatou"
                    className="w-12 h-12 rounded-full border-2 border-[#6D4CFF]/20 object-cover"
                    src="/illustrations/fatou-maman.png"
                  />
                  <div>
                    <h4 className="font-bold text-sm">Fatou, maman</h4>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"Enfin une application africaine qui valorise notre culture."</p>
              </div>

            </div>
          </div>
        </div>
      </section>
      {/* END: Testimonials */}

      {/* BEGIN: FooterCTA */}
      <section className="px-6 pb-24 pt-12">
        <div className="max-w-7xl mx-auto bg-[#6D4CFF] rounded-[32px] p-8 md:p-12 text-white relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Left Column (40%): Title and Subtitle */}
          <div className="relative z-10 md:w-[40%] text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Prêt à éveiller la créativité<br className="hidden md:inline"/> de votre enfant ?</h2>
            <p className="text-indigo-100 text-sm opacity-80">Rejoignez des milliers de familles<br className="hidden md:inline"/> qui font déjà confiance à Petit Baobab.</p>
          </div>

          {/* Center Column (20%): Centered CTA button */}
          <div className="relative z-10 md:w-[20%] flex flex-col items-center justify-center gap-2">
            <button
              onClick={handleCTA}
              className="px-8 py-3.5 bg-white text-[#6D4CFF] font-bold rounded-[32px] hover:scale-105 transition-all shadow-xl shadow-black/20 cursor-pointer text-sm w-full md:w-auto text-center whitespace-nowrap"
            >
              Commencer gratuitement
            </button>
            <p className="text-[10px] text-white/70 whitespace-nowrap">Aucune carte bancaire requise</p>
          </div>

          {/* Right Column (40%): Reserves space and holds the absolute overflowing image (3.3x scaled) */}
          <div className="relative md:w-[40%] self-stretch min-h-[160px] md:min-h-0">
            <div className="absolute bottom-0 right-0 md:-right-8 lg:-right-10 w-[280px] md:w-[480px] lg:w-[560px] translate-y-12 md:translate-y-20 z-20 pointer-events-none select-none">
              <img
                alt="Enfant qui dessine"
                className="w-full h-auto drop-shadow-2xl"
                src="/illustrations/enfant-Crayons%20de%20couleur.webp"
              />
            </div>
          </div>

          {/* Background Graphic Overlay */}
          <div className="absolute inset-0 rounded-[32px] overflow-hidden bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none -z-10"></div>

        </div>
      </section>
      {/* END: FooterCTA */}

      <MainFooter />

    </div>
  )
}
