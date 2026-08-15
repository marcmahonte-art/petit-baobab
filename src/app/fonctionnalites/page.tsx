import type { Metadata } from "next";
import FonctionnalitesPage from "@/components/landing/FonctionnalitesPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fonctionnalités",
  description:
    "Découvrez les fonctionnalités de Petit Baobab : coloriages IA, histoires personnalisées, dessin magique, suivi des progrès, espace école et boutique.",
  alternates: { canonical: "/fonctionnalites" },
  openGraph: {
    title: "Fonctionnalités | Petit Baobab",
    description:
      "Coloriages IA, histoires personnalisées, dessin magique, suivi des progrès, espace école et boutique.",
    url: "/fonctionnalites",
    siteName: "Petit Baobab",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fonctionnalités | Petit Baobab",
    description:
      "Coloriages IA, histoires personnalisées, dessin magique, suivi des progrès, espace école et boutique.",
  },
};

export default function Page() {
  return <FonctionnalitesPage />;
}
