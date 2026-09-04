"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function PricingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Combien de temps sont valables mes étoiles ?",
      answer:
        "Sur la formule Découverte, vos étoiles n'ont aucune date d'expiration : vous les utilisez à votre propre rythme, quand votre enfant en a envie ! Pour la formule Super Baobab et l'espace École, votre quota d'étoiles est renouvelé chaque mois pour stimuler la créativité en continu.",
    },
    {
      question: "Comment fonctionne le paiement par Orange Money et Moov Money ?",
      answer:
        "Le paiement est 100% simple, local et sécurisé. Lors de la commande, vous indiquez votre numéro de téléphone et vous recevez un message de confirmation sécurisé sur votre mobile pour valider la transaction. Aucune carte bancaire n'est nécessaire.",
    },
    {
      question: "Puis-je utiliser mon compte sur plusieurs appareils (tablette, téléphone) ?",
      answer:
        "Absolument ! Votre compte Petit Baobab est synchronisé dans le cloud. Vous pouvez vous connecter depuis le smartphone des parents, la tablette familiale ou un ordinateur portable : vos étoiles et vos livres de coloriage sont toujours disponibles.",
    },
    {
      question: "Quelle est la particularité de la formule École / Pro ?",
      answer:
        "La formule École / Pro est spécialement calibrée pour les écoles, éducatrices, maternelles et ateliers d'apprentissage. Elle comprend un volume de 1 000 étoiles mensuelles, la gestion multi-utilisateurs pour les classes, un tableau de bord et un support prioritaire pour les enseignants.",
    },
    {
      question: "Que se passe-t-il si la génération d'un dessin rencontre un problème ?",
      answer:
        "Aucune inquiétude ! Si une génération est interrompue ou échoue en raison de la connexion, vos étoiles sont automatiquement et immédiatement recréditées sur votre compte.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full mt-16 md:mt-24">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4E5] border border-[#FFE2BE] text-[#835400] text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-4 h-4 text-[#FFAE2E]" />
          <span>Foire Aux Questions</span>
        </div>
        <h2 className="text-[26px] sm:text-[32px] md:text-[38px] font-extrabold text-[#26190B] tracking-tight">
          Questions fréquentes sur nos formules
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[#736355] mt-2 font-medium">
          Tout ce que vous devez savoir pour choisir la formule idéale pour votre famille ou votre école.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={`rounded-[22px] border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-white border-[#FFAE2E]/60 shadow-[0_10px_25px_rgba(255,174,46,0.12)]"
                  : "bg-white/80 border-[#F0E4D4] hover:border-[#FFAE2E]/30 hover:bg-white"
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <span className="text-[15px] sm:text-[17px] font-extrabold text-[#26190B]">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? "bg-[#FFAE2E] text-[#26190B] rotate-180"
                      : "bg-[#FFF4E5] text-[#835400]"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-1 text-[14px] sm:text-[15px] leading-relaxed text-[#5A4838] border-t border-[#F8EFE4]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Bloc contact WhatsApp direct */}
      <div className="max-w-3xl mx-auto mt-8 p-6 sm:p-7 rounded-[26px] bg-gradient-to-r from-[#E7F6ED] to-[#F1F9F4] border border-[#C5E8D3] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#008560] text-white flex items-center justify-center shrink-0 shadow-md">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[16px] sm:text-[17px] font-extrabold text-[#003827]">
              Une question spécifique ou besoin d'un devis scolaire ?
            </h4>
            <p className="text-xs sm:text-[13px] text-[#2F614E] font-medium mt-0.5">
              Notre équipe d'assistance est joignable directement sur WhatsApp avec le sourire.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/22600000000?text=Bonjour%20Petit%20Baobab%2C%20j%27ai%20une%20question%20sur%20vos%20formules%20de%20tarifs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#008560] text-white font-extrabold text-xs sm:text-sm hover:bg-[#006E50] transition-colors shrink-0 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#7DF9C6]" />
          <span>Discuter sur WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
