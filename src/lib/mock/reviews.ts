import { Review } from "./types";

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    author: "Fatou K.",
    rating: 5,
    date: "14 Juillet 2026",
    comment: "Mes enfants adorent ! La qualité du PDF à imprimer est fantastique et les illustrations sont magnifiques.",
    verified: true,
  },
  {
    id: "rev-2",
    productId: "prod-1",
    author: "Mamadou D.",
    rating: 5,
    date: "02 Juin 2026",
    comment: "Téléchargement immédiat et très fluide. Très content de voir nos animaux africains mis à l'honneur.",
    verified: true,
  },
  {
    id: "rev-3",
    productId: "prod-2",
    author: "Aïcha S.",
    rating: 4,
    date: "20 Mai 2026",
    comment: "Très bon exercice pour l'apprentissage des chiffres avec mon fils de 5 ans.",
    verified: true,
  },
  {
    id: "rev-4",
    productId: "prod-4",
    author: "Koffi B.",
    rating: 5,
    date: "18 Juillet 2026",
    comment: "T-shirt reçu très rapidement à Abidjan. La qualité du coton est au top !",
    verified: true,
  },
];
