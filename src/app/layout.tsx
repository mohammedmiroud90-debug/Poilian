import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { BlogFooter } from "@/components/BlogFooter";
import { AutoTranslate } from "@/components/AutoTranslate";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://poilian.com"),
  title: "Poilian Journal | Discover Algeria",
  description: "Stories, guides and local insight for exploring Algeria.",
  applicationName: "Poilian",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_US", url: "/", siteName: "Poilian", title: "Poilian Journal | Discover Algeria", description: "Stories, guides and local insight for exploring Algeria.", images: [{ url: "/brand.png", width: 1200, height: 630, alt: "Poilian" }] },
  twitter: { card: "summary_large_image", title: "Poilian Journal | Discover Algeria", description: "Stories, guides and local insight for exploring Algeria.", images: ["/brand.png"] },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<BlogFooter /><CookieBanner /><AutoTranslate /><AnalyticsTracker /></body>
    </html>
  );
}
