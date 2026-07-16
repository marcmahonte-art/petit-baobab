import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dessin Magique - Petit Baobab",
  description:
    "Génère des dessins à colorier par IA pour les enfants de 3 à 7 ans. Décris ce que tu imagines et Petit Baobab crée un dessin magique !",
  openGraph: {
    title: "Dessin Magique - Petit Baobab",
    description:
      "Génère des dessins à colorier par IA pour les enfants de 3 à 7 ans.",
  },
};

export default function MagicDrawingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
