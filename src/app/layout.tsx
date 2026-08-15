import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Petit Baobab",
  description: "Le coloriage qui éveille la créativité et célèbre l'Afrique",
  icons: {
    icon: [
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
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
        <I18nProvider>{children}</I18nProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
