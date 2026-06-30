"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
  Palette,
  Bot,
  Book,
  Gamepad,
  Award,
  Shield,
  Play,
  ArrowRight,
  Download,
  Star,
  Heart,
  ChevronDown,
  Globe,
  Plus,
  BookOpen,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLanguage } = useI18n()
  const { user, checkSession, logout } = useAuthStore()
  
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#FFF7E7,#FFFDF8_55%)] text-[#17162E] font-poppins antialiased overflow-x-hidden select-none pb-16">
      
      {/* --- 1. NAVBAR (Height: 92px, Sticky, backdrop blur) --- */}
      <header className="sticky top-0 bg-white/92 backdrop-blur-md border-b border-[#ECECF3] z-50 px-8 h-[92px] flex items-center">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          
          {/* Logo (Width 190px, Height 70px) */}
          <div className="flex items-center cursor-pointer w-[190px] h-[70px] relative" onClick={() => router.push("/")}>
            <Image
              src="/illustrations/logo-petit-baobab.webp"
              alt="Petit Baobab"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Navigation (16px, font-weight 500, hover text-purple-600, gap 40px) */}
          <nav className="hidden xl:flex items-center gap-[40px] font-medium text-[16px] text-[#5F6475]">
            <a href="#features" className="hover:text-[#6C4CF1] transition-colors">Accueil</a>
            <a href="#features" className="hover:text-[#6C4CF1] transition-colors">Fonctionnalités</a>
            <a href="#books" className="hover:text-[#6C4CF1] transition-colors">Livres</a>
            <a href="#pricing" className="hover:text-[#6C4CF1] transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-[#6C4CF1] transition-colors">À propos</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            
            {/* Lang switcher */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLangToggle}
                    className="px-3.5 py-1.5 text-[14px] font-medium border-2 border-[#1C1C3A] bg-white rounded-full shadow-[2px_2px_0px_0px_#1C1C3A] hover:bg-neutral-50 cursor-pointer transition-transform active:scale-95 text-[#17162E]"
                  >
                    {lang === "fr" ? "EN" : "FR"}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-semibold">{lang === "fr" ? "Switch to English" : "Passer en Français"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {user ? (
              <>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="h-[48px] px-5 bg-[#6C4CF1] hover:bg-[#5B39EB] text-white border-2 border-[#1C1C3A] rounded-full font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  {lang === "fr" ? "Mon Espace" : "My Space"}
                </Button>
                <Button
                  onClick={async () => {
                    await logout()
                    router.refresh()
                  }}
                  variant="destructive"
                  className="h-[48px] px-4 bg-red-500 hover:bg-red-600 text-white border-2 border-[#1C1C3A] rounded-full font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  {lang === "fr" ? "Quitter" : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                {/* Se connecter outline, height 48px, width 140px, rounded-full */}
                <button
                  onClick={() => router.push("/login")}
                  className="h-[48px] w-[140px] rounded-full border border-[#ECECF3] bg-white hover:bg-[#FFFDF8] font-medium text-[16px] text-[#17162E] transition-colors cursor-pointer flex items-center justify-center"
                >
                  {lang === "fr" ? "Se connecter" : "Log In"}
                </button>
                {/* Créer un compte variant default, bg #6C4CF1, white text, height 48px, width 180px, shadow-lg, hover scale(1.03), 200ms transition */}
                <button
                  onClick={() => router.push("/login?tab=signup")}
                  className="h-[48px] w-[180px] bg-[#6C4CF1] hover:bg-[#5B39EB] text-white font-medium text-[16px] rounded-full shadow-lg transition-all duration-200 hover:scale-[1.03] cursor-pointer flex items-center justify-center"
                >
                  {lang === "fr" ? "Créer un compte" : "Create Account"}
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION --- */}
      <section className="max-w-[1280px] mx-auto px-6 py-[64px] grid grid-cols-1 lg:grid-cols-2 gap-[64px] items-center">
        
        {/* Left Column */}
        <div className="flex flex-col gap-[24px] max-w-xl">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFC107]/15 border-2 border-[#1C1C3A] rounded-full w-max text-[14px] font-medium shadow-sm">
            {/* White circular container for the icon with light shadow */}
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#FFC107]">
              <Star className="w-3.5 h-3.5 fill-[#FFC107]" />
            </div>
            <span>{lang === "fr" ? "5 ÉTOILES IA OFFERTES À L'INSCRIPTION" : "5 FREE AI STARS UPON SIGNUP"}</span>
          </div>

          <h1 className="text-[44px] md:text-[64px] font-bold text-[#1C1C3A] leading-[1.1] tracking-tight">
            Le coloriage qui éveille la{" "}
            <span className="text-[#6D4CFF] relative">
              créativité
              <span className="absolute bottom-0 left-0 w-full h-[6px] bg-[#6D4CFF]/20 rounded-full"></span>
            </span>{" "}
            et célèbre{" "}
            <span className="text-[#25C26E]">l'Afrique</span>
          </h1>

          <p className="text-[18px] font-normal text-[#7A7A95] leading-relaxed">
            Petit Baobab aide les enfants à apprendre, créer et s'amuser grâce au coloriage interactif, aux histoires, aux jeux éducatifs et à l'intelligence artificielle.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {user ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="h-[56px] px-8 bg-[#6D4CFF] hover:bg-[#5735E2] text-white border-2 border-[#1C1C3A] rounded-[24px] font-bold text-[18px] shadow-[4px_4px_0px_0px_#1C1C3A] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1C1C3A] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === "fr" ? "Accéder à mon espace" : "Access My Space"}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/login?tab=signup")}
                  className="h-[56px] px-8 bg-[#6D4CFF] hover:bg-[#5735E2] text-white border-2 border-[#1C1C3A] rounded-[24px] font-bold text-[18px] shadow-[4px_4px_0px_0px_#1C1C3A] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1C1C3A] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{lang === "fr" ? "Commencer gratuitement" : "Start Free Now"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="h-[56px] px-8 bg-white border-2 border-[#1C1C3A] text-[#1C1C3A] font-bold text-[18px] rounded-[24px] shadow-[4px_4px_0px_0px_#1C1C3A] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1C1C3A] transition-all cursor-pointer"
                >
                  {lang === "fr" ? "Découvrir Petit Baobab" : "Discover More"}
                </Button>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 mt-4 flex-wrap text-[14px] font-medium text-[#7A7A95]">
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100 text-[#25C26E]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              100% sécurisé
            </span>
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100 text-[#25C26E]">
                <Play className="w-3.5 h-3.5" />
              </div>
              Sans publicité
            </span>
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100 text-[#25C26E]">
                <Heart className="w-3.5 h-3.5" />
              </div>
              Approuvé par les parents
            </span>
          </div>

        </div>

        {/* Right Column (Fixed Illustration, doesn't hide/change on responsive) */}
        <div className="relative flex justify-center w-full">
          <div className="w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-[32px] border-4 border-[#1C1C3A] bg-white shadow-[8px_8px_0px_0px_#1C1C3A] flex items-center justify-center p-4 relative overflow-hidden shrink-0">
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

      {/* --- 3. FONCTIONNALITÉS --- */}
      <section id="features" className="max-w-[1280px] mx-auto px-6 py-[64px] border-t-2 border-neutral-100">
        <div className="text-center mb-[64px]">
          <h2 className="text-[32px] md:text-[48px] font-bold text-[#1C1C3A]">
            Que propose Petit Baobab ?
          </h2>
          <p className="text-[18px] font-normal text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Des outils créatifs et des contenus adaptés pour stimuler l'apprentissage et l'expression artistique.
          </p>
        </div>

        {/* 6 Rounded Cards (Gap 24, Radius 24, Shadow xl) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between h-[250px]"
          >
            {/* Circular white container for icon with light shadow */}
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#6D4CFF]">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-1">Coloriages uniques</h3>
              <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
                Des centaines de dessins inspirés de l'Afrique pour colorier en ligne ou à imprimer.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between h-[250px]"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#FFA726]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-1">Dessin magique (AI)</h3>
              <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
                Transforme tes idées en véritables coloriages uniques grâce à notre IA sécurisée.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between h-[250px]"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#FFC107]">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-1">Livres personnalisés</h3>
              <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
                Crée et personnalise tes propres livrets de coloriage thématiques au format PDF A4.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between h-[250px]"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#25C26E]">
              <Gamepad className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-1">Jeux éducatifs</h3>
              <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
                Apprends les lettres, les chiffres, les puzzles et la logique tout en t'amusant.
              </p>
            </div>
          </motion.div>

          {/* Card 5 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between h-[250px]"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#FFA726]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-1">Histoires captivantes</h3>
              <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
                Lis des contes locaux et des récits d'Afrique de l'Ouest qui éveillent l'imagination.
              </p>
            </div>
          </motion.div>

          {/* Card 6 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between h-[250px]"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100 text-[#25C26E]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold mb-1">Récompenses</h3>
              <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
                Gagne des badges de créativité et progresse au fil des coloriages terminés.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- 4. COMMENT ÇA MARCHE --- */}
      <section id="how-it-works" className="max-w-[1280px] mx-auto px-6 py-[64px] bg-[#F8FAFC] border-2 border-neutral-100 rounded-[24px] mt-[64px]">
        <h2 className="text-[32px] md:text-[48px] font-bold text-[#1C1C3A] text-center mb-[64px]">
          Comment ça fonctionne ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px] relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFE08A] border-2 border-[#1C1C3A] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#1C1C3A]">
              1
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px]">
              <Image src="/illustrations/animals/girafe.svg" alt="Girafe template" fill className="p-3 object-contain" />
            </div>
            <h4 className="font-bold text-[18px]">{lang === "fr" ? "Choisis" : "Select"}</h4>
            <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Parmi des centaines de dessins inspirés de l'Afrique." : "From hundreds of African-themed drawings."}
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#DDF26B] border-2 border-[#1C1C3A] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#1C1C3A]">
              2
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px]">
              <Image src="/illustrations/book.webp" alt="Coloring Book template" fill className="p-3 object-contain" />
            </div>
            <h4 className="font-bold text-[18px]">{lang === "fr" ? "Personnalise" : "Customize"}</h4>
            <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Crée ton propre livre avec tes illustrations favorites." : "Create your own booklet with your favorite drawings."}
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FFC4A8] border-2 border-[#1C1C3A] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#1C1C3A]">
              3
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px] flex items-center justify-center">
              {/* White circular container for the icon */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100 text-[#6D4CFF]">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <h4 className="font-bold text-[18px]">{lang === "fr" ? "Aperçois" : "Preview"}</h4>
            <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Colorie en ligne ou utilise l'IA pour générer ton idée." : "Color online or use AI to draw your imagination."}
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E0F2FE] border-2 border-[#1C1C3A] flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#1C1C3A]">
              4
            </div>
            <div className="w-24 h-24 relative overflow-hidden bg-white border-2 border-neutral-200 rounded-[20px] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100 text-[#25C26E]">
                <Download className="w-5 h-5" />
              </div>
            </div>
            <h4 className="font-bold text-[18px]">{lang === "fr" ? "Télécharge" : "Download"}</h4>
            <p className="text-xs text-[#7A7A95] font-semibold leading-relaxed max-w-[200px]">
              {lang === "fr" ? "Télécharge en PDF A4 ou imprime pour colorier sur papier." : "Download in A4 PDF or print to color physically."}
            </p>
          </div>

        </div>
      </section>

      {/* --- 5. LIVRES PERSONNALISÉS --- */}
      <section id="books" className="max-w-[1280px] mx-auto px-6 py-[64px] grid grid-cols-1 lg:grid-cols-2 gap-[64px] items-center">
        
        {/* Left Column (Fixed Illustration, doesn't change/hide on mobile) */}
        <div className="flex justify-center w-full">
          <div className="w-[300px] sm:w-[400px] md:w-[480px] h-[240px] sm:h-[320px] md:h-[400px] relative rounded-[24px] overflow-hidden border-4 border-[#1C1C3A] shadow-[6px_6px_0px_0px_#1C1C3A] bg-[#FFE7A0] shrink-0">
            <Image
              src="/illustrations/Deux%20enfants%20lisant%20ensemble.webp"
              alt="Two happy children reading"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[24px]">
          <div className="inline-flex items-center gap-2 text-[#6D4CFF] font-extrabold text-[14px]">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100 text-[#6D4CFF]">
              <Book className="w-4 h-4" />
            </div>
            <span>CRÉATEUR DE LIVRES</span>
          </div>

          <h2 className="text-[32px] md:text-[48px] font-bold text-[#1C1C3A] leading-tight">
            Crée ton propre livre de coloriage
          </h2>

          <p className="text-[18px] font-normal text-[#7A7A95] leading-relaxed">
            Choisis parmi des thèmes burkinabès et ouest-africains. Assemble les plus beaux dessins de tes enfants, ajoute leur nom et crée en 1 clic un livre de coloriage PDF unique et personnalisé prêt pour l'impression.
          </p>

          <Button
            onClick={() => router.push("/login")}
            className="h-[56px] w-max px-8 bg-[#6D4CFF] hover:bg-[#5735E2] text-white border-2 border-[#1C1C3A] rounded-[24px] font-bold text-[18px] shadow-[3px_3px_0px_0px_#1C1C3A] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1C1C3A] transition-all cursor-pointer"
          >
            Créer mon livre
          </Button>

          {/* Book covers preview list */}
          <div className="flex gap-4 mt-8 flex-wrap">
            <div className="px-4 py-2 border-2 border-[#1C1C3A] bg-white rounded-[24px] shadow-sm text-xs font-bold flex items-center gap-2">
              Les animaux de la savane
            </div>
            <div className="px-4 py-2 border-2 border-[#1C1C3A] bg-white rounded-[24px] shadow-sm text-xs font-bold flex items-center gap-2">
              Les instruments africains
            </div>
            <div className="px-4 py-2 border-2 border-[#1C1C3A] bg-white rounded-[24px] shadow-sm text-xs font-bold flex items-center gap-2">
              Mon livre de coloriage
            </div>
          </div>
        </div>
      </section>

      {/* --- EXTRA: GENERATE WITH AI --- */}
      <section id="ai-generator" className="max-w-[1200px] mx-auto px-6 py-[64px]">
        <div className="bg-gradient-to-tr from-[#6D4CFF] to-[#FFA726] rounded-[24px] border-4 border-[#1C1C3A] p-8 md:p-12 shadow-[8px_8px_0px_0px_#1C1C3A] relative overflow-hidden">
          
          <div className="absolute top-6 left-6 text-white/20"><Bot className="w-16 h-16" /></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Form */}
            <div className="flex flex-col gap-6 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-max text-xs font-extrabold backdrop-blur-sm border border-white/20">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6D4CFF] shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <span>COLORIAGE MAGIQUE IA</span>
              </div>

              <h2 className="text-[32px] md:text-[48px] font-bold leading-tight text-white">
                Génère tes coloriages avec l'IA
              </h2>

              <p className="text-sm font-semibold text-white/80 leading-relaxed">
                L'enfant écrit sa description (ex: 'Un bébé hippopotame qui joue du djembé dans le marigot') et notre intelligence artificielle crée instantanément le dessin au trait.
              </p>

              {/* Input block */}
              <div className="flex flex-col gap-3">
                <div className="flex h-[56px] border-2 border-[#1C1C3A] bg-white rounded-[24px] overflow-hidden shadow-inner p-1 items-center">
                  <input
                    type="text"
                    value={magicPrompt}
                    onChange={(e) => setMagicPrompt(e.target.value)}
                    placeholder={lang === "fr" ? "Ex: Un éléphant jouant du balafon..." : "E.g., An elephant playing the balafon..."}
                    className="flex-1 bg-transparent border-none text-[#1C1C3A] focus:outline-none font-bold text-sm px-4"
                  />
                  <Button
                    onClick={handleMagicAIClick}
                    className="h-full px-5 bg-[#FFC107] hover:bg-[#E3AF2B] text-[#1C1C3A] border-2 border-[#1C1C3A] rounded-[18px] font-black text-xs transition-colors cursor-pointer"
                  >
                    {lang === "fr" ? "Créer" : "Create"}
                  </Button>
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
              <div className="w-[280px] md:w-[320px] h-[280px] md:h-[320px] bg-white border-4 border-[#1C1C3A] rounded-[24px] shadow-[6px_6px_0px_0px_#1C1C3A] overflow-hidden p-3 relative flex items-center justify-center shrink-0">
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

      {/* --- 6. TÉMOIGNAGES --- */}
      <section className="max-w-[1280px] mx-auto px-6 py-[64px]">
        <div className="text-center mb-[64px]">
          <h2 className="text-[32px] md:text-[48px] font-bold text-[#1C1C3A]">
            Ils adorent Petit Baobab
          </h2>
          <p className="text-[18px] font-normal text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Découvrez les retours des parents, des enseignants et des éducateurs qui utilisent notre studio créatif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          
          {/* Testimonial 1 */}
          <Card className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-[#1C1C3A]">
                <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=aminata" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-[18px] text-[#1C1C3A]">Aminata, maman</h4>
                <div className="flex text-[#FFC107] text-sm mt-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
            <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
              "Mon fils de 5 ans adore créer ses propres dessins avec l'IA. Les contours sont impeccables et faciles à colorier. C'est magique !"
            </p>
          </Card>

          {/* Testimonial 2 */}
          <Card className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-[#1C1C3A]">
                <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=yacouba" />
                <AvatarFallback>YA</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-[18px] text-[#1C1C3A]">Yacouba, enseignant</h4>
                <div className="flex text-[#FFC107] text-sm mt-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
            <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
              "C'est un excellent outil pour ma classe préscolaire à Ouagadougou. J'imprime les livrets en format A4 et les enfants s'éveillent !"
            </p>
          </Card>

          {/* Testimonial 3 */}
          <Card className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-[#1C1C3A]">
                <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=fatou" />
                <AvatarFallback>FA</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-[18px] text-[#1C1C3A]">Fatou, directrice d'école</h4>
                <div className="flex text-[#FFC107] text-sm mt-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
            <p className="text-[14px] font-medium text-[#7A7A95] leading-relaxed">
              "L'identité visuelle africaine valorise notre culture. Les enfants s'identifient aux mascottes. Je recommande vivement."
            </p>
          </Card>

        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="max-w-[1280px] mx-auto px-6 py-[64px] border-t-2 border-neutral-100">
        <div className="text-center mb-[64px]">
          <h2 className="text-[32px] md:text-[48px] font-bold text-[#1C1C3A]">
            Nos Tarifs Simples
          </h2>
          <p className="text-[18px] font-normal text-[#7A7A95] mt-2 max-w-xl mx-auto">
            Sans engagement. Annulez à tout moment. Paiement par Mobile Money (Orange Money/Moov Money) disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] items-stretch max-w-5xl mx-auto">
          
          {/* Plan Free */}
          <div className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Gratuit</h3>
              <div className="text-[38px] font-black mt-3">0 FCFA</div>
              <ul className="text-[14px] font-medium text-[#7A7A95] flex flex-col gap-3 mt-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#25C26E] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#25C26E]" />
                  </div>
                  5 étoiles offertes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#25C26E] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#25C26E]" />
                  </div>
                  Coloriages classiques
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#25C26E] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#25C26E]" />
                  </div>
                  Filigrane sur les PDF
                </li>
              </ul>
            </div>
            <Button onClick={() => router.push("/login?tab=signup")} className="w-full h-[56px] border-2 border-[#1C1C3A] rounded-[24px] font-bold text-sm mt-8 bg-neutral-50 hover:bg-neutral-100 text-[#1C1C3A] cursor-pointer">
              {lang === "fr" ? "Commencer" : "Start Free"}
            </Button>
          </div>

          {/* Plan Premium (Highlighted) */}
          <div className="bg-white border-4 border-[#6D4CFF] rounded-[24px] p-8 shadow-xl flex flex-col justify-between relative scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6D4CFF] text-white px-3 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
              {lang === "fr" ? "Recommandé" : "Best Value"}
            </div>
            <div>
              <h3 className="text-xs font-black text-[#6D4CFF] uppercase tracking-widest">Premium</h3>
              <div className="text-[38px] font-black mt-3">3 500 FCFA <span className="text-xs font-bold text-slate-400">/ mois</span></div>
              <ul className="text-[14px] font-medium text-[#7A7A95] flex flex-col gap-3 mt-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6D4CFF] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#6D4CFF]" />
                  </div>
                  Étoiles IA illimitées
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6D4CFF] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#6D4CFF]" />
                  </div>
                  Livres personnalisés illimités
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6D4CFF] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#6D4CFF]" />
                  </div>
                  Téléchargements HD sans filigrane
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6D4CFF] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#6D4CFF]" />
                  </div>
                  Jusqu'à 3 profils enfants
                </li>
              </ul>
            </div>
            <Button onClick={() => router.push("/login")} className="w-full h-[56px] border-2 border-[#1C1C3A] rounded-[24px] font-bold text-sm mt-8 bg-[#6D4CFF] text-white hover:bg-[#5735E2] cursor-pointer">
              {lang === "fr" ? "S'abonner" : "Subscribe"}
            </Button>
          </div>

          {/* Plan School */}
          <div className="bg-white border-2 border-[#1C1C3A] rounded-[24px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-[#25C26E] uppercase tracking-widest font-poppins">Écoles</h3>
              <div className="text-[38px] font-black mt-3">20 000 FCFA <span className="text-xs font-bold text-slate-400">/ mois</span></div>
              <ul className="text-[14px] font-medium text-[#7A7A95] flex flex-col gap-3 mt-8">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#25C26E] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#25C26E]" />
                  </div>
                  Étoiles illimitées pour la classe
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#25C26E] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#25C26E]" />
                  </div>
                  Tableau de bord enseignant
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#25C26E] shrink-0 border border-neutral-100">
                    <Star className="w-3 h-3 fill-[#25C26E]" />
                  </div>
                  Impression en volume optimisée
                </li>
              </ul>
            </div>
            <Button onClick={() => router.push("/school")} className="w-full h-[56px] border-2 border-[#1C1C3A] rounded-[24px] font-bold text-sm mt-8 bg-[#E0F2FE] hover:bg-[#E0F2FE]/90 text-[#1C1C3A] cursor-pointer">
              {lang === "fr" ? "Découvrir l'Espace École" : "Discover Schools"}
            </Button>
          </div>

        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-[64px]">
        <h2 className="text-[32px] font-bold text-[#1C1C3A] text-center mb-8">FAQ</h2>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="bg-white border-2 border-[#1C1C3A] rounded-[24px] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 font-bold text-left flex items-center justify-between hover:bg-neutral-50 cursor-pointer text-sm md:text-base text-[#1C1C3A]"
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

      {/* --- 7. CTA SECTION --- */}
      <section className="max-w-[1200px] mx-auto px-6 py-[64px]">
        <div className="bg-gradient-to-tr from-[#6D4CFF] to-[#FFA726] rounded-[24px] border-4 border-[#1C1C3A] p-8 md:p-12 shadow-[8px_8px_0px_0px_#1C1C3A] relative overflow-hidden flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6 text-white relative z-10">
            <h2 className="text-[32px] md:text-[48px] font-bold text-white leading-tight">
              Prêt à éveiller la créativité de votre enfant ?
            </h2>
            <p className="text-sm font-bold text-white/90">
              Rejoignez des milliers de familles qui font déjà confiance à Petit Baobab au Burkina Faso et en Afrique de l'Ouest.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => router.push("/login?tab=signup")} className="h-[56px] px-8 bg-[#FFC107] hover:bg-[#E3AF2B] text-[#1C1C3A] border-2 border-[#1C1C3A] rounded-[24px] font-bold text-sm shadow-[4px_4px_0px_0px_#1C1C3A] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1C1C3A] transition-all cursor-pointer">
                Créer gratuitement
              </Button>
              <Button onClick={() => {
                const element = document.getElementById("pricing")
                element?.scrollIntoView({ behavior: "smooth" })
              }} className="h-[56px] px-8 bg-white border-2 border-[#1C1C3A] text-[#1C1C3A] rounded-[24px] font-bold text-sm shadow-[4px_4px_0px_0px_#1C1C3A] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1C1C3A] transition-all cursor-pointer">
                Voir les tarifs
              </Button>
            </div>
            <span className="text-xs font-semibold text-white/80">Aucune carte bancaire requise</span>
          </div>

          {/* Right Column (Fixed child illustration) */}
          <div className="flex justify-center relative z-10 shrink-0">
            <div className="w-[280px] md:w-[320px] h-[280px] md:h-[320px] relative overflow-hidden bg-white border-4 border-[#1C1C3A] rounded-[24px] shadow-[6px_6px_0px_0px_#1C1C3A] shrink-0">
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

      {/* --- 8. FOOTER --- */}
      <footer className="border-t-2 border-neutral-100 max-w-[1280px] mx-auto px-6 pt-16 pb-8 mt-12 flex flex-col gap-12 relative">
        
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
          
          {/* Logo & Description */}
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
              <a href="#" className="hover:text-[#6D4CFF] transition-colors font-extrabold text-xs">FB</a>
              <a href="#" className="hover:text-[#6D4CFF] transition-colors font-extrabold text-xs">IG</a>
              <a href="#" className="hover:text-[#6D4CFF] transition-colors font-extrabold text-xs">YT</a>
              <a href="#" className="hover:text-[#6D4CFF] transition-colors font-extrabold text-xs">TK</a>
            </div>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3 text-xs font-bold text-[#7A7A95]">
            <h4 className="text-[13px] font-black text-[#1C1C3A] uppercase tracking-wider mb-2">Produit</h4>
            <a href="#features" className="hover:text-[#6D4CFF] transition-colors">Coloriages</a>
            <a href="#books" className="hover:text-[#6D4CFF] transition-colors">Livres</a>
            <a href="#games" className="hover:text-[#6D4CFF] transition-colors">Jeux éducatifs</a>
            <a href="#stories" className="hover:text-[#6D4CFF] transition-colors">Histoires</a>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3 text-xs font-bold text-[#7A7A95]">
            <h4 className="text-[13px] font-black text-[#1C1C3A] uppercase tracking-wider mb-2">Entreprise</h4>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">À propos</a>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Notre mission</a>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Blog</a>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Contact</a>
          </div>

          {/* Resources links */}
          <div className="flex flex-col gap-3 text-xs font-bold text-[#7A7A95]">
            <h4 className="text-[13px] font-black text-[#1C1C3A] uppercase tracking-wider mb-2">Ressources</h4>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Aide</a>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Guide parents</a>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-[#6D4CFF] transition-colors">Conditions</a>
          </div>

        </div>

        <div className="border-t border-neutral-100 pt-6 text-center text-[10px] font-extrabold text-[#7A7A95] relative z-10">
          © {new Date().getFullYear()} Petit Baobab. Tous droits réservés. Ouagadougou, Burkina Faso.
        </div>
      </footer>

    </div>
  )
}
