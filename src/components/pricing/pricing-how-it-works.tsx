"use client";

import { motion } from "framer-motion";
import { Gift, Palette, Sparkles, RotateCcw, Smartphone, CheckCircle2 } from "lucide-react";

export function PricingHowItWorks() {
  const steps = [
    {
      icon: Palette,
      title: "Choisissez votre style",
      desc: "Chaque style s'adapte à l'âge : Contour simple (1 étoile), Aventure illustrée (3 étoiles) ou Scène 3D magique (6 étoiles).",
      themeColor: "text-[#4A4EBE]",
      bgColor: "bg-[#EFEFFA]",
      badge: "Étape 1",
    },
    {
      icon: Sparkles,
      title: "Générez en quelques secondes",
      desc: "Tapez une idée ou choisissez un thème : l'IA bienveillante compose une page de coloriage prête à imprimer ou colorier en ligne.",
      themeColor: "text-[#D97706]",
      bgColor: "bg-[#FFF4E5]",
      badge: "Étape 2",
    },
    {
      icon: RotateCcw,
      title: "Remboursement automatique",
      desc: "Si une génération est interrompue par une perte de réseau, vos étoiles sont recréditées immédiatement sans démarche.",
      themeColor: "text-[#008560]",
      bgColor: "bg-[#E7F6ED]",
      badge: "Garantie",
    },
    {
      icon: Smartphone,
      title: "Paiement Mobile Money",
      desc: "Rechargez en 30 secondes via Orange Money ou Moov Money directement avec votre numéro de téléphone habituel.",
      themeColor: "text-[#C026D3]",
      bgColor: "bg-[#FAE8FF]",
      badge: "Local & Simple",
    },
  ];

  return (
    <div className="w-full mt-14 md:mt-20 space-y-12">
      {/* Bannière Plan Gratuit Inclus */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="w-full p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-[#FFF4E5] via-[#FFFDF8] to-[#FFF1E7] border-2 border-[#FFE2BE] shadow-[0_12px_30px_rgba(255,174,46,0.12)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFAE2E] to-[#FF9300] text-[#26190B] flex items-center justify-center shrink-0 shadow-md">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFAE2E]/20 text-[#835400] text-xs font-black uppercase tracking-wide mb-1">
              <span>🎁 Plan Gratuit Inclus pour tous</span>
            </div>
            <h3 className="text-[18px] sm:text-[20px] font-black text-[#26190B]">
              3 coloriages magiques offerts chaque jour à votre enfant
            </h3>
            <p className="text-xs sm:text-[14px] text-[#736355] font-medium mt-1 max-w-2xl leading-relaxed">
              Pour découvrir la magie de Petit Baobab sans dépenser 1 FCFA. Les 3 créations quotidiennes (style Contour simple) se réinitialisent automatiquement chaque nuit à minuit GMT. Aucune carte bancaire requise !
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="px-4 py-2.5 rounded-xl bg-white text-[#26190B] font-extrabold text-xs sm:text-sm border border-[#FFE2BE] shadow-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#008560]" />
            <span>0 FCFA pour tester</span>
          </span>
        </div>
      </motion.div>

      {/* Comment fonctionnent les étoiles */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FFAE2E]">
            Simplicité & Transparence
          </span>
          <h3 className="text-[24px] sm:text-[30px] font-extrabold text-[#26190B] tracking-tight mt-1">
            Comment fonctionnent vos étoiles ?
          </h3>
          <p className="text-xs sm:text-sm text-[#736355] font-medium mt-1.5">
            Une utilisation fluide, intuitive et pensée pour les familles et les éducateurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="p-5 sm:p-6 rounded-[24px] bg-white border border-[#F0E4D4] shadow-[0_6px_20px_rgba(38,25,11,0.03)] hover:border-[#FFAE2E]/40 hover:shadow-[0_12px_28px_rgba(38,25,11,0.08)] transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl ${step.bgColor} ${step.themeColor} flex items-center justify-center shadow-xs`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A18F80] bg-[#F7EFE6] px-2.5 py-1 rounded-full">
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-[15px] sm:text-[16px] font-extrabold text-[#26190B] mb-1.5">
                  {step.title}
                </h4>
                <p className="text-xs text-[#736355] leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
