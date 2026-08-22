import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/mock/products";
import ProductDetailClient from "@/components/boutique/ProductDetailClient";

const SITE_URL = "https://www.monpetitbaobab.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Produit introuvable" };
  }

  const url = `/boutique/${slug}`;
  const image = product.images?.[0];

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      url,
      siteName: "Petit Baobab",
      type: "website",
      locale: "fr_FR",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name: product.title,
            description: product.shortDescription,
            image: product.images,
            brand: { "@type": "Brand", name: "Petit Baobab" },
            aggregateRating:
              product.reviewCount > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount,
                  }
                : undefined,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: product.currency,
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/boutique/${product.slug}`,
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Boutique", item: `${SITE_URL}/boutique` },
              {
                "@type": "ListItem",
                position: 3,
                name: product.title,
                item: `${SITE_URL}/boutique/${product.slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      <ProductDetailClient slug={slug} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
