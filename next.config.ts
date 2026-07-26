import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Bypass Next.js image optimization — serve images directly via Nginx
    // This fixes image loading issues on production servers without a domain
    unoptimized: true,
  },
};

export default nextConfig;
