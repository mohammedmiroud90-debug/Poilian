import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { BlogFooter } from "@/components/BlogFooter";
import { AutoTranslate } from "@/components/AutoTranslate";
import { LocaleBootstrap } from "@/components/LocaleBootstrap";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { PageLoader } from "@/components/PageLoader";
import { SidebarDecoration } from "@/components/SidebarDecoration";
import { SiteBrandingProvider } from "@/components/SiteLogo";
import { resolveFaviconUrl } from "@/lib/branding";
import { getAuthorProfile } from "@/lib/profile";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

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
  const origin = siteOrigin();
  return {
    metadataBase: new URL(origin),
    title: {
      default: `${SITE_NAME} | Stories, Services & Marketplace`,
      template: `%s | ${SITE_NAME}`,
    },
    description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com. Your destination for quality content and creative collaboration.",
    keywords: "blog, research, services, marketplace, stories, writing, photography, creative collaboration, Bitt-i",
    applicationName: SITE_NAME,
    authors: [{ name: profile.name, url: `${origin}/pages/founder` }],
    creator: profile.name,
    publisher: SITE_NAME,
    alternates: {
      canonical: "/",
      languages: {
        "en-US": "/en",
        "fr-FR": "/espace",
        "ar-SA": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Stories, Services & Marketplace`,
      description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com.",
      images: [DEFAULT_OG_IMAGE],
      url: siteOrigin(),
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | Stories, Services & Marketplace`,
      description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com.",
      images: [DEFAULT_OG_IMAGE.url],
      creator: profile.linkedinUrl?.split("/").pop() || "@bitticom",
    },
    icons: {
      icon: [{ url: favicon }],
      shortcut: favicon,
      apple: favicon,
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: SITE_NAME,
    },
    formatDetection: {
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
    other: {
      ...(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && { "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID }),
      ...(process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID && { "fb:pages": process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID }),
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getAuthorProfile();
  const favicon = iconHref(profile.faviconUrl);
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta property="linkedin:owner" content={profile.linkedinUrl || ""} />
        <meta property="linkedin:company" content="bitt-i" />
        <meta name="author" content={profile.name} />
        <meta name="article:author" content={profile.name} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/poilian-locale=(en|fr|ar)/);if(m){document.documentElement.lang=m[1];document.documentElement.dir=m[1]==='ar'?'rtl':'ltr';}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SiteBrandingProvider logoUrl={profile.logoUrl} commentAvatarUrl={profile.commentAvatarUrl}>
          <LocaleBootstrap />
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
