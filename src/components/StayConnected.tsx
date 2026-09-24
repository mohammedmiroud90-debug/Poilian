"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";

export function StayConnected() {
  const [notice, setNotice] = useState("");

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Thanks — you're on the list.");
  }

  return (
    <section className="stay-connected-section">
      <div className="stay-connected-container">
        <div className="stay-connected-header">
          <div className="stay-connected-logo">
            <SiteLogo alt="Bitt-i" width={200} height={80} />
          </div>
          <div className="stay-connected-content">
            <h2>Stay connected with Bitt-i</h2>
            <p className="stay-connected-description">
              Subscribe to our newsletter to get the latest updates, exclusive content, and special offers delivered directly to your inbox.
            </p>
            <form className="stay-connected-form" onSubmit={subscribe}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
              <button type="submit">Subscribe</button>
            </form>
            {notice && <p className="stay-connected-notice">{notice}</p>}
          </div>
        </div>

        <div className="browse-categories">
          <h3>Browse categories</h3>
          <p className="categories-description">
            Explore our curated collections and find exactly what you're looking for.
          </p>
          <div className="category-buttons">
            <button className="category-btn">New Arrivals</button>
            <button className="category-btn">Apparel</button>
            <button className="category-btn">Accessories</button>
          </div>
        </div>
      </div>
    </section>
  );
}