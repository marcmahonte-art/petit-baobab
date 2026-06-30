"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const { user, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleCTA = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login?tab=signup")
    }
  }

  const handleLogin = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="bg-[#FBFAEE] font-sans text-[#1F2937] antialiased overflow-x-hidden min-h-screen">
      
      {/* BEGIN: MainHeader */}
      <header className="sticky top-0 z-50 bg-[#FBFAEE]/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                alt="Logo"
                className="rounded-full object-cover w-10 h-10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAussE8J8ZBIYh6OwfjqfgQBnR6gZYCpR7h7CwjOPVyvcYm7xZSdjd4TlnDmKoQMvZIfrfkGa1DS8yUZ9roeQviPluoFTmVPOFkA63JLx8WXWG4nOu0GUssrqP3k_PFchvhg12KznQDaOxCp_uwJGn8hinH_CPAQPG80pIX2ZE4mBpzHsbZfXC7IlZh3CDIF91xEV1VzJ5SXA6bDY8UI0uX9jVfd1gNL8OnvZvWKLNwZmFfaf9P-1tYsf89GSQrh3ft3bPYN5eeuwLG"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-2xl font-extrabold text-[#635BFF]">Petit Baobab</span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">Apprendre, créer, grandir !</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a className="hover:text-[#635BFF] transition-colors" href="#">Accueil</a>
            <a className="hover:text-[#635BFF] transition-colors" href="#features">Fonctionnalités</a>
            <div className="relative group cursor-pointer">
              <span className="flex items-center gap-1 hover:text-[#635BFF] transition-colors">
                Livres 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </span>
            </div>
            <a className="hover:text-[#635BFF] transition-colors" href="#pricing">Tarifs</a>
            <a className="hover:text-[#635BFF] transition-colors" href="#testimonials">À propos</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="px-5 py-2 text-sm font-semibold hover:bg-gray-100 rounded-[8px] transition-colors cursor-pointer"
            >
              Se connecter
            </button>
            <button
              onClick={handleCTA}
              className="px-5 py-2 text-sm font-semibold bg-[#635BFF] text-white rounded-[8px] hover:bg-[#635BFF]/90 transition-all shadow-md shadow-[#635BFF]/20 cursor-pointer"
            >
              Créer un compte
            </button>
          </div>

        </div>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: HeroSection */}
      <section className="relative pt-12 md:pt-20 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6">
              Le coloriage <br/>
              qui éveille la <span className="text-[#635BFF]">créativité</span> <br/>
              et célèbre <span className="text-[#22C55E]">l'Afrique</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg">
              Des milliers de dessins africains, des histoires captivantes et des outils intelligens pour apprendre en s'amusant.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={handleCTA}
                className="px-8 py-4 bg-[#635BFF] text-white font-bold rounded-[8px] hover:scale-105 transition-transform shadow-lg shadow-[#635BFF]/30 cursor-pointer"
              >
                Commencer gratuitement
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-800 font-bold rounded-[8px] flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 bg-[#635BFF] rounded-full flex items-center justify-center">
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
              className="relative z-10 w-full drop-shadow-2xl rounded-[16px]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ36e7KbMp2tE2bP9GbfmsV4Dx752TShf1P32kDjzEoan-bJsyDD-6mzAiXhdWhUI9lB5bouwAgLIyTPR7Qgc4owSDiDIzBjDvDs7uuTC-xN3vM0URhxfybyPCXLDDId5lewRzDQwRI-LLk8PlcbZuQvx_7fZvKXHpbVOkeAbxYgcCLVusImemfMWb269XkoISggYXL2kjWaqXPy8t987j87BshgIij8T6tNh8z99-KkRI50CFuQbBRNgcN87nwcYI1talQUnKmIiA"
            />
            {/* Background Elements (Simulated) */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#635BFF]/10 rounded-full blur-3xl opacity-50 -z-10"></div>
          </div>

        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: FeaturesGrid */}
      <section id="features" className="py-16 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-9c.83 0 1.5-.67 1.5-1.5S10.33 8 9.5 8 8 8.67 8 9.5 8.67 11 9.5 11zm5 0c.83 0 1.5-.67 1.5-1.5S15.33 8 14.5 8 13 8.67 13 9.5s.67 1.5 1.5 1.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Coloriages uniques</h3>
              <p className="text-xs text-gray-500">Des centaines de dessins inspirés de l'Afrique.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H5V4h14v14zM17 11h-4V7h-2v4H7v2h4v4h2v-4h4v-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2 text-[#22C55E]">Dessin magique</h3>
              <p className="text-xs text-gray-500">Transforme tes idées en coloriages.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.2 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Livres personnalisés</h3>
              <p className="text-xs text-gray-500">Crée ton propre livre de coloriage.</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Jeux éducatifs</h3>
              <p className="text-xs text-gray-500">Apprends en jouant avec des jeux amusants.</p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Histoires captivantes</h3>
              <p className="text-xs text-gray-500">Lis des histoires qui éveillent l'imagination.</p>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Récompenses</h3>
              <p className="text-xs text-gray-500">Gagne des badges et progresse.</p>
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
            <div className="absolute top-4 left-4 w-8 h-8 bg-[#635BFF]/20 text-[#635BFF] font-bold rounded-full flex items-center justify-center text-xs">1</div>
            <div className="h-40 flex items-center justify-center mb-6">
              <img
                alt="Step 1"
                className="w-full h-full object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwDxlDv3lqot0eWdhHwv19lzlJtl94kvmspw0CTPyTa8FcbAJLTplbKIyeZ6e-EFVeMTwtxJvs5-HurZcEAgqZTtdyz1ofLPK0CqDs32steC-eDTxHZELZZep54vO7luNwKbgf0HkiDMsiPZTTenvtATfYtGzn6cC2Okfx2nqk0wyJQ2UnQUF7VElwgDhdRIHLGQpEfEDzPyP08nDBBIVBSXRPCowxp5-pZpxiVi6UypdKBQiI9ZwWEzScOxw62KvEhaPq-KODyJ65"
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
            <div className="h-40 flex items-center justify-center mb-6">
              <img
                alt="Step 2"
                className="w-full h-full object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB322QZIQzfFaLUpOGQSCA_AiD9cPb0xqYZ0F3BG7JP7qYGmd9cOgG9KG79NZY6JET18O14XfTWtQF2u9_CwPFmluREWgSsFACzEA2KOJKc3RN76LWUtkJ0GVwpedeCwmM_Ukast-QTMOoA0skXA5HXOvTyXDBqRhEIm6dgiHkKP_wH0Mq6kdfQvvDE9IbfBH_wOMtpTvOKaIvXmFYr2ZBgxkeRzYgFU6Ko7vp3uVyq_mOEF2SkjKWqbDSSlvWD8MNTnVpKUIvs0Dqu"
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
            <div className="h-40 flex items-center justify-center mb-6">
              <img
                alt="Step 3"
                className="w-full h-full object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCshkdiyfNVfUOxdfjvKgdh166Xf8GaFhFEMFFHepeAVdN0fWQYtzHo3bvJMfg6ozBgx3rrNERLSGd18WRkTgg4EDLW5XhtRxoNJgy4CKyKMGowPrms316fFVphLwsKBpafI-r1RwR-vdO304ejhefH_VS2XSzC11OeMMsUqr_ZMzCWWHjEwsa6U8AwHuUBbPstq-5KRJHYK-_1291QZi_lTPxHebSsYi_J0KBtKIXYtDerAlnRobyAnlWBJQjMaxoEBmp0zn54VZjx"
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
            <div className="h-40 flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Télécharge</h3>
            <p className="text-sm text-gray-500">Ton livre ou demande une impression.</p>
          </div>

        </div>
      </section>
      {/* END: HowItWorks */}

      {/* BEGIN: CreateBookBanner */}
      <section id="pricing" className="py-12 px-6">
        <div className="max-w-7xl mx-auto bg-amber-50 rounded-[40px] p-8 md:p-12 overflow-hidden border border-amber-100 shadow-xl shadow-amber-900/5">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            <div className="md:w-1/3 flex justify-center">
              <img
                alt="Enfants lisant"
                className="w-full max-w-[280px] rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm9Alp4BE8J_VVhPs_Yz2aXTKxSBXWRYU_vHIeluQOVWrIQQDuIM4_oxiir_0zE6UIXZLWY49qEJCVtfr4sfty-_MPBXuOWxUHLDGaHv8cDfJnZ6xDWTVCkg7KNSOR-9VPvpqF3sJ6h5WaAyTEj7NALDuJdNNgpT4SkcXQwhvuWUyweIsQGuRZ2j2hPthmF_-qxJnymOi4dhIaLjg995ljoIy_6kvdCPMpvZjfLlm8W--u1cPfz3j9tm8XiYok8IFEhPxjiRl2rtVu"
              />
            </div>

            <div className="md:w-1/3 text-center md:text-left">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <span className="text-2xl">⭐</span>
                <h2 className="text-3xl font-extrabold">Crée ton propre livre de coloriage</h2>
              </div>
              <p className="text-gray-600 mb-8">Un livre unique, à ton image. Parfait pour s'amuser, apprendre et offrir !</p>
              <button
                onClick={handleCTA}
                className="px-8 py-3 bg-[#635BFF] text-white font-bold rounded-[8px] hover:scale-105 transition-transform cursor-pointer"
              >
                Créer mon livre
              </button>
            </div>

            <div className="md:w-1/3 flex gap-4 overflow-x-auto pb-4">
              {/* Book Previews */}
              <div className="min-w-[140px] bg-white p-2 rounded-xl shadow-md border-t-4 border-[#635BFF]">
                <img
                  alt="Book 1"
                  className="rounded-lg mb-2 w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz-d3Ri4geNZofFP6e9OKPAF0fMHnV6glgRS_w5_CssxIxWtgoopW85EJM5n7wsBpqLb-hwADQ86aBuIhy0cnlm07T3FKPKN4oMQk99IFjDBS8RKxJaPBRvGWpC8a4sIlr2U73Xbbu-t6jLJuAbcFGUzGYbTG4IoFxbNBjuZ9UBPZpn_gbD_6_JLjcUnPyBPbA6mvQ8Ah0iCCXbGuNTnnoJLz1UgZdeakrjRVdL58ghyrMpk0MOZpb0k5BTOQUaLDLQcASPI1mHuTb"
                />
                <p className="text-[10px] font-bold text-center">Les animaux de la savane</p>
              </div>

              <div className="min-w-[140px] bg-white p-2 rounded-xl shadow-md border-t-4 border-[#22C55E]">
                <img
                  alt="Book 2"
                  className="rounded-lg mb-2 w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEQi1HUZHqMH80U9570YVwwiUpeYvwzpV-w_Gc0qDkxpckvt6Zeb7QdQehm0ASWU-L9ngBCbRvgqa__4i8GZcq_AJQFsEIbr-OLrpzrHVFi88-7Mgn08sp3e-Ta9jTepl8T6G01dPa5Z8Jukw5ouMrNZCmCWe6MnRtOrziKaRb9yh4w-IBFzRK0dfWoHe32dkRyCyNjivWtz0PsYr9ILxtUotTBN5Liemhc3KEgOC7KkO7zDjrmTmca1IsUXmuRnrMjVcBuKRIkE5o"
                />
                <p className="text-[10px] font-bold text-center">Mon livre de coloriage</p>
              </div>

              <div className="min-w-[140px] bg-white p-2 rounded-xl shadow-md border-t-4 border-orange-500">
                <img
                  alt="Book 3"
                  className="rounded-lg mb-2 w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2QUiAl9Ww8H12Sq-85KuVBBlwX4wk4o_tlST-un2gMcwEUxwDuV8YZcKQhP8KBCK5Axk9lpLlPu1iru_HkA4B7Vu7sH7A6AD5HpHySfcseZmVAfkektmkTwYrnEDD0NhllZG55j3ZtC0j6n4lLhOmHdoNdDELWRStD7mb0IVEGpFd-kzEGIfcvabdZYftC4oG8jXEycRXV7RudDnBDd_nRw_wtfUZ7e8ctbHuvpOhcXGkweQVBC1SVMOmWTHoCUJw5t2OMNXFQYN0"
                />
                <p className="text-[10px] font-bold text-center">Les instruments africains</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: CreateBookBanner */}

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
                    className="w-12 h-12 rounded-full border-2 border-[#635BFF]/20 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMshMF73B2AVXDBCo2U7qw6G-cXiJeM1AyQeKASzc9xAyD91GVGG7agzLQbOftSy4Wnh7JTBnl2n_tgn-fUAjSPe6tYsUxO7Q7s9tn8Xx4uzdU3GdQOMoeC5mZPoeABTLzORAMwgstzxwU-GLAIXVL4dDLxs6UtIbhyGtAKWBTdWmpRB2M2n83UXGaFARfNrpc_yXBFjc1BBl_BNIW9ueTLulV2lj5aeUdIt5n8FJMxhT5weyg541bg8-pnR0JgVSyCrwXssBSAVyT"
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
                    className="w-12 h-12 rounded-full border-2 border-[#635BFF]/20 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzcHUD2pDdYxT7rOS5H-3Xt11s5zxwUAnlAigVKuPhejRxxCbuCfG1CMzmJLF4D3Ib04XRghAeKfyzDGuyAbfZ2KttTjrFZgUfz088zx9tP-DC_KoV7olzz36mHoWfNt63pBSI0nbINoQQn8VZtVm3uPnfk8y0kx3TNyiMjtv3P3i162esyhDes3MSPvT7NQ90orygLlniC69ah9mqOWICE50nPlHCFMiTLiWR0sH-dEnTXXp-Yo-E575mXQiWgzd1UW4VzSyCe8wN"
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
                    className="w-12 h-12 rounded-full border-2 border-[#635BFF]/20 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCk9dEUgVbzCwSDhGyQRrcQvHseeU-88AmXxRyHdCk-vouLWaXCMCdreS36bTc3wdDRhpawoFn6nsw67kkzodRftXTWwMyONcsHZ5jI62X0ALmMmsJG7Y0nofk5z6b8AnHlHODLcSWvAVu67guLnOC8raDdO1xuDHcUH7H40edVFI9A7p1gna1rCocPaXXjN8HMYftmRiG3osAkOKBXY0P7DodWkLE-9rtDso2ednR-f0cV-lITLHjC49hbmuTXHdBKvBcmd3Q0QPH"
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
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto bg-[#635BFF] rounded-[40px] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          
          <div className="relative z-10 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Prêt à éveiller la créativité<br/> de votre enfant ?</h2>
            <p className="text-indigo-100 text-lg mb-8 opacity-80">Rejoignez des milliers de familles qui font déjà confiance à Petit Baobab.</p>
            <div className="flex flex-col items-center md:items-start gap-3">
              <button
                onClick={handleCTA}
                className="px-10 py-4 bg-white text-[#635BFF] font-bold rounded-[8px] hover:scale-105 transition-all shadow-xl shadow-black/20 cursor-pointer"
              >
                Commencer gratuitement
              </button>
              <p className="text-[10px] text-white/60">Aucune carte bancaire requise</p>
            </div>
          </div>

          <div className="relative z-10">
            <img
              alt="Enfant qui dessine"
              className="w-full max-w-[320px] drop-shadow-2xl rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM3ZTSZA_XtMXBy8k_45AYDKKoT9sHd_hz6KpGWqNXfD2CQg1shEHAOKJXLlUW9cy-ZpvCuYTUVTL3Ikg5lbtt-su9sSWoXZaUXB8MAt82G56vkWaw3JTU4bjvC4NsoGLvMV2uzWCzcnA8eYHZs9eRT_-aGBgZyIuPoxm_LdhVxmlYmV8FltuXrZQXH86GS_N40zr26bDQ2R6noBGAOyUl-6nRrrzQvnWbj9Kj0TNiKgq1feqnRPv_GJZl74loYRg_Ewq7kVoKUf37"
            />
          </div>

          {/* Background Graphic Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent)]"></div>

        </div>
      </section>
      {/* END: FooterCTA */}

      {/* BEGIN: MainFooter */}
      <footer className="bg-[#FBFAEE] pt-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img
                  alt="Logo"
                  className="w-10 h-10 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNS3EA7NELbhi4KQVPSq96IZDcIr5TawScrXLrxKMQxGQgKrYnC1Ke8Jj5FKH-mnF63K4bwu_-D5xv55Ayu__HtPTXpIeXRA_MkyKRKYeriFdfn_jqGBoI5OPcZVReENndZo9Jcsc3wIznGdRTzRnf56J5tJLZl05FAnE2XaNPdJv-3yG-nHRYWKIuojCeo2wshw0Dq0zfuJhLjkJDc91SPObdmzYatik7QRf1XZLL_19GfPkLnS5Z-Eedr_VjfrRDosocTw6dJKhn"
                />
                <div className="leading-tight">
                  <span className="block text-2xl font-extrabold text-[#635BFF]">Petit Baobab</span>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">Apprendre, créer, grandir !</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 max-w-xs mb-6">La plateforme de coloriage et d'éducation inspirée par les cultures africaines.</p>
              <div className="flex gap-4">
                <a className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-[#635BFF] transition-colors border border-gray-100" href="#">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-[#635BFF] transition-colors border border-gray-100" href="#">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-[#635BFF] transition-colors border border-gray-100" href="#">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.342-4.917 2.342v-4.684z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-6">Produit</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a className="hover:text-[#635BFF]" href="#">Coloriages</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Livres</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Jeux éducatifs</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Histoires</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-6">Entreprise</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a className="hover:text-[#635BFF]" href="#">À propos</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Notre mission</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Blog</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-6">Ressources</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a className="hover:text-[#635BFF]" href="#">Aide</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Guide parents</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Confidentialité</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Conditions</a></li>
              </ul>
            </div>

          </div>

          {/* Footer Landscape Illustration */}
          <div className="relative w-full h-32 md:h-48 overflow-hidden">
            <img
              alt="Paysage"
              className="w-full absolute bottom-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuARCIXYwowR7Ge3YB_ILIeikyQMHP0Kdc9faX_BVboGGXb7UMmmcaYjINejFvb4HYeJXlfpWExbWyI9py9jXhY1bspe_9jAV5raV3wajegUq0FR3Dd7bDurbwh09SO7SFinxBDl6dpJm269Gx2uVXMMYTH4xDF9KKG_360LaTlEQpcwlT7_l40IDYUHMfpv7_GidWLTIEZ2Q_Q7ZXz3JQR9VEDqd5TH_D5_C0dV3UN-YJYl5UK9SmhF5eVg3UNxbWbianndX4kUaETj"
            />
          </div>

          <div className="py-8 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">© 2025 Petit Baobab. Tous droits réservés.</p>
          </div>

        </div>
      </footer>
      {/* END: MainFooter */}

    </div>
  )
}
