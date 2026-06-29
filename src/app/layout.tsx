import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-provider";

export const metadata: Metadata = {
  title: "Petit Baobab",
  description: "Application créative pour enfants de 3 à 7 ans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
