import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
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
