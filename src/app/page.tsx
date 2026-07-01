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
    <div className="bg-[#fef5e0] font-sans text-[#1F2937] antialiased overflow-x-hidden min-h-screen">
      
      {/* BEGIN: MainHeader */}
      <header className="sticky top-0 z-50 bg-[#fef5e0]/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
            <div className="h-[200px] flex items-center justify-center">
              <img
                alt="Logo"
                className="h-[200px] w-auto object-contain"
                src="/illustrations/logo-petit-baobab.svg"
              />
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
              className="relative z-10 w-full md:scale-110 lg:scale-120 xl:scale-125 origin-center transition-transform duration-300 drop-shadow-2xl rounded-[24px]"
              src="/illustrations/Petite%20fille%20tenant%20un%20crayon-village-girafe%20C.webp"
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
            
            <div className="md:w-1/3 flex justify-center md:justify-start items-end md:self-stretch -mb-4 md:-mb-12 md:-ml-12">
              <img
                alt="Enfants lisant"
                className="w-full max-w-[340px] md:max-w-[440px] drop-shadow-xl object-contain align-bottom"
                src="/illustrations/Deux%20enfants%20lisant%20ensemble.webp"
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
      <section className="px-6 pb-24 pt-12">
        <div className="max-w-7xl mx-auto bg-[#635BFF] rounded-[32px] p-8 md:p-12 text-white relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Left Column (40%): Title and Subtitle */}
          <div className="relative z-10 md:w-[40%] text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Prêt à éveiller la créativité<br className="hidden md:inline"/> de votre enfant ?</h2>
            <p className="text-indigo-100 text-sm opacity-80">Rejoignez des milliers de familles<br className="hidden md:inline"/> qui font déjà confiance à Petit Baobab.</p>
          </div>

          {/* Center Column (20%): Centered CTA button */}
          <div className="relative z-10 md:w-[20%] flex flex-col items-center justify-center gap-2">
            <button
              onClick={handleCTA}
              className="px-8 py-3.5 bg-white text-[#635BFF] font-bold rounded-[32px] hover:scale-105 transition-all shadow-xl shadow-black/20 cursor-pointer text-sm w-full md:w-auto text-center whitespace-nowrap"
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

      {/* BEGIN: MainFooter */}
      <footer className="bg-[#fef5e0] pt-20 pb-8 border-t border-gray-100 relative overflow-hidden">
        
        {/* Absolutely Positioned Baobab Landscape on the right */}
        <img
          alt="Paysage Baobab"
          className="absolute bottom-0 right-0 h-[200px] md:h-[240px] w-auto object-contain pointer-events-none select-none z-0"
          src="/illustrations/Baobab.webp"
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            
            {/* Column 1: Logo */}
            <div className="col-span-2 md:col-span-2 flex flex-col justify-start">
              <img
                alt="Logo Petit Baobab"
                className="h-[320px] w-auto object-contain self-start mb-4"
                src="/illustrations/logo-petit-baobab.svg"
              />
            </div>
            
            {/* Column 2: Produit */}
            <div className="col-span-1">
              <h4 className="font-bold text-sm text-[#1C1C3A] mb-6">Produit</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a className="hover:text-[#635BFF]" href="#">Coloriages</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Livres</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Jeux éducatifs</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Histoires</a></li>
              </ul>
            </div>

            {/* Column 3: Entreprise */}
            <div className="col-span-1">
              <h4 className="font-bold text-sm text-[#1C1C3A] mb-6">Entreprise</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a className="hover:text-[#635BFF]" href="#">À propos</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Notre mission</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Blog</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Contact</a></li>
              </ul>
            </div>

            {/* Column 4: Ressources */}
            <div className="col-span-1">
              <h4 className="font-bold text-sm text-[#1C1C3A] mb-6">Ressources</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a className="hover:text-[#635BFF]" href="#">Aide</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Guide parents</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Confidentialité</a></li>
                <li><a className="hover:text-[#635BFF]" href="#">Conditions</a></li>
              </ul>
            </div>

            {/* Column 5: Suivez-nous */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-sm text-[#1C1C3A] mb-6 text-center md:text-left">Suivez-nous</h4>
              <div className="flex gap-3 justify-center md:justify-start">
                {/* Facebook */}
                <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-600 hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-pink-600 hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* TikTok */}
                <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.08-1.39-.42-.31-.8-.67-1.14-1.07-.05 2.12-.02 4.24-.03 6.36 0 1.62-.39 3.29-1.33 4.61-.95 1.34-2.44 2.29-4.09 2.51-1.62.24-3.37-.09-4.74-.99C5.03 18.96 4 17.15 4 15.2c0-1.95 1.03-3.76 2.76-4.81.99-.61 2.15-.92 3.3-.92.13 0 .26.01.39.02v4.08c-.76-.11-1.57.06-2.21.5-.68.46-1.07 1.25-1.07 2.07 0 .82.39 1.61 1.07 2.07.72.49 1.65.61 2.47.33.82-.28 1.48-.94 1.77-1.76.24-.68.25-1.42.25-2.14.01-4.87.01-9.74.02-14.62z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-red-600 hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          <div className="py-8 border-t border-gray-200/30 text-center relative z-10">
            <p className="text-xs text-gray-500 font-medium">© 2025 Petit Baobab. Tous droits réservés.</p>
          </div>

        </div>
      </footer>
      {/* END: MainFooter */}

    </div>
  )
}
