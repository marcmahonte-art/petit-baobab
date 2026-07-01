"use client"

import { motion } from "framer-motion"
import {
  Palette,
  Bot,
  BookOpen,
  Gamepad2,
  BookHeart,
  Star,
} from "lucide-react"

const features = [
  {
    icon: Palette,
    color: "#7D6AF8",
    title: "Coloriages uniques",
    desc: "Des centaines de dessins inspirés de l'Afrique.",
  },
  {
    icon: Bot,
    color: "#20C997",
    title: "Dessin magique",
    desc: "Transforme tes idées en coloriages.",
  },
  {
    icon: BookOpen,
    color: "#FFB300",
    title: "Livres personnalisés",
    desc: "Crée ton propre livre de coloriage.",
  },
  {
    icon: Gamepad2,
    color: "#1194FF",
    title: "Jeux éducatifs",
    desc: "Apprends en jouant avec des jeux amusants.",
  },
  {
    icon: BookHeart,
    color: "#FF5E83",
    title: "Histoires captivantes",
    desc: "Lis des histoires qui éveillent l'imagination.",
  },
  {
    icon: Star,
    color: "#FFD95C",
    title: "Récompenses",
    desc: "Gagne des badges et progresse.",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function FeatureStrip() {
  return (
    <section id="features" className="max-w-[1280px] mx-auto px-6 lg:px-10 mt-16">
      <motion.div
        className="bg-white rounded-3xl shadow-card py-10 px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            className="flex flex-col items-center text-center gap-3 group cursor-pointer"
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center transition-shadow duration-200"
              style={{ backgroundColor: feature.color }}
            >
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1A1A2E]">
              {feature.title}
            </h3>
            <p className="text-[13px] text-[#6B6B7B] leading-snug max-w-[140px]">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
