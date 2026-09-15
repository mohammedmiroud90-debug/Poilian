import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { BlogFooter } from "@/components/BlogFooter";
import { AutoTranslate } from "@/components/AutoTranslate";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { PageLoader } from "@/components/PageLoader";
import { SidebarDecoration } from "@/components/SidebarDecoration";
import { SiteBrandingProvider } from "@/components/SiteLogo";
import { getAuthorProfile } from "@/lib/profile";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"),
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
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
