import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { BlogFooter } from "@/components/BlogFooter";
import { AutoTranslate } from "@/components/AutoTranslate";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { PageLoader } from "@/components/PageLoader";
import { SidebarDecoration } from "@/components/SidebarDecoration";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"),
  title: {
    default: "Bitt-i.com | Stories, Services & Marketplace",
    template: "%s | Bitt-i.com",
  },
  description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
  applicationName: "Bitt-i.com",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Bitt-i.com",
    title: "Bitt-i.com | Stories, Services & Marketplace",
    description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitt-i.com | Stories, Services & Marketplace",
    description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
    images: ["/Bitti.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        <SidebarDecoration />
        {children}
        <BlogFooter />
        <CookieBanner />
        <AutoTranslate />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
