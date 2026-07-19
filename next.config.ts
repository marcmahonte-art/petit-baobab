import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Supabase Storage (drawing/book assets) to be optimized by next/image
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Drawing thumbnails/covers can be SVGs served from storage
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Modern formats + longer cache to speed up asset delivery
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
