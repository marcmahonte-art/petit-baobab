// Données produits mockées pour la boutique publique Petit Baobab.
// Aucune connexion Supabase à cette étape — données statiques uniquement.
// Le futur parcours d'achat (checkout invité + facture + lien de téléchargement
// par email/WhatsApp) viendra remplacer/étendre ce fichier.

export type ProductCategory =
  | "Livres de coloriage"
  | "Color by Number"
  | "Color by Code"
  | "T-shirt"
  | "Sticker";

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  categoryLabel: string; // libellé court affiché en badge
  image: string;
  price: number; // en FCFA
  rating: number; // sur 5
  description?: string;
}

export interface CategoryCard {
  id: string;
  title: string;
  description: string;
  image: string;
  /** Couleur d'accent de la carte (de la palette du site). */
  accent: "purple" | "green" | "orange" | "pink" | "blue";
  cta: string;
  href: string;
}

// Cartes catégories (hero de la boutique)
export const shopCategories: CategoryCard[] = [
  {
    id: "livres-coloriage",
    title: "Livres de coloriage",
    description: "Des univers à colorier,创造力 et à raconter.",
    image: "/illustrations/Collection-livres.webp",
    accent: "purple",
    cta: "Découvrir",
    href: "/boutique#produits",
  },
  {
    id: "color-by-number",
    title: "Color by Number",
    description: "Apprenez les chiffres en coloriant.",
    image: "/illustrations/coloring-balafon.png",
    accent: "green",
    cta: "Voir les livres",
    href: "/boutique#produits",
  },
  {
    id: "color-by-code",
    title: "Color by Code",
    description: "Associez lettres et couleurs en douceur.",
    image: "/illustrations/coloring-baobab.png",
    accent: "orange",
    cta: "Explorer",
    href: "/boutique#produits",
  },
  {
    id: "t-shirts",
    title: "T-shirts",
    description: "Le monde Petit Baobab à porter.",
    image: "/illustrations/logo-petit-baobab.png",
    accent: "pink",
    cta: "Acheter",
    href: "/boutique#produits",
  },
  {
    id: "stickers",
    title: "Stickers",
    description: "Les mascottes en autocollants.",
    image: "/illustrations/mascots/baobab-guide.png",
    accent: "blue",
    cta: "Voir les stickers",
    href: "/boutique#produits",
  },
];

// Produits populaires (grille)
export const popularProducts: Product[] = [
  {
    id: "dinosaures",
    title: "Dinosaures",
    category: "Color by Number",
    categoryLabel: "Color by Number",
    image: "/illustrations/coloring-balafon.png",
    price: 2500,
    rating: 4.8,
    description: "DINOSAURES COLOR BY NUMBER",
  },
  {
    id: "animaux-ferme",
    title: "Animaux de la ferme",
    category: "Color by Code",
    categoryLabel: "Color by Code",
    image: "/illustrations/coloring-baobab.png",
    price: 2000,
    rating: 4.6,
    description: "LES ANIMAUX DE LA FERME",
  },
  {
    id: "princesses-africaines",
    title: "Princesses africaines",
    category: "Livres de coloriage",
    categoryLabel: "Livre de coloriage",
    image: "/illustrations/Collection-livres.webp",
    price: 2500,
    rating: 5.0,
    description: "PRINCESSES AFRICAINES",
  },
  {
    id: "t-shirt-lionceau",
    title: "T-shirt Lionceau",
    category: "T-shirt",
    categoryLabel: "T-shirt",
    image: "/illustrations/logo-petit-baobab.png",
    price: 4500,
    rating: 4.7,
    description: "T-shirt blanc motif lionceau",
  },
  {
    id: "stickers-animaux",
    title: "Stickers Animaux",
    category: "Sticker",
    categoryLabel: "Sticker",
    image: "/illustrations/mascots/baobab-guide.png",
    price: 1500,
    rating: 4.9,
    description: "Planche d'autocollants animaux",
  },
  {
    id: "lettres-mots",
    title: "Lettres et mots",
    category: "Color by Code",
    categoryLabel: "Color by Code",
    image: "/illustrations/coloring-baobab.png",
    price: 2000,
    rating: 4.5,
    description: "LETTRES ET MOTS COLOR BY CODE",
  },
];

export function formatPriceFCFA(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
}
