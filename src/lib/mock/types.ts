export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  category: CategorySlug;
  price: number;
  currency: string;
  images: string[];
  rating: number;
  reviewCount: number;
  downloadable: boolean;
  fileSize?: string;
  pages?: number;
  language: string;
  age: string;
  featured: boolean;
  stock: number;
  tags: string[];
  isNew?: boolean;
  bestSeller?: boolean;
  kitContents?: string[];
}

export type CategorySlug =
  | "livres-coloriage"
  | "color-by-number"
  | "kit-de-coloriage"
  | "t-shirts"
  | "stickers"
  | "jeux-et-jouets";

export interface Category {
  id: string;
  slug: CategorySlug;
  title: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
