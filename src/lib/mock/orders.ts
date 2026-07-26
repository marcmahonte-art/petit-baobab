import { CartItem } from "./types";

export interface Order {
  order_number: string;
  date: string;
  items: CartItem[];
  total: number;
  totalHT: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
}

export const MOCK_ORDERS: Order[] = [
  {
    order_number: "PB-2026-89412",
    date: new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    items: [
      {
        product: {
          id: "prod-1",
          slug: "les-animaux-de-la-savane-africaine",
          title: "Les Animaux de la Savane Africaine",
          description: "Livre de coloriage PDF",
          shortDescription: "30 magnifiques illustrations à colorier",
          category: "livres-coloriage",
          price: 3500,
          currency: "FCFA",
          images: ["/illustrations/Collection-livres.webp"],
          rating: 4.9,
          reviewCount: 28,
          downloadable: true,
          language: "Français",
          age: "3 - 8 ans",
          featured: true,
          stock: 999,
          tags: ["animaux"],
        },
        quantity: 1,
      },
    ],
    total: 3500,
    totalHT: 2966,
    email: "client@exemple.com",
    phone: "+221 77 000 00 00",
    firstName: "Aminata",
    lastName: "Diallo",
    country: "Sénégal",
    city: "Dakar",
    paymentMethod: "Orange Money",
    status: "pending",
  },
];
