import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-provider";
import { Toaster } from "sonner";
import HelpBot from "@/components/help/HelpBot";

const SITE_URL = "https://www.monpetitbaobab.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Petit Baobab — Coloriage, livres et créations pour enfants",
    template: "%s | Petit Baobab",
  },
  description:
    "Petit Baobab : coloriages, livres personnalisés, histoires et jeux éducatifs inspirés de l'Afrique pour faire grandir la créativité des enfants.",
  applicationName: "Petit Baobab",
  keywords: [
    "coloriage",
    "coloriage africain",
    "livre enfant",
    "livre de coloriage",
    "créativité enfant",
    "Afrique",
    "apprentissage ludique",
    "dessin magique",
    "coloriage à imprimer",
  ],
  authors: [{ name: "Petit Baobab" }],
  creator: "Petit Baobab",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Petit Baobab",
    title: "Petit Baobab — Coloriage, livres et créations pour enfants",
    description:
      "Coloriages, livres personnalisés, histoires et jeux éducatifs inspirés de l'Afrique pour faire grandir la créativité des enfants.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Petit Baobab — univers créatif africain pour enfants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Petit Baobab — Coloriage, livres et créations pour enfants",
    description:
      "Coloriages, livres personnalisés, histoires et jeux éducatifs inspirés de l'Afrique pour faire grandir la créativité des enfants.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  verification: {
    google: "eME8wGo5hAszgWk7XmquyfpUSNBgSAnhulspwiAA3TU",
  },
};

export const viewport: Viewport = {
  themeColor: "#fef5e0",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Petit Baobab",
  url: SITE_URL,
  logo: `${SITE_URL}/illustrations/logo-petit-baobab.svg`,
  description:
    "Plateforme éducative et créative africaine pour enfants : coloriages, livres, histoires et jeux.",
  sameAs: [
    "https://www.instagram.com/petit.baobab1",
    "https://web.facebook.com/profile.php?id=61591574387656",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Petit Baobab",
  url: SITE_URL,
  inLanguage: "fr",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/boutique?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <I18nProvider>{children}</I18nProvider>
        <HelpBot />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
