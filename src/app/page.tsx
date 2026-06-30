"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Palette,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Star,
  ArrowRight,
  ChevronDown,
  Layers,
  CheckCircle2,
  Lock,
  Gamepad2,
  BookOpenCheck,
  Heart,
  Globe,
  Plus,
  Compass,
  Trophy,
} from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const { user, account, checkSession, logout } = useAuthStore()
  
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({})
  const [magicPrompt, setMagicPrompt] = useState("")

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleLangToggle = () => {
    setLanguage(lang === "fr" ? "en" : "fr")
  }

  const handleMagicAIClick = () => {
    if (user) {
      router.push(`/magic-drawing?prompt=${encodeURIComponent(magicPrompt || "Un lion près d'un grand baobab")}`)
    } else {
      router.push(`/login?next=${encodeURIComponent(`/magic-drawing?prompt=${encodeURIComponent(magicPrompt || "Un lion près d'un grand baobab")}`)}`)
    }
  }

  const faqItems = [
    {
      q: lang === "fr" ? "Qu'est-ce que Petit Baobab ?" : "What is Petit Baobab?",
      a: lang === "fr" 
        ? "Petit Baobab est une plateforme éducative et créative conçue pour les enfants de 3 à 8 ans en Afrique. Elle combine coloriage, contes illustrés, jeux éducatifs et un générateur d'images IA sécurisé pour développer l'imaginaire." 
        : "Petit Baobab is an educational and creative platform designed for children aged 3 to 8 in Africa. It combines coloring, illustrated tales, educational games, and a safe AI image generator to expand imagination."
    },
    {
      q: lang === "fr" ? "Comment fonctionne l'intelligence artificielle ?" : "How does the AI generator work?",
      a: lang === "fr" 
        ? "L'enfant décrit l'image de son choix (ex: 'un éléphant jouant du balafon') et l'IA génère en quelques secondes un dessin au trait prêt à colorier. C'est 100% sécurisé et adapté à la culture locale." 
        : "The child describes the image of their choice (e.g., 'an elephant playing balafon'), and the AI generates a ready-to-color outline drawing in seconds. It is 100% safe and adapted to local culture."
    },
    {
      q: lang === "fr" ? "Le système d'étoiles est-il obligatoire ?" : "Is the star wallet mandatory?",
      a: lang === "fr" 
        ? "Non, l'inscription est 100% gratuite et donne droit à 5 étoiles de bienvenue. Les coloriages classiques et certains jeux sont accessibles librement. Les étoiles ne servent que pour les générations IA détaillées." 
        : "No, signing up is 100% free and includes 5 welcome stars. Basic coloring pages and some games are freely accessible. Stars are only consumed for detailed AI generations."
    },
    {
      q: lang === "fr" ? "Proposez-vous des abonnements pour les écoles ?" : "Do you offer subscriptions for schools?",
      a: lang === "fr" 
        ? "Oui ! Notre formule Écoles permet de regrouper plusieurs élèves, de suivre leurs statistiques et de générer des livrets d'activités complets en PDF pour les imprimer en grand volume." 
        : "Yes! Our Schools plan allows grouping multiple students, tracking their progress, and generating complete activity workbooks in PDF for bulk printing."
    }
  ]

  // Suggested prompts for the AI demo
  const suggestions = [
    "Un petit lionceau sous un grand baobab",
    "Une girafe avec des lunettes dans la savane",
    "Un garçon jouant de la kora au village",
    "Une tortue amicale près du fleuve Niger"
  ]

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#2B2B45] font-sans antialiased overflow-x-hidden pb-16 selection:bg-[#6C4CF1]/20 select-none">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 bg-[#FFFDF8]/90 backdrop-blur-md border-b-2 border-neutral-100 z-50 px-6 lg:px-12 h-[90px] flex items-center">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Image
              src="/illustrations/logo-petit-baobab.webp"
              alt="Petit Baobab"
              width={160}
              height={50}
              className="w-auto h-[48px] object-contain"
              priority
            />
          </div>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-8 font-extrabold text-[15px] text-[#7A7A95]">
            <a href="#features" className="hover:text-[#6C4CF1] transition-colors">{lang === "fr" ? "Fonctionnalités" : "Features"}</a>
            <a href="#coloriages" className="hover:text-[#6C4CF1] transition-colors">{lang === "fr" ? "Coloriages" : "Coloring"}</a>
            <a href="#books" className="hover:text-[#6C4CF1] transition-colors">{lang === "fr" ? "Livres" : "Books"}</a>
            <a href="#games" className="hover:text-[#6C4CF1] transition-colors">{lang === "fr" ? "Jeux" : "Games"}</a>
            <a href="#stories" className="hover:text-[#6C4CF1] transition-colors">{lang === "fr" ? "Histoires" : "Stories"}</a>
            <a href="#pricing" className="hover:text-[#6C4CF1] transition-colors">{lang === "fr" ? "Tarifs" : "Pricing"}</a>
            <button onClick={() => router.push("/school")} className="flex items-center gap-1 text-[#2EC4B6] hover:text-[#2EC4B6]/85 transition-colors cursor-pointer font-extrabold font-sans">
              <GraduationCap className="w-4 h-4" />
              <span>{lang === "fr" ? "Écoles" : "Schools"}</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Lang switcher */}
            <button
              onClick={handleLangToggle}
              className="px-3.5 py-1.5 text-xs font-black border-2 border-[#2B2B45] bg-white rounded-full shadow-[2px_2px_0px_0px_#2B2B45] hover:bg-neutral-50 cursor-pointer"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="h-[48px] px-5 bg-[#6C4CF1] hover:bg-[#5735E2] text-white font-extrabold text-sm rounded-[18px] transition-colors cursor-pointer"
                >
                  {lang === "fr" ? "Mon Espace" : "My Dashboard"}
                </button>
                <button
                  onClick={async () => {
                    await logout()
                    router.refresh()
                  }}
                  className="h-[48px] px-4 bg-white border-2 border-red-500 hover:bg-red-50 text-red-500 font-extrabold text-sm rounded-[18px] transition-all cursor-pointer"
                >
                  {lang === "fr" ? "Quitter" : "Sign Out"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="hidden sm:inline-block font-extrabold text-sm text-[#2B2B45] hover:text-[#6C4CF1] transition-colors cursor-pointer"
                >
                  {lang === "fr" ? "Connexion" : "Log In"}
                </button>
                <button
                  onClick={() => router.push("/login?tab=signup")}
                  className="h-[48px] px-6 bg-[#6C4CF1] hover:bg-[#5735E2] text-white font-extrabold text-sm rounded-[18px] shadow-[4px_4px_0px_0px_#2B2B45] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#2B2B45] transition-all cursor-pointer border-2 border-[#2B2B45]"
                >
                  {lang === "fr" ? "Créer gratuitement" : "Create Free Account"}
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left text column */}
        <div className="flex flex-col gap-8 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FFC83D]/15 border-2 border-[#2B2B45] rounded-full w-max text-xs font-black shadow-[2px_2px_0px_0px_#2B2B45]">
            <Star className="w-3.5 h-3.5 text-[#FFC83D] fill-[#FFC83D]" />
            <span>{lang === "fr" ? "5 ÉTOILES IA OFFERTES À L'INSCRIPTION" : "5 FREE AI STARS UPON SIGNUP"}</span>
          </div>

          <h1 className="text-[44px] md:text-[56px] font-black text-[#2B2B45] leading-[1.1] tracking-tight">
            Le coloriage qui éveille la{" "}
            <span className="text-[#6C4CF1] relative">
              créativité
              <span className="absolute bottom-0 left-0 w-full h-[6px] bg-[#6C4CF1]/20 rounded-full"></span>
            </span>{" "}
            et célèbre{" "}
            <span className="text-[#2ECC71]">l'Afrique</span>
          </h1>

          <p className="text-[17px] md:text-[19px] font-bold text-[#7A7A95] leading-relaxed">
            Petit Baobab aide les enfants à apprendre, créer et s'amuser grâce au coloriage interactif, aux histoires, aux jeux éducatifs et à l'intelligence artificielle.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="h-[58px] px-8 bg-[#6C4CF1] hover:bg-[#5735E2] text-white border-2 border-[#2B2B45] rounded-2xl font-black text-base shadow-[4px_4px_0px_0px_#2B2B45] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#2B2B45] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === "fr" ? "Accéder à mon espace" : "Access My Dashboard"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login?tab=signup")}
                  className="h-[58px] px-8 bg-[#6C4CF1] hover:bg-[#5735E2] text-white border-2 border-[#2B2B45] rounded-2xl font-black text-base shadow-[4px_4px_0px_0px_#2B2B45] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#2B2B45] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{lang === "fr" ? "Commencer gratuitement" : "Start Free Now"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="h-[58px] px-8 bg-white border-2 border-[#2B2B45] text-[#2B2B45] font-black text-base rounded-2xl shadow-[4px_4px_0px_0px_#2B2B45] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#2B2B45] transition-all cursor-pointer"
                >
                  {lang === "fr" ? "Découvrir Petit Baobab" : "Discover More"}
                </button>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-4 flex-wrap text-xs font-extrabold text-[#7A7A95]">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> 100% sécurisé</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Sans publicité</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Approuvé par les parents</span>
          </div>
        </div>

        {/* Right illustration column */}
        <div className="relative flex justify-center">
          <div className="w-[380px] md:w-[500px] h-[380px] md:h-[500px] rounded-[56px] border-4 border-[#2B2B45] bg-[#FFFDF8] shadow-[8px_8px_0px_0px_#2B2B45] flex items-center justify-center p-4 relative overflow-hidden">
            <Image
              src="/illustrations/Petite%20fille%20tenant%20un%20crayon-village-girafe.webp"
              alt="Mascot and savanna drawing"
              fill
              className="object-cover object-center drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 border-t-2 border-neutral-100">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[42px] font-black text-[#2B2B45]">
            Que propose Petit Baobab ?
          </h2>
          <p className="text-base font-extrabold text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Des outils créatifs et des contenus adaptés pour stimuler l'apprentissage et l'expression artistique.
          </p>
        </div>

        {/* 6 Rounded Cards (280x220px, Gap 24, Radius 28, Shadow lg) */}
        <div className="flex flex-wrap justify-center gap-6">
          
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="w-[280px] h-[240px] bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-md hover:shadow-lg flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#6C4CF1]/10 border border-[#6C4CF1] flex items-center justify-center text-[#6C4CF1]">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black mb-1">Coloriages uniques</h3>
              <p className="text-xs font-bold text-[#7A7A95] leading-relaxed">
                Des centaines de dessins inspirés de l'Afrique pour colorier en ligne ou à imprimer.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="w-[280px] h-[240px] bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-md hover:shadow-lg flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#FF9F1A]/10 border border-[#FF9F1A] flex items-center justify-center text-[#FF9F1A]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black mb-1">Dessin magique (AI)</h3>
              <p className="text-xs font-bold text-[#7A7A95] leading-relaxed">
                Transforme tes idées en véritables coloriages uniques grâce à notre IA sécurisée.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="w-[280px] h-[240px] bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-md hover:shadow-lg flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#FFC83D]/10 border border-[#FFC83D] flex items-center justify-center text-[#FFC83D]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black mb-1">Livres personnalisés</h3>
              <p className="text-xs font-bold text-[#7A7A95] leading-relaxed">
                Crée et personnalise tes propres livrets de coloriage thématiques au format PDF A4.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="w-[280px] h-[240px] bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-md hover:shadow-lg flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#2EC4B6]/10 border border-[#2EC4B6] flex items-center justify-center text-[#2EC4B6]">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black mb-1">Jeux éducatifs</h3>
              <p className="text-xs font-bold text-[#7A7A95] leading-relaxed">
                Apprends les lettres, les chiffres, les puzzles et la logique tout en t'amusant.
              </p>
            </div>
          </motion.div>

          {/* Card 5 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="w-[280px] h-[240px] bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-md hover:shadow-lg flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#FF9F1A]/10 border border-[#FF9F1A] flex items-center justify-center text-[#FF9F1A]">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black mb-1">Histoires captivantes</h3>
              <p className="text-xs font-bold text-[#7A7A95] leading-relaxed">
                Lis des contes locaux et des récits d'Afrique de l'Ouest qui éveillent l'imagination.
              </p>
            </div>
          </motion.div>

          {/* Card 6 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="w-[280px] h-[240px] bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-md hover:shadow-lg flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#2ECC71]/10 border border-[#2ECC71] flex items-center justify-center text-[#2ECC71]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black mb-1">Récompenses</h3>
              <p className="text-xs font-bold text-[#7A7A95] leading-relaxed">
                Gagne des badges de créativité et progresse au fil des coloriages terminés.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 bg-[#F8FAFC] border-2 border-neutral-100 rounded-[36px] mt-12">
        <h2 className="text-[32px] md:text-[40px] font-black text-[#2B2B45] text-center mb-16">
          Comment ça marche ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFE08A] border-2 border-[#2B2B45] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#2B2B45]">
              1
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px]">
              <Image src="/illustrations/animals/girafe.svg" alt="Girafe template" fill className="p-3 object-contain" />
            </div>
            <h4 className="font-extrabold text-[17px]">{lang === "fr" ? "Choisis" : "Select"}</h4>
            <p className="text-xs text-[#7A7A95] font-bold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Parmi des centaines de dessins inspirés de l'Afrique." : "From hundreds of African-themed drawings."}
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#DDF26B] border-2 border-[#2B2B45] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#2B2B45]">
              2
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px]">
              <Image src="/illustrations/book.webp" alt="Coloring Book template" fill className="p-3 object-contain" />
            </div>
            <h4 className="font-extrabold text-[17px]">{lang === "fr" ? "Personnalise" : "Customize"}</h4>
            <p className="text-xs text-[#7A7A95] font-bold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Crée ton propre livre avec tes illustrations favorites." : "Create your own booklet with your favorite drawings."}
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFC4A8] border-2 border-[#2B2B45] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#2B2B45]">
              3
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#6C4CF1]" />
            </div>
            <h4 className="font-extrabold text-[17px]">{lang === "fr" ? "Aperçois" : "Preview"}</h4>
            <p className="text-xs text-[#7A7A95] font-bold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Colorie en ligne ou utilise l'IA pour générer ton idée." : "Color online or use AI to draw your imagination."}
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] border-2 border-[#2B2B45] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#2B2B45]">
              4
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px] flex items-center justify-center">
              <Image src="/illustrations/puzzle.webp" alt="Download" fill className="p-4 object-contain" />
            </div>
            <h4 className="font-extrabold text-[17px]">{lang === "fr" ? "Télécharge" : "Download"}</h4>
            <p className="text-xs text-[#7A7A95] font-bold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Télécharge en PDF A4 ou imprime pour colorier sur papier." : "Download in A4 PDF or print to color physically."}
            </p>
          </div>

        </div>
      </section>

      {/* --- BOOKS SECTION --- */}
      <section id="books" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left column illustration */}
        <div className="flex justify-center relative">
          <div className="w-[360px] md:w-[480px] h-[300px] md:h-[400px] relative rounded-[40px] overflow-hidden border-4 border-[#2B2B45] shadow-[6px_6px_0px_0px_#2B2B45] bg-[#FFE7A0]">
            <Image
              src="/illustrations/Deux%20enfants%20lisant%20ensemble.webp"
              alt="Two happy children reading"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right column texts and book covers */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 text-[#6C4CF1] font-black text-sm">
            <BookOpen className="w-5 h-5" />
            <span>CRÉATEUR DE LIVRES</span>
          </div>

          <h2 className="text-[32px] md:text-[42px] font-black text-[#2B2B45] leading-tight">
            Crée ton propre livre de coloriage
          </h2>

          <p className="text-base font-bold text-[#7A7A95] leading-relaxed">
            Choisis parmi des thèmes burkinabès et ouest-africains. Assemble les plus beaux dessins de tes enfants, ajoute leur nom et crée en 1 clic un livre de coloriage PDF unique et personnalisé prêt pour l'impression.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="h-[52px] w-max px-6 bg-[#6C4CF1] hover:bg-[#5735E2] text-white border-2 border-[#2B2B45] rounded-xl font-extrabold text-sm shadow-[3px_3px_0px_0px_#2B2B45] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#2B2B45] transition-all cursor-pointer"
          >
            Créer mon livre
          </button>

          {/* Book covers preview list */}
          <div className="flex gap-4 mt-8 flex-wrap">
            <div className="px-4 py-2 border-2 border-[#2B2B45] bg-white rounded-2xl shadow-sm text-xs font-bold flex items-center gap-2">
              Les animaux de la savane
            </div>
            <div className="px-4 py-2 border-2 border-[#2B2B45] bg-white rounded-2xl shadow-sm text-xs font-bold flex items-center gap-2">
              Les instruments africains
            </div>
            <div className="px-4 py-2 border-2 border-[#2B2B45] bg-white rounded-2xl shadow-sm text-xs font-bold flex items-center gap-2">
              Mon livre de coloriage
            </div>
          </div>
        </div>
      </section>

      {/* --- MAGIC AI SECTION --- */}
      <section id="coloriages" className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-gradient-to-tr from-[#6C4CF1] to-[#2EC4B6] rounded-[48px] border-4 border-[#2B2B45] p-8 md:p-12 shadow-[8px_8px_0px_0px_#2B2B45] relative overflow-hidden">
          
          {/* Sparkles decorations */}
          <div className="absolute top-6 left-6 text-white/20"><Sparkles className="w-16 h-16" /></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Form */}
            <div className="flex flex-col gap-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full w-max text-xs font-extrabold backdrop-blur-sm border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COLORIAGE MAGIQUE IA</span>
              </div>

              <h2 className="text-[32px] md:text-[40px] font-black leading-tight text-white">
                Génère tes coloriages avec l'IA
              </h2>

              <p className="text-sm font-semibold text-white/80 leading-relaxed">
                L'enfant écrit sa description (ex: 'Un bébé hippopotame qui joue du djembé dans le marigot') et notre intelligence artificielle crée instantanément le dessin au trait.
              </p>

              {/* Input block */}
              <div className="flex flex-col gap-3">
                <div className="flex h-[56px] border-2 border-[#2B2B45] bg-white rounded-2xl overflow-hidden shadow-inner p-1 items-center">
                  <input
                    type="text"
                    value={magicPrompt}
                    onChange={(e) => setMagicPrompt(e.target.value)}
                    placeholder={lang === "fr" ? "Ex: Un éléphant jouant du balafon..." : "E.g., An elephant playing the balafon..."}
                    className="flex-1 bg-transparent border-none text-[#2B2B45] focus:outline-none font-bold text-sm px-4"
                  />
                  <button
                    onClick={handleMagicAIClick}
                    className="h-full px-5 bg-[#FFC83D] hover:bg-[#E3AF2B] text-[#2B2B45] border-2 border-[#2B2B45] rounded-xl font-black text-xs transition-colors cursor-pointer"
                  >
                    {lang === "fr" ? "Créer" : "Create"}
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMagicPrompt(s)}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-extrabold text-[10px] cursor-pointer border border-white/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview drawing */}
            <div className="flex justify-center">
              <div className="w-[280px] md:w-[320px] h-[280px] md:w-[320px] bg-white border-4 border-[#2B2B45] rounded-[32px] shadow-[6px_6px_0px_0px_#2B2B45] overflow-hidden p-3 relative flex items-center justify-center">
                <Image
                  src="/illustrations/coloring-baobab.png"
                  alt="Baobab drawing preview"
                  width={280}
                  height={280}
                  className="object-contain w-full h-full object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- EDUCATIONAL GAMES --- */}
      <section id="games" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[40px] font-black text-[#2B2B45]">
            Jeux Éducatifs Interactifs
          </h2>
          <p className="text-base font-extrabold text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Des puzzles, apprentissage des alphabets locaux et calculs élémentaires adaptés pour le niveau préscolaire.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-[#E0F2FE] border border-[#2B2B45] flex items-center justify-center font-bold text-[#0284C7] shrink-0">
              🧩
            </div>
            <h3 className="font-extrabold text-lg">Puzzles Africains</h3>
            <p className="text-xs text-[#7A7A95] font-bold">Réassemble les pièces d'animaux de la savane ou d'instruments de musique.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-[#FFE08A] border border-[#2B2B45] flex items-center justify-center font-bold text-[#FF9F1A] shrink-0">
              🔤
            </div>
            <h3 className="font-extrabold text-lg">Alphabet & Mots</h3>
            <p className="text-xs text-[#7A7A95] font-bold">Apprends à écrire et prononcer le nom des animaux en s'amusant.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-[#DDF26B]/40 border border-[#2B2B45] flex items-center justify-center font-bold text-[#2ECC71] shrink-0">
              🧠
            </div>
            <h3 className="font-extrabold text-lg">Jeu de Mémoire</h3>
            <p className="text-xs text-[#7A7A95] font-bold">Retrouve les paires de cartes sur les fruits tropicaux et les mascottes.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 text-center items-center">
            <div className="w-14 h-14 rounded-full bg-[#FFC4A8]/40 border border-[#2B2B45] flex items-center justify-center font-bold text-[#FF9F1A] shrink-0">
              🔢
            </div>
            <h3 className="font-extrabold text-lg">Maths Baobab</h3>
            <p className="text-xs text-[#7A7A95] font-bold">Compte les mangues et fais des petites additions créatives.</p>
          </div>
        </div>
      </section>

      {/* --- STORIES SECTION --- */}
      <section id="stories" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 bg-[#FFFDF8]/40 border-t border-neutral-100">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[40px] font-black text-[#2B2B45]">
            Histoires et Contes Illustrés
          </h2>
          <p className="text-base font-extrabold text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Éveillez l'imaginaire des enfants grâce à des récits et contes inspirés des traditions orales africaines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tale 1 */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-[140px] h-[140px] relative rounded-[20px] overflow-hidden border-2 border-[#2B2B45] bg-[#FFE08A] shrink-0">
              <Image src="/illustrations/lion.webp" alt="Tale of Lion" fill className="object-contain p-2" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-[#6C4CF1] tracking-wide uppercase">CONTE DES ANIMAUX</span>
              <h3 className="text-[18px] font-black text-[#2B2B45]">Le lièvre rusé et la hyène gourmande</h3>
              <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed">
                Découvrez comment la ruse l'emporte toujours sur la gourmandise dans ce conte traditionnel amusant.
              </p>
            </div>
          </div>

          {/* Tale 2 */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[28px] p-6 shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-[140px] h-[140px] relative rounded-[20px] overflow-hidden border-2 border-[#2B2B45] bg-[#2EC4B6]/20 shrink-0">
              <Image src="/illustrations/robot.webp" alt="Tale of robot" fill className="object-contain p-2" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-[#6C4CF1] tracking-wide uppercase">AVENTURES</span>
              <h3 className="text-[18px] font-black text-[#2B2B45]">Awa et son robot en argile</h3>
              <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed">
                Une histoire moderne où Awa construit son compagnon en argile et explore son village magique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PARENTS & STATS SECTION --- */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Stats column */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 text-[#2ECC71] font-black text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>ESPACE PARENTS & SUIVI</span>
          </div>

          <h2 className="text-[32px] md:text-[42px] font-black text-[#2B2B45] leading-tight">
            Suivez les progrès de vos enfants
          </h2>

          <p className="text-base font-bold text-[#7A7A95] leading-relaxed">
            Petit Baobab offre un espace parent sécurisé par code PIN pour suivre le temps passé, les dessins créés et les badges de récompenses remportés par chaque enfant de la famille.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white border-2 border-[#2B2B45] rounded-2xl p-4 text-center">
              <div className="text-xl md:text-2xl font-black text-[#6C4CF1]">50 000+</div>
              <div className="text-[9px] font-bold text-[#7A7A95] mt-1">Heures coloriées</div>
            </div>
            <div className="bg-white border-2 border-[#2B2B45] rounded-2xl p-4 text-center">
              <div className="text-xl md:text-2xl font-black text-[#FF9F1A]">12 000+</div>
              <div className="text-[9px] font-bold text-[#7A7A95] mt-1">Livres créés</div>
            </div>
            <div className="bg-white border-2 border-[#2B2B45] rounded-2xl p-4 text-center">
              <div className="text-xl md:text-2xl font-black text-[#2ECC71]">8 000+</div>
              <div className="text-[9px] font-bold text-[#7A7A95] mt-1">Enfants actifs</div>
            </div>
          </div>
        </div>

        {/* Right Testimonials preview (Ils adorent Petit Baobab) */}
        <div className="flex flex-col gap-4">
          <h3 className="font-extrabold text-lg text-[#2B2B45]">{lang === "fr" ? "Ils adorent Petit Baobab :" : "They love Petit Baobab:"}</h3>
          
          <div className="bg-white border-2 border-[#2B2B45] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10 border border-neutral-100">
                <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=aminata" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-extrabold text-xs">Aminata, maman</h4>
                <div className="flex text-amber-500 text-xs mt-0.5">★★★★★</div>
              </div>
            </div>
            <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed">
              "Mon fils de 5 ans adore créer ses propres dessins avec l'IA. Les contours sont impeccables et faciles à colorier."
            </p>
          </div>

          <div className="bg-white border-2 border-[#2B2B45] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10 border border-neutral-100">
                <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=yacouba" />
                <AvatarFallback>YA</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-extrabold text-xs">Yacouba, enseignant</h4>
                <div className="flex text-amber-500 text-xs mt-0.5">★★★★★</div>
              </div>
            </div>
            <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed">
              "C'est un excellent outil pour ma classe préscolaire à Ouagadougou. J'imprime les livrets en format A4 et les enfants s'éveillent !"
            </p>
          </div>
        </div>

      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 border-t-2 border-neutral-100">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[40px] font-black text-[#2B2B45]">
            Nos Tarifs Simples
          </h2>
          <p className="text-base font-extrabold text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Sans engagement. Annulez à tout moment. Paiement par Mobile Money (Orange Money/Moov Money) disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Plan Free */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[28px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Gratuit</h3>
              <div className="text-[38px] font-black mt-3">0 FCFA</div>
              <ul className="text-xs font-bold text-[#7A7A95] flex flex-col gap-3 mt-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> 5 étoiles offertes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Coloriages classiques</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Filigrane sur les PDF</li>
              </ul>
            </div>
            <button onClick={() => router.push("/login?tab=signup")} className="w-full h-[52px] border-2 border-[#2B2B45] rounded-xl font-black text-xs mt-8 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
              {lang === "fr" ? "Commencer" : "Start Free"}
            </button>
          </div>

          {/* Plan Premium (Highlighted) */}
          <div className="bg-white border-4 border-[#6C4CF1] rounded-[28px] p-8 shadow-lg flex flex-col justify-between relative scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6C4CF1] text-white px-3 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
              {lang === "fr" ? "Recommandé" : "Best Value"}
            </div>
            <div>
              <h3 className="text-xs font-black text-[#6C4CF1] uppercase tracking-widest">Premium</h3>
              <div className="text-[38px] font-black mt-3">3 500 FCFA <span className="text-xs font-bold text-slate-400">/ mois</span></div>
              <ul className="text-xs font-bold text-[#7A7A95] flex flex-col gap-3 mt-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Étoiles IA illimitées</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Livres personnalisés illimités</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Téléchargements HD sans filigrane</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Jusqu'à 3 profils enfants</li>
              </ul>
            </div>
            <button onClick={() => router.push("/login")} className="w-full h-[52px] border-2 border-[#2B2B45] rounded-xl font-black text-xs mt-8 bg-[#6C4CF1] text-white hover:bg-[#5735E2] transition-colors cursor-pointer">
              {lang === "fr" ? "S'abonner" : "Subscribe Now"}
            </button>
          </div>

          {/* Plan School */}
          <div className="bg-white border-2 border-[#2B2B45] rounded-[28px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-[#2EC4B6] uppercase tracking-widest">Écoles</h3>
              <div className="text-[38px] font-black mt-3">20 000 FCFA <span className="text-xs font-bold text-slate-400">/ mois</span></div>
              <ul className="text-xs font-bold text-[#7A7A95] flex flex-col gap-3 mt-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Étoiles illimitées pour la classe</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Tableau de bord enseignant</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Impression en volume optimisée</li>
              </ul>
            </div>
            <button onClick={() => router.push("/school")} className="w-full h-[52px] border-2 border-[#2B2B45] rounded-xl font-black text-xs mt-8 bg-[#E0F2FE] hover:bg-[#E0F2FE]/90 transition-colors cursor-pointer">
              {lang === "fr" ? "Découvrir l'Espace École" : "Discover Schools"}
            </button>
          </div>

        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-[32px] font-black text-[#2B2B45] text-center mb-8">FAQ</h2>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="bg-white border-2 border-[#2B2B45] rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 font-bold text-left flex items-center justify-between hover:bg-neutral-50 cursor-pointer text-sm md:text-base"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#7A6A5E] transition-transform ${faqOpen[idx] ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {faqOpen[idx] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 pt-1 text-xs text-[#7A7A95] font-semibold leading-relaxed border-t border-neutral-100 bg-[#FFFDF8]">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="bg-gradient-to-tr from-[#6C4CF1] to-[#FF9F1A] rounded-[48px] border-4 border-[#2B2B45] p-8 md:p-12 shadow-[8px_8px_0px_0px_#2B2B45] relative overflow-hidden flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Texts */}
          <div className="flex flex-col gap-6 text-white relative z-10">
            <h2 className="text-[32px] md:text-[42px] font-black text-white leading-tight">
              Prêt à éveiller la créativité de votre enfant ?
            </h2>
            <p className="text-sm font-bold text-white/90">
              Rejoignez des milliers de familles qui font déjà confiance à Petit Baobab au Burkina Faso et en Afrique de l'Ouest.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => router.push("/login?tab=signup")} className="h-[56px] px-8 bg-[#FFC83D] hover:bg-[#E3AF2B] text-[#2B2B45] border-2 border-[#2B2B45] rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_#2B2B45] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#2B2B45] transition-all cursor-pointer">
                Créer gratuitement
              </button>
              <button onClick={() => {
                const element = document.getElementById("pricing")
                element?.scrollIntoView({ behavior: "smooth" })
              }} className="h-[56px] px-8 bg-white border-2 border-[#2B2B45] text-[#2B2B45] rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_#2B2B45] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#2B2B45] transition-all cursor-pointer">
                Voir les tarifs
              </button>
            </div>
            <span className="text-xs font-semibold text-white/80">Aucune carte bancaire requise</span>
          </div>

          {/* Right image */}
          <div className="flex justify-center relative z-10 shrink-0">
            <div className="w-[280px] md:w-[320px] h-[280px] md:h-[320px] relative overflow-hidden bg-white border-4 border-[#2B2B45] rounded-[40px] shadow-[6px_6px_0px_0px_#2B2B45]">
              <Image
                src="/illustrations/enfant-Crayons%20de%20couleur.webp"
                alt="Child showing coloring page"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t-2 border-neutral-100 max-w-[1440px] mx-auto px-6 lg:px-12 pt-16 pb-8 mt-12 flex flex-col gap-12 relative">
        
        {/* Decorative landscape of Baobabs at footer right */}
        <div className="absolute bottom-6 right-6 w-32 h-32 opacity-25 md:opacity-40 select-none pointer-events-none z-0">
          <Image
            src="/illustrations/Baobab.webp"
            alt="Baobab decoration"
            width={128}
            height={128}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative z-10">
          
          {/* Logo & description */}
          <div className="col-span-2 flex flex-col gap-4">
            <Image
              src="/illustrations/logo-petit-baobab.webp"
              alt="Petit Baobab"
              width={160}
              height={50}
              className="w-auto h-[45px] object-contain"
            />
            <p className="text-xs font-bold text-[#7A7A95] leading-relaxed max-w-sm">
              Apprendre, créer, grandir ! Le premier studio de coloriage interactif et éducatif conçu pour les enfants d'Afrique de l'Ouest.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 text-slate-400 mt-2">
              <a href="#" className="hover:text-[#6C4CF1] transition-colors font-extrabold text-xs">FB</a>
              <a href="#" className="hover:text-[#6C4CF1] transition-colors font-extrabold text-xs">IG</a>
              <a href="#" className="hover:text-[#6C4CF1] transition-colors font-extrabold text-xs">YT</a>
              <a href="#" className="hover:text-[#6C4CF1] transition-colors font-extrabold text-xs">TK</a>
            </div>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3 text-xs font-bold text-[#7A7A95]">
            <h4 className="text-[13px] font-black text-[#2B2B45] uppercase tracking-wider mb-2">Produit</h4>
            <a href="#features" className="hover:text-[#6C4CF1] transition-colors">Coloriages</a>
            <a href="#books" className="hover:text-[#6C4CF1] transition-colors">Livres</a>
            <a href="#games" className="hover:text-[#6C4CF1] transition-colors">Jeux éducatifs</a>
            <a href="#stories" className="hover:text-[#6C4CF1] transition-colors">Histoires</a>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3 text-xs font-bold text-[#7A7A95]">
            <h4 className="text-[13px] font-black text-[#2B2B45] uppercase tracking-wider mb-2">Entreprise</h4>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">À propos</a>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Notre mission</a>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Blog</a>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Contact</a>
          </div>

          {/* Resources links */}
          <div className="flex flex-col gap-3 text-xs font-bold text-[#7A7A95]">
            <h4 className="text-[13px] font-black text-[#2B2B45] uppercase tracking-wider mb-2">Ressources</h4>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Aide</a>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Guide parents</a>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-[#6C4CF1] transition-colors">Conditions</a>
          </div>

        </div>

        <div className="border-t border-neutral-100 pt-6 text-center text-[10px] font-extrabold text-[#7A7A95] relative z-10">
          © {new Date().getFullYear()} Petit Baobab. Tous droits réservés. Ouagadougou, Burkina Faso.
        </div>
      </footer>

    </div>
  )
}
