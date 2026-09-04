"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Check,
  Star,
  Sparkles,
  Zap,
  ShieldCheck,
  Smile,
  ArrowRight,
  Heart,
  School,
  Compass,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  price: string;
  period: string;
  credits: string;
  creditsLabel: string;
  features: string[];
  isPopular?: boolean;
  theme: "purple" | "amber" | "green";
  icon: typeof Compass;
  ctaText: string;
  space: "family" | "school";
}

export function PricingPageContent() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const plans: PlanItem[] = [
    {
      id: "decouverte",
      name: "Découverte",
      tagline: "Pour débuter et explorer en toute liberté",
      badge: "Paiement unique",
      price: "2 000 FCFA",
      period: "Paiement unique · Sans engagement",
      credits: "100",
      creditsLabel: "étoiles incluses",
      icon: Compass,
      ctaText: "Choisir Découverte",
      space: "family",
      features: [
        "100 étoiles à utiliser quand vous voulez",
        "Tous les styles de dessin",
        "Livres",
        "Téléchargement de vos créations",
        "Aucun délai d'expiration",
      ],
      theme: "purple",
    },
    {
      id: "super-baobab",
      name: "Super Baobab",
      tagline: "La formule préférée pour des créations infinies",
      badge: "Coup de cœur des familles",
      price: "4 500 FCFA",
      period: "/ mois (3 mois · 13 500 FCFA)",
      credits: "250",
      creditsLabel: "étoiles incluses / mois",
      icon: Heart,
      ctaText: "Choisir Super Baobab",
      space: "family",
      isPopular: true,
      features: [
        "250 étoiles à utiliser par mois",
        "Disponible en 3 mois (13 500 FCFA)",
        "Tous les styles de dessin",
        "Livres",
        "Téléchargement de vos créations",
        "Meilleur rapport qualité / prix",
      ],
      theme: "amber",
    },
    {
      id: "ecole-pro",
      name: "École / Pro",
      tagline: "Conçu pour les classes, ateliers & enseignants",
      badge: "Pour les éducateurs",
      price: "Sur devis",
      period: "Formule sur-mesure pour vos classes",
      credits: "Sur-mesure",
      creditsLabel: "étoiles adaptées à vos besoins",
      icon: School,
      ctaText: "Demander un devis",
      space: "school",
      features: [
        "Volume d'étoiles adapté à votre établissement",
        "Tous les styles de dessin",
        "Livres et jeux complets",
        "Téléchargement illimité",
        "Gestion multi-utilisateurs pour vos classes",
        "Support prioritaire & accompagnement dédié",
      ],
      theme: "green",
    },
  ];

  const handleChoose = (plan: PlanItem) => {
    if (plan.id === "ecole-pro") {
      window.open(
        "https://wa.me/22664556565?text=" +
          encodeURIComponent(
            "Bonjour Petit Baobab, je souhaite obtenir un devis pour la formule École / Pro pour mon établissement."
          ),
        "_blank"
      );
    } else if (plan.space === "school") {
      router.push("/signup?space=school");
    } else {
      router.push("/signup?space=family");
    }
  };

  return (
    <div className="w-full">
      {/* Container principal des tarifs */}
      <section className="relative w-full rounded-[32px] md:rounded-[40px] border border-[#F0E4D4] bg-white/95 backdrop-blur-sm p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_rgba(38,25,11,0.06)] overflow-hidden">
        {/* Halo décoratif d'arrière-plan */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFAE2E]/10 via-[#4A4EBE]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#008560]/10 via-[#FFAE2E]/5 to-transparent blur-3xl pointer-events-none" />

        {/* Mascotte / Illustration flottante */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-6 right-8 z-20 w-[180px] lg:w-[260px] xl:w-[290px] hidden md:block pointer-events-none drop-shadow-md"
        >
          <Image
            src="/illustrations/pricing_illustration.webp"
            alt="Illustration Petit Baobab"
            width={320}
            height={220}
            className="w-full h-auto object-contain"
            priority
          />
        </motion.div>

        {/* Titre de section */}
        <div className="w-full md:max-w-[70%] lg:max-w-[65%] mb-10 md:mb-14 text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4E5] border border-[#FFE2BE] text-[#835400] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FFAE2E]" />
            <span>Formules souples & transparentes</span>
          </div>
          <h2 className="text-[26px] sm:text-[32px] md:text-[40px] font-extrabold text-[#26190B] tracking-tight leading-[1.18]">
            Choisissez le plan qui vous convient
          </h2>
          <p className="text-[16px] md:text-[18px] font-bold text-[#D97706] mt-2.5 flex items-center gap-2">
            <span>Plus de créations, plus de styles, plus de possibilités !</span>
            <Smile className="w-5 h-5 inline text-[#D97706] shrink-0" />
          </p>
        </div>

        {/* Grille des 3 cartes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch justify-items-center relative z-10">
          {plans.map((plan, idx) => {
            const isPop = plan.isPopular;
            const isHovered = hoveredCard === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                onMouseEnter={() => setHoveredCard(plan.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative w-full max-w-[390px] rounded-[26px] md:rounded-[30px] p-6 sm:p-7 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPop
                    ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFF8EE] border-2 border-[#FFAE2E] shadow-[0_16px_36px_rgba(255,174,46,0.22)] ring-4 ring-[#FFAE2E]/10 lg:-translate-y-2"
                    : plan.theme === "purple"
                    ? "bg-white border border-[#E7E3FA] shadow-[0_10px_28px_rgba(74,78,190,0.06)] hover:border-[#6368D9]/40 hover:shadow-[0_16px_36px_rgba(74,78,190,0.12)]"
                    : "bg-white border border-[#D9EFE3] shadow-[0_10px_28px_rgba(0,133,96,0.06)] hover:border-[#008560]/40 hover:shadow-[0_16px_36px_rgba(0,133,96,0.12)]"
                }`}
              >
                {/* Badge populaire ou catégorie */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${
                      isPop
                        ? "bg-[#FFAE2E] text-[#26190B] shadow-sm"
                        : plan.theme === "purple"
                        ? "bg-[#EFEFFA] text-[#4A4EBE]"
                        : "bg-[#E7F6ED] text-[#00694B]"
                    }`}
                  >
                    {isPop ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-[#26190B] text-[#26190B]" />
                        <span>{plan.badge}</span>
                      </>
                    ) : (
                      <span>{plan.badge}</span>
                    )}
                  </span>

                  {/* Icône thématique */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPop
                        ? "bg-[#FFE8BF] text-[#835400]"
                        : plan.theme === "purple"
                        ? "bg-[#EFEFFA] text-[#4A4EBE]"
                        : "bg-[#E7F6ED] text-[#00694B]"
                    }`}
                  >
                    <plan.icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Nom & Prix */}
                <div>
                  <h3 className="text-[22px] sm:text-[24px] font-black text-[#26190B] tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-[13px] font-medium text-[#736355] mt-1 line-clamp-1">
                    {plan.tagline}
                  </p>

                  <div className="mt-5 mb-4 pb-5 border-b border-[#F2E8DC]">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[32px] sm:text-[36px] font-black text-[#26190B] tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#8C7665]">
                      {plan.period}
                    </span>
                  </div>

                  {/* Badge d'étoiles / crédits - Chunky & Tactile */}
                  <div
                    className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold shadow-sm transition-transform ${
                      isPop
                        ? "bg-gradient-to-r from-[#FFAE2E] to-[#FF9300] text-[#26190B]"
                        : plan.theme === "purple"
                        ? "bg-[#4A4EBE] text-white"
                        : "bg-[#008560] text-white"
                    } ${isHovered ? "scale-[1.02]" : ""}`}
                  >
                    <span className="text-base sm:text-lg font-black">{plan.credits}</span>
                    <Star className="w-4 h-4 fill-current shrink-0 animate-pulse" />
                    <span>{plan.creditsLabel}</span>
                  </div>
                </div>

                {/* Liste des fonctionnalités */}
                <div className="my-6 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#A18F80] mb-3">
                    Ce qui est inclus :
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => {
                      const isHighlight =
                        feature.includes("Meilleur rapport") ||
                        feature.includes("Aucun délai");

                      return (
                        <li key={i} className="flex items-start gap-3 text-left">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isPop
                                ? "bg-[#FFAE2E]/20 text-[#835400]"
                                : plan.theme === "purple"
                                ? "bg-[#4A4EBE]/15 text-[#4A4EBE]"
                                : "bg-[#008560]/15 text-[#00694B]"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                          </div>
                          <span
                            className={`text-[13px] leading-snug font-medium ${
                              isHighlight
                                ? "font-bold text-[#26190B]"
                                : "text-[#4A3B30]"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Bouton d'action */}
                <div className="w-full pt-2">
                  <button
                    onClick={() => handleChoose(plan)}
                    className={`w-full h-[52px] rounded-2xl font-extrabold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 transform active:scale-98 shadow-sm ${
                      isPop
                        ? "bg-[#26190B] text-white hover:bg-[#3C2E1E] hover:shadow-lg shadow-[#26190B]/15"
                        : plan.theme === "purple"
                        ? "bg-[#4A4EBE] text-white hover:bg-[#3A3EA3] hover:shadow-lg shadow-[#4A4EBE]/20"
                        : "bg-[#008560] text-white hover:bg-[#006E50] hover:shadow-lg shadow-[#008560]/20"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="text-[11px] text-center font-medium text-[#8C7665] mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                    {plan.space === "school" ? (
                      <span>Accompagnement personnalisé · Devis sur-mesure</span>
                    ) : (
                      <>
                        <span>Paiement sécurisé :</span>
                        <span className="inline-flex items-center gap-1 bg-[#FFF9F2] px-1.5 py-0.5 rounded border border-[#FFE2BE]">
                          <Image
                            src="/payments/orange-money.png"
                            alt="Orange Money"
                            width={16}
                            height={16}
                            className="h-3.5 w-auto object-contain inline"
                          />
                          <span className="text-[10px] font-bold text-[#D97706]">Orange</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[#F0F8FD] px-1.5 py-0.5 rounded border border-[#D0E6F8]">
                          <Image
                            src="/payments/moov-money.png"
                            alt="Moov Money"
                            width={16}
                            height={16}
                            className="h-3.5 w-auto object-contain inline"
                          />
                          <span className="text-[10px] font-bold text-[#0C447C]">Moov</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bandeau de réassurance paiement intégré */}
        <div className="mt-12 pt-8 border-t border-[#F2E8DC] flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm text-[#736355]">
          <div className="flex items-center gap-2 font-bold text-[#26190B]">
            <ShieldCheck className="w-5 h-5 text-[#008560]" />
            <span>Paiement 100% sécurisé sans carte bancaire</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#FFE2BE] shadow-2xs">
              <Image
                src="/payments/orange-money.png"
                alt="Orange Money"
                width={26}
                height={20}
                className="h-5 w-auto object-contain"
              />
              <span className="font-extrabold text-xs text-[#D97706]">Orange Money</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#D0E6F8] shadow-2xs">
              <Image
                src="/payments/moov-money.png"
                alt="Moov Money"
                width={26}
                height={20}
                className="h-5 w-auto object-contain"
              />
              <span className="font-extrabold text-xs text-[#0C447C]">Moov Money</span>
            </div>
            <span className="hidden sm:inline-block font-semibold text-[#8C7665]">
              · Activation instantanée de vos étoiles
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
