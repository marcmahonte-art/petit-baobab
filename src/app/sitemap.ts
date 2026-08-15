import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/mock/products";

const SITE_URL = "https://www.monpetitbaobab.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/fonctionnalites",
    "/tarification",
    "/about",
    "/boutique",
    "/confidentialite",
    "/coloriage",
    "/livres-de-coloriage",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const productRoutes = PRODUCTS.map((product) => ({
    url: `${SITE_URL}/boutique/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
