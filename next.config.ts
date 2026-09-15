import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/favicon", permanent: false }];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "media-src 'self' https: blob:",
          "connect-src 'self' https:",
          "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join("; "),
      },
    ];
    if (process.env.NODE_ENV === "production") {
      security.push({ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" });
    }
    return [{ source: "/(.*)", headers: security }];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "founder.brintiel.com", pathname: "/static/images/**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
