// src/features/studio/components/StudioHero.tsx

"use client";
import React from "react";
import { motion } from "framer-motion";
import { CARD_IN } from "../animations";
import Link from "next/link";

/**
 * Hero section of the Studio – displays big cards for each type of creation.
 */
export function StudioHero() {
  const items = [
    { label: "Livre", icon: "📚", href: "/learn/studio/create?type=BOOK" },
    { label: "Coloriage", icon: "🎨", href: "/learn/studio/create?type=COLORING_BOOK" },
    { label: "Dessin magique", icon: "🤖", href: "/learn/studio/create?type=MAGIC_DRAWING" },
    { label: "Histoire", icon: "📖", href: "/learn/studio/create?type=STORY" },
    { label: "Jeux", icon: "🧩", href: "/learn/studio/create?type=COMIC" },
    { label: "Cahier scolaire", icon: "🎓", href: "/learn/studio/create?type=WORKSHEET" },
    { label: "Poster", icon: "🖼", href: "/learn/studio/create?type=POSTER" },
    { label: "Cartes", icon: "🧸", href: "/learn/studio/create?type=CARD" },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-[#FFF6E8] to-[#FFE08A]/20">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-gray-900 dark:text-gray-100">
          Bonjour ! Que veux‑tu créer aujourd’hui ?
        </h1>
        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
        >
          {items.map((it) => (
            <motion.div key={it.label} variants={CARD_IN} whileHover={{ scale: 1.05 }}>
              <Link href={it.href} className="flex h-full flex-col items-center justify-center rounded-2xl bg-white dark:bg-gray-800 p-4 shadow hover:shadow-lg">
                <span className="text-4xl" aria-hidden="true">{it.icon}</span>
                <span className="mt-2 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">{it.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
