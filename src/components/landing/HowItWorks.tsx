"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Download,
} from "lucide-react"
import Image from "next/image"

const steps = [
  {
    number: 1,
    color: "#7D6AF8",
    image: "/illustrations/enfant-Crayons de couleur.webp",
    title: "Choisis",
    desc: "Parmi des centaines de dessins.",
  },
  {
    number: 2,
    color: "#20C997",
    image: "/illustrations/book.webp",
    title: "Personnalise",
    desc: "Ton livre avec tes couleurs et ton style.",
  },
  {
    number: 3,
    color: "#FFB300",
    image: "/illustrations/Deux enfants lisant ensemble.webp",
    title: "Aperçois",
    desc: "Ton livre avant de le télécharger.",
  },
  {
    number: 4,
    color: "#20C997",
    icon: Download,
    title: "Télécharge",
    desc: "Ton livre ou demande une impression.",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function HowItWorks() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 text-center">
      <h2 className="text-display-md font-extrabold text-[#1A1A2E] mb-12">
        Comment ça marche ?
      </h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            className="flex flex-col items-center text-center relative"
            variants={stepVariants}
          >
            {/* Arrow connector */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-[70px] -right-3 z-10">
                <ArrowRight className="w-6 h-6 text-[#6B6B7B]" />
              </div>
            )}

            {/* Illustration */}
            <div className="relative w-[180px] h-[140px] rounded-2xl overflow-hidden bg-[#FFF9F2] border border-[#F0E7DA]">
              {step.icon ? (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: step.color }}>
                  <step.icon className="w-12 h-12 text-white" />
                </div>
              ) : (
                <Image
                  src={step.image!}
                  alt={step.title}
                  fill
                  className="object-cover"
                />
              )}
              {/* Number badge */}
              <div
                className="absolute -top-3 -left-3 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: step.color }}
              >
                {step.number}
              </div>
            </div>

            <h3 className="text-[17px] font-bold text-[#1A1A2E] mt-4">
              {step.title}
            </h3>
            <p className="text-[14px] text-[#6B6B7B] mt-1">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
