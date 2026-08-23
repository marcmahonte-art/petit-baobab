"use client";

import Link from "next/link";
import { Header } from "@/components/landing/Header";
import MainFooter from "@/components/landing/MainFooter";

const FEATURES = [
  {
    title: "Coloriages IA",
    desc: "Des coloriages générés à partir des dessins et de la culture de l'enfant.",
    color: "bg-[#7D6AF8]/10",
    icon: "/illustrations/coloriages.png",
  },
  {
    title: "Histoires personnalisées",
    desc: "Des livres et histoires où l'enfant devient le héros de l'aventure.",
    color: "bg-[#20C997]/10",
    icon: "/illustrations/histoires.png",
  },
  {
    title: "Dessin magique",
    desc: "L'enfant dessine, l'IA donne vie à ses créations.",
    color: "bg-[#FF5E83]/10",
    icon: "/illustrations/marqueur-ia.png",
  },
  {
    title: "Suivi des progrès",
    desc: "Parents et enseignants suivent l'évolution et les récompenses.",
    color: "bg-[#FFB300]/10",
    icon: "/illustrations/suivi-progres.png",
  },
  {
    title: "Espace école",
    desc: "Tableau de bord enseignant, classes, élèves et consommation des étoiles.",
    color: "bg-[#1194FF]/10",
    icon: "/illustrations/ecoles.png",
  },
  {
    title: "Boutique",
    desc: "Livres et ressources imprimables à acheter et télécharger.",
    color: "bg-[#1D9E75]/10",
    icon: "/illustrations/boutiques.png",
  },
];

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <Header />
      <main>
        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Tout ce que Petit Baobab offre
          </h1>
          <p className="text-[#3B2416]/70 mt-4 max-w-2xl mx-auto">
            Un univers créatif pour faire grandir les enfants — à la maison comme à l'école.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-white rounded-[24px] border border-[#F1ECE5] p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center"
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${f.color} ring-4 ring-white shadow-lg`}
              >
                <img
                  src={f.icon}
                  alt={f.title}
                  className="w-14 h-14 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <h3 className="text-xl font-extrabold mb-2">{f.title}</h3>
              <p className="text-sm text-[#3B2416]/70 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/signup"
            className="inline-flex px-8 py-4 bg-[#7D6AF8] text-white font-bold rounded-[12px] hover:bg-[#6552E8] transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>
      </main>
      <MainFooter />
    </div>
  );
}
