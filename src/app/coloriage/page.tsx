import type { Metadata } from "next";
import { ColoringPage } from "@/components/coloring-page";

export const metadata: Metadata = {
  title: "Coloriage",
  description:
    "Coloriez en ligne des dizaines de dessins inspirés de l'Afrique : animaux, contes et héros. L'univers créatif Petit Baobab pour les enfants.",
  alternates: { canonical: "/coloriage" },
  openGraph: {
    title: "Coloriage | Petit Baobab",
    description:
      "Coloriez en ligne des dizaines de dessins inspirés de l'Afrique : animaux, contes et héros.",
    url: "/coloriage",
  },
};

export default function ColoriagePage() {
  return <ColoringPage />;
}
