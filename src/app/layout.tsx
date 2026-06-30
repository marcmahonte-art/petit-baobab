import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

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
    <html lang="fr" className={poppins.variable}>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
