import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Bitt-i.com",
  description: "Get in touch with Bitt-i.com for questions, collaboration, project requests, or just to say hello. We'd love to hear from you.",
  keywords: "contact, collaboration, projects, inquiry, support, partnership",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    siteName: "Bitt-i.com",
    title: "Contact | Bitt-i.com",
    description: "Get in touch with Bitt-i.com for questions, collaboration, project requests, or just to say hello.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Bitt-i.com",
    description: "Get in touch with Bitt-i.com for questions, collaboration, project requests.",
    images: ["/Bitti.png"],
    site: "@bitticom",
    creator: "@bitticom",
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
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
