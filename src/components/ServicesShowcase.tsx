"use client";

import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";

const copy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    description: string;
    stat1: string;
    stat1Label: string;
    stat2: string;
    stat2Label: string;
    stat3: string;
    stat3Label: string;
    ctaButton: string;
  }
> = {
  en: {
    title: "Your Trusted Partner for",
    subtitle: "Software Development & Digital Solutions",
    description:
      "Poilian delivers custom software solutions, from web applications to AI-powered systems. With expertise in modern technologies and proven project delivery, I help businesses and individuals bring their ideas to life.",
    stat1: "10+",
    stat1Label: "Years of software development experience",
    stat2: "50+",
    stat2Label: "Projects delivered successfully",
    stat3: "15+",
    stat3Label: "Technologies and frameworks mastered",
    ctaButton: "VIEW MY SERVICES",
  },
  fr: {
    title: "Votre Partenaire de Confiance pour",
    subtitle: "le Développement Logiciel et Solutions Digitales",
    description:
      "Poilian propose des solutions logicielles sur mesure, des applications web aux systèmes alimentés par l'IA. Avec une expertise en technologies modernes et une livraison de projets éprouvée, j'aide les entreprises et les particuliers à concrétiser leurs idées.",
    stat1: "10+",
    stat1Label: "Années d'expérience en développement logiciel",
    stat2: "50+",
    stat2Label: "Projets livrés avec succès",
    stat3: "15+",
    stat3Label: "Technologies et frameworks maîtrisés",
    ctaButton: "VOIR MES SERVICES",
  },
  ar: {
    title: "شريكك الموثوق في",
    subtitle: "تطوير البرمجيات والحلول الرقمية",
    description:
      "يقدم Poilian حلول برمجية مخصصة، من تطبيقات الويب إلى الأنظمة المدعومة بالذكاء الاصطناعي. بفضل الخبرة في التقنيات الحديثة وتسليم المشاريع المثبت، أساعد الشركات والأفراد على تحقيق أفكارهم.",
    stat1: "+10",
    stat1Label: "سنوات من الخبرة في تطوير البرمجيات",
    stat2: "+50",
    stat2Label: "مشروع تم تسليمه بنجاح",
    stat3: "+15",
    stat3Label: "تقنية وإطار عمل متقن",
    ctaButton: "عرض خدماتي",
  },
};

export function ServicesShowcase() {
  const [locale] = usePoilianLocale();
  const text = copy[locale];

  return (
    <section className="services-showcase poilian-locale-copy" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="personal-shell services-showcase-shell">
        <div className="services-showcase-content">
          <div className="services-showcase-copy">
            <h2 className="services-showcase-title">
              {text.title}{" "}
              <span className="services-showcase-subtitle">{text.subtitle}</span>
            </h2>
            <p className="services-showcase-description">{text.description}</p>
            <Link href="/services" className="services-showcase-cta">
              {text.ctaButton}
            </Link>

            <div className="services-showcase-stats" aria-label="Key stats">
              <div className="stat-item">
                <div className="stat-number">{text.stat1}</div>
                <div className="stat-label">{text.stat1Label}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{text.stat2}</div>
                <div className="stat-label">{text.stat2Label}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{text.stat3}</div>
                <div className="stat-label">{text.stat3Label}</div>
              </div>
            </div>
          </div>

          <div className="services-showcase-media">
            <div className="services-showcase-image">
              <Image
                src="/heroright.png"
                alt="Software development solutions"
                width={640}
                height={533}
                sizes="(max-width: 960px) min(100vw - 48px, 420px), 440px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
