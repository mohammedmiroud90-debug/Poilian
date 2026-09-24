"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

export function MarketplaceSection() {
  return (
    <section className="marketplace-section">
      <div className="marketplace-container">
        <div className="marketplace-card">
          <div className="marketplace-card-content">
            <div className="marketplace-card-header">
              <div className="marketplace-logo">
                <SiteLogo alt="Bitt-i" width={120} height={50} />
              </div>
              <h2>Serve our marketplace</h2>
            </div>
            <p className="marketplace-description">
              Discover exclusive deals, new arrivals, and curated collections across multiple categories. 
              Join thousands of shoppers finding their perfect products.
            </p>
            <div className="marketplace-features">
              <div className="feature-item">
                <span className="feature-icon">🛍️</span>
                <span>Exclusive Deals</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>New Arrivals</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Fast Delivery</span>
              </div>
            </div>
            <Link 
              href="https://categories.bitt-i.com" 
              className="marketplace-cta"
              target="_blank"
              rel="noreferrer"
            >
              Explore Marketplace
              <span className="cta-arrow">→</span>
            </Link>
          </div>
          <div className="marketplace-card-visual">
            <div className="marketplace-illustration">
              <div className="illustration-circle">
                <div className="illustration-content">
                  <div className="smartphone">
                    <div className="phone-screen">
                      <div className="message notification">
                        <span className="message-icon">🔔</span>
                        <span className="message-text">New Deal!</span>
                      </div>
                      <div className="message product">
                        <span className="message-icon">📦</span>
                        <span className="message-text">Order Shipped</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}