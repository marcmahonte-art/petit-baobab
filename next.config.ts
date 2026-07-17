import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (build) a un bug connu avec middleware.ts à la racine sur Vercel
  // (ENOENT middleware.js.nft.json). On désactive pour le build (webpack classique).
  turbopack: false,
  images: {
    // Allow Supabase Storage (drawing/book assets) to be optimized by next/image
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Drawing thumbnails/covers can be SVGs served from storage
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
