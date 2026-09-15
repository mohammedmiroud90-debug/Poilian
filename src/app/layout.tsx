import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { BlogFooter } from "@/components/BlogFooter";
import { AutoTranslate } from "@/components/AutoTranslate";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { PageLoader } from "@/components/PageLoader";
import { SidebarDecoration } from "@/components/SidebarDecoration";
import { SiteBrandingProvider } from "@/components/SiteLogo";
import { resolveFaviconUrl } from "@/lib/branding";
import { getAuthorProfile } from "@/lib/profile";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") return "http://localhost:3001";
  return "https://bitt-i.com";
}

function iconHref(faviconUrl: string) {
  const source = resolveFaviconUrl(faviconUrl);
  const bust = encodeURIComponent(source.slice(-48));
  // Uploaded remote icons: link directly so the browser never keeps the old /favicon.png.
  if (/^https?:\/\//i.test(source)) {
    return `${source}${source.includes("?") ? "&" : "?"}v=${bust}`;
  }
  return `/favicon?v=${bust}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAuthorProfile();
  const favicon = iconHref(profile.faviconUrl);
  return {
    metadataBase: new URL(siteOrigin()),
    title: {
      default: `${SITE_NAME} | Stories, Services & Marketplace`,
      template: `%s | ${SITE_NAME}`,
    },
    description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Stories, Services & Marketplace`,
      description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | Stories, Services & Marketplace`,
      description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
      images: [DEFAULT_OG_IMAGE.url],
    },
    icons: {
      icon: [{ url: favicon }],
      shortcut: favicon,
      apple: favicon,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getAuthorProfile();
  return (
    <html lang="en">
      <body>
        <SiteBrandingProvider logoUrl={profile.logoUrl} commentAvatarUrl={profile.commentAvatarUrl}>
          <PageLoader />
          <SidebarDecoration />
          {children}
          <BlogFooter />
          <CookieBanner />
          <AutoTranslate />
          <AnalyticsTracker />
        </SiteBrandingProvider>
      </body>
    </html>
  );
}
