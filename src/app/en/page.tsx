import type { Metadata } from "next";

export { default } from "../page";

/** Prefer the root URL in search results; keep /en as an alternate entry. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};
