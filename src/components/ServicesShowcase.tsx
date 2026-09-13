"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type Locale } from "@/components/LanguageSelect";

const copy: Record<Locale, {
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
  verticalText: string;
}> = {
  en: {
    title: "Your Trusted Partner for",
    subtitle: "Software Development & Digital Solutions",
    description: "Poilian delivers custom software solutions, from web applications to AI-powered systems. With expertise in modern technologies and proven project delivery, I help businesses and individuals bring their ideas to life.",
    stat1: "10+",
    stat1Label: "Years of software development experience",
    stat2: "50+",
    stat2Label: "Projects delivered successfully",
    stat3: "15+",
    stat3Label: "Technologies and frameworks mastered",
    ctaButton: "VIEW MY SERVICES",
    verticalText: "Easy & Fast Deployment"
  },
  fr: {
    title: "Votre Partenaire de Confiance pour",
    subtitle: "le Développement Logiciel et Solutions Digitales",
    description: "Poilian propose des solutions logicielles sur mesure, des applications web aux systèmes alimentés par l'IA. Avec une expertise en technologies modernes et une livraison de projets éprouvée, j'aide les entreprises et les particuliers à concrétiser leurs idées.",
    stat1: "10+",
    stat1Label: "Années d'expérience en développement logiciel",
    stat2: "50+",
    stat2Label: "Projets livrés avec succès",
    stat3: "15+",
    stat3Label: "Technologies et frameworks maîtrisés",
    ctaButton: "VOIR MES SERVICES",
    verticalText: "Déploiement Facile et Rapide"
  },
  ar: {
    title: "شريكك الموثوق في",
    subtitle: "تطوير البرمجيات والحلول الرقمية",
    description: "يقدم Poilian حلول برمجية مخصصة، من تطبيقات الويب إلى الأنظمة المدعومة بالذكاء الاصطناعي. بفضل الخبرة في التقنيات الحديثة وتسليم المشاريع المثبت، أساعد الشركات والأفراد على تحقيق أفكارهم.",
    stat1: "+10",
    stat1Label: "سنوات من الخبرة في تطوير البرمجيات",
    stat2: "+50",
    stat2Label: "مشروع تم تسليمه بنجاح",
    stat3: "+15",
    stat3Label: "تقنية وإطار عمل متقن",
    ctaButton: "عرض خدماتي",
    verticalText: "نشر سريع وسهل"
  }
};

export function ServicesShowcase() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("poilian-locale");
    if (saved === "en" || saved === "fr" || saved === "ar") setLocale(saved);
    
    const updateLocale = (event: Event) => {
      const nextLocale = (event as CustomEvent<Locale>).detail;
      if (nextLocale === "en" || nextLocale === "fr" || nextLocale === "ar") setLocale(nextLocale);
    };
    
    window.addEventListener("poilian-locale-change", updateLocale);
    return () => window.removeEventListener("poilian-locale-change", updateLocale);
  }, []);

  const text = copy[locale];

  return (
    <section 
      className="services-showcase poilian-locale-copy services-showcase-with-sidebar" 
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Sidebar decoration - only in this section */}
      <div className="showcase-sidebar-decoration" aria-hidden="true">
        <div className="showcase-sidebar-mountains">
          <svg width="100%" height="100%" viewBox="0 0 100 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Brown mountains - horizontal layout */}
            <path d="M0 600 L20 400 L40 600 Z" fill="#8B6F47" opacity="0.9"/>
            <path d="M25 600 L45 350 L65 600 Z" fill="#A0826D" opacity="0.8"/>
            <path d="M50 600 L70 420 L90 600 Z" fill="#8B6F47" opacity="0.85"/>
            <path d="M75 600 L95 380 L100 600 Z" fill="#9E7C52" opacity="0.9"/>
          </svg>
        </div>
        <div className="showcase-sidebar-vertical-text">
          <span>{text.verticalText}</span>
        </div>
      </div>

      <div className="personal-shell">
        <div className="services-showcase-content">
          <div className="services-showcase-left">
            <h2 className="services-showcase-title">
              {text.title}
              <br />
              <span className="services-showcase-subtitle">{text.subtitle}</span>
            </h2>
            <p className="services-showcase-description">{text.description}</p>
            <Link href="/services" className="services-showcase-cta">
              {text.ctaButton}
            </Link>
          </div>
          
          <div className="services-showcase-stats">
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

          <div className="services-showcase-image">
            <Image src="/heroright.png" alt="Software Development Solutions" width={400} height={400} />
          </div>
        </div>
      </div>
    </section>
  );
}
