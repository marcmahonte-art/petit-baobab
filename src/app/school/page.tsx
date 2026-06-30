"use client"

import { useI18n } from "@/lib/i18n-provider"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Users,
  Layers,
  Printer,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Settings,
} from "lucide-react"
import Image from "next/image"

export default function SchoolSkeletonPage() {
  const router = useRouter()
  const { lang } = useI18n()

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] p-6 md:p-12 select-none relative overflow-hidden flex flex-col items-center">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#E0F2FE]/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-36 h-36 bg-[#FFE08A]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Back Button */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-bold text-sm text-[#7A6A5E] hover:text-[#3B2416] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "fr" ? "Retour à l'accueil" : "Back to Home"}</span>
        </button>

        <Image
          src="/illustrations/logo-petit-baobab.webp"
          alt="Petit Baobab"
          width={130}
          height={40}
          className="w-auto h-[35px] object-contain"
        />
      </div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white border-4 border-[#3B2416] rounded-[36px] shadow-[8px_8px_0px_0px_#3B2416] p-6 md:p-10 z-10"
      >
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-dashed border-[#3B2416] pb-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-[#E0F2FE] border-2 border-[#3B2416] flex items-center justify-center text-[#0284C7] shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#3B2416] leading-tight">
                {lang === "fr" ? "Espace École & Enseignants" : "Schools & Teachers Space"}
              </h1>
              <p className="text-sm font-bold text-[#7A6A5E] mt-1">
                {lang === "fr" 
                  ? "Découvrez la future plateforme de gestion scolaire de Petit Baobab." 
                  : "Discover the upcoming school management platform by Petit Baobab."}
              </p>
            </div>
          </div>
          <div className="bg-[#E0F2FE] border-2 border-[#3B2416] px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#0284C7] uppercase shadow-sm w-max self-start md:self-auto">
            {lang === "fr" ? "Bientôt disponible" : "Coming Soon"}
          </div>
        </div>

        {/* Feature Grid */}
        <h2 className="text-xl font-extrabold mb-6">
          {lang === "fr" ? "Fonctionnalités prêtes pour l'intégration :" : "Features ready for integration:"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1 */}
          <div className="border-2 border-[#3B2416] rounded-[24px] p-5 hover:bg-neutral-50 transition-colors flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border-2 border-[#3B2416] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] mb-1">{lang === "fr" ? "Gestion des Classes" : "Classroom Management"}</h3>
              <p className="text-xs text-[#7A6A5E] font-bold leading-normal">
                {lang === "fr"
                  ? "Créez vos sections et organisez vos classes (Petite, Moyenne et Grande section) en quelques clics."
                  : "Create your sections and organize your classes (Petite, Moyenne, and Grande section) in a few clicks."}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border-2 border-[#3B2416] rounded-[24px] p-5 hover:bg-neutral-50 transition-colors flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border-2 border-[#3B2416] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] mb-1">{lang === "fr" ? "Tableau de bord Enseignant" : "Teacher Dashboard"}</h3>
              <p className="text-xs text-[#7A6A5E] font-bold leading-normal">
                {lang === "fr"
                  ? "Suivez les progrès créatifs de vos élèves, débloquez des badges collectifs et accédez aux statistiques de classe."
                  : "Track your students' creative progress, unlock collective badges, and access classroom statistics."}
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border-2 border-[#3B2416] rounded-[24px] p-5 hover:bg-neutral-50 transition-colors flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border-2 border-[#3B2416] flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] mb-1">{lang === "fr" ? "Impressions en volume (Bulk A4)" : "Bulk Printing"}</h3>
              <p className="text-xs text-[#7A6A5E] font-bold leading-normal">
                {lang === "fr"
                  ? "Générez et compilez des cahiers d'activités complets pour toute la classe en une seule commande."
                  : "Generate and compile complete activity workbooks for the entire classroom in a single run."}
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="border-2 border-[#3B2416] rounded-[24px] p-5 hover:bg-neutral-50 transition-colors flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border-2 border-[#3B2416] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] mb-1">{lang === "fr" ? "Bibliothèque de Classe partagée" : "Shared Class Gallery"}</h3>
              <p className="text-xs text-[#7A6A5E] font-bold leading-normal">
                {lang === "fr"
                  ? "Exposez et projetez les coloriages des enfants lors d'ateliers d'art ou de lecture collective."
                  : "Showcase and project children's coloring pages during art workshops or group reading sessions."}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Alert Box */}
        <div className="bg-[#FFE08A]/15 border-2 border-[#FFE08A] rounded-[24px] p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-[#FFE08A] flex items-center justify-center text-[#3B2416] shrink-0 font-bold text-sm">💡</div>
          <div>
            <h4 className="font-extrabold text-sm mb-1">{lang === "fr" ? "Prêt pour les développements futurs" : "Ready for future integration"}</h4>
            <p className="text-xs text-[#7A6A5E] font-bold leading-normal">
              {lang === "fr"
                ? "L'architecture du dossier /school a été structurée pour isoler ces modules et accueillir les formulaires et les connexions enseignants sans impacter l'Espace Enfant ou le reste de l'application."
                : "The /school folder layout has been pre-structured to isolate these features, allowing future dashboard widgets and teacher accounts without affecting the Kid Workspace."}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="h-12 px-6 bg-white border-2 border-[#3B2416] rounded-xl font-bold text-xs shadow-[3px_3px_0px_0px_#3B2416] hover:bg-neutral-50 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#3B2416] transition-all cursor-pointer"
          >
            {lang === "fr" ? "Retour à l'accueil" : "Go to Home"}
          </button>
        </div>

      </motion.div>
    </div>
  )
}
