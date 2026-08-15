import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: {
    default: "Petit Baobab — L'univers créatif qui fait grandir les enfants",
    template: "%s | Petit Baobab",
  },
  description:
    "Petit Baobab aide les enfants à apprendre en s'amusant : coloriages, dessin magique, livres de coloriage personnalisés, histoires et jeux éducatifs inspirés de l'Afrique.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Petit Baobab — L'univers créatif qui fait grandir les enfants",
    description:
      "Coloriages, dessin magique, livres de coloriage personnalisés, histoires et jeux éducatifs inspirés de l'Afrique.",
    url: "/",
    siteName: "Petit Baobab",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petit Baobab — L'univers créatif qui fait grandir les enfants",
    description:
      "Coloriages, dessin magique, livres de coloriage personnalisés, histoires et jeux éducatifs inspirés de l'Afrique.",
  },
};

export default function Page() {
  return <LandingPage />;
}
