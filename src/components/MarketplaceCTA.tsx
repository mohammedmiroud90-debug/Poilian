"use client";

import { type Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";

type MarketplaceCopy = {
  title: string;
  description: string;
  buttonText: string;
  subtitle: string;
};

const copy: Record<Locale, MarketplaceCopy> = {
  en: {
    title: "Discover Unique Products & Services",
    description: "Explore our curated marketplace featuring quality products, creative services, and exclusive offerings from trusted vendors.",
    buttonText: "Visit Marketplace",
    subtitle: "Quality you can trust · Deals you'll love",
  },
  fr: {
    title: "Découvrez des Produits et Services Uniques",
    description: "Explorez notre marketplace sélectionnée proposant des produits de qualité, des services créatifs et des offres exclusives de vendeurs de confiance.",
    buttonText: "Visiter la Marketplace",
    subtitle: "Qualité de confiance · Offres que vous aimerez",
  },
  ar: {
    title: "اكتشف منتجات وخدمات فريدة",
    description: "استكشف سوقنا المختار الذي يضم منتجات عالية الجودة وخدمات إبداعية وعروض حصرية من بائعين موثوقين.",
    buttonText: "زيارة السوق",
    subtitle: "جودة يمكنك الوثوق بها · عروض ستحبها",
  },
};

export function MarketplaceCTA() {
  const [locale] = usePoilianLocale();
  const text = copy[locale];

  return (
    <section
      className="marketplace-cta-section"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="marketplace-cta-container">
        <div className="marketplace-cta-content">
          <h2 className="marketplace-cta-title">{text.title}</h2>
          <p className="marketplace-cta-description">{text.description}</p>
          <div className="marketplace-cta-actions">
            <a
              href="https://market.bitt-i.com"
              target="_blank"
              rel="noreferrer"
              className="marketplace-cta-button"
            >
              {text.buttonText}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <p className="marketplace-cta-subtitle">{text.subtitle}</p>
        </div>
        <div className="marketplace-cta-visual" aria-hidden="true">
          <div className="marketplace-cta-icon">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 16h48v36H8z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M8 20l24 18 24-18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="32" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M32 36v8M28 40h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
