import type { NextConfig } from "next";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const securityHeaders = [
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Control referrer information sent in headers
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features (camera, mic, geolocation)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Enforce HTTPS
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prefetch control
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide X-Powered-By header
  poweredByHeader: false,
  // Disable public source maps in production to prevent source code disclosure
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
