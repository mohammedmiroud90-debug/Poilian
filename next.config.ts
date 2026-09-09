import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ] }];
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
