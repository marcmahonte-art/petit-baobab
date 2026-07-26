import { PRODUCTS } from "./products";

export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.featured);
export const BESTSELLER_PRODUCTS = PRODUCTS.filter((p) => p.bestSeller);
export const NEW_PRODUCTS = PRODUCTS.filter((p) => p.isNew);
