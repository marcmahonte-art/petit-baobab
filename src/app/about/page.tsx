import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "A propos | Petit Baobab",
  description:
    "Decouvrez Petit Baobab, la plateforme africaine qui aide les enfants a apprendre grace aux coloriages, histoires, livres personnalises et jeux educatifs.",
  alternates: {
    canonical: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "A propos | Petit Baobab",
    description:
      "Decouvrez Petit Baobab, la plateforme africaine qui aide les enfants a apprendre grace aux coloriages, histoires, livres personnalises et jeux educatifs.",
  },
  openGraph: {
    title: "A propos | Petit Baobab",
    description:
      "Decouvrez Petit Baobab, la plateforme africaine qui aide les enfants a apprendre grace aux coloriages, histoires, livres personnalises et jeux educatifs.",
    url: "/about",
    siteName: "Petit Baobab",
    images: [
      {
        url: "/illustrations/awa-village-girafe.webp",
        width: 1200,
        height: 630,
        alt: "Enfant africain souriant dans l'univers Petit Baobab",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function Page() {
  return <AboutPage />;
}
