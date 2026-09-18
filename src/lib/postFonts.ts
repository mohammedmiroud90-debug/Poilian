/** Popular reading/UI fonts for post title + body (Google Fonts + site locals). */

export type PostFontOption = {
  id: string;
  label: string;
  /** CSS font-family value */
  family: string;
  /** Google Fonts family query segment, e.g. Inter:ital,wght@0,400;0,600;0,700 */
  google?: string;
  category: "sans" | "serif" | "display" | "local";
};

export const DEFAULT_POST_CONTENT_FONT = "ranade";
export const DEFAULT_POST_HEADING_FONT = "ranade";

/** 40 popular fonts for article titles and body text. */
export const POST_FONTS: PostFontOption[] = [
  { id: "ranade", label: "Ranade (site)", family: '"Ranade", "Open Sans", Arial, sans-serif', category: "local" },
  { id: "haskoy", label: "Haskoy (site)", family: '"Haskoy", "Open Sans", Arial, sans-serif', category: "local" },
  { id: "open-sans", label: "Open Sans", family: '"Open Sans", Arial, sans-serif', google: "Open+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "inter", label: "Inter", family: '"Inter", "Open Sans", Arial, sans-serif', google: "Inter:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "roboto", label: "Roboto", family: '"Roboto", "Open Sans", Arial, sans-serif', google: "Roboto:ital,wght@0,400;0,500;0,700;1,400", category: "sans" },
  { id: "source-sans-3", label: "Source Sans 3", family: '"Source Sans 3", "Open Sans", Arial, sans-serif', google: "Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "noto-sans", label: "Noto Sans", family: '"Noto Sans", "Open Sans", Arial, sans-serif', google: "Noto+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "work-sans", label: "Work Sans", family: '"Work Sans", "Open Sans", Arial, sans-serif', google: "Work+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "dm-sans", label: "DM Sans", family: '"DM Sans", "Open Sans", Arial, sans-serif', google: "DM+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "manrope", label: "Manrope", family: '"Manrope", "Open Sans", Arial, sans-serif', google: "Manrope:wght@400;600;700", category: "sans" },
  { id: "plus-jakarta", label: "Plus Jakarta Sans", family: '"Plus Jakarta Sans", "Open Sans", Arial, sans-serif', google: "Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "outfit", label: "Outfit", family: '"Outfit", "Open Sans", Arial, sans-serif', google: "Outfit:wght@400;600;700", category: "sans" },
  { id: "space-grotesk", label: "Space Grotesk", family: '"Space Grotesk", "Open Sans", Arial, sans-serif', google: "Space+Grotesk:wght@400;600;700", category: "sans" },
  { id: "ibm-plex-sans", label: "IBM Plex Sans", family: '"IBM Plex Sans", "Open Sans", Arial, sans-serif', google: "IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "fira-sans", label: "Fira Sans", family: '"Fira Sans", "Open Sans", Arial, sans-serif', google: "Fira+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "nunito-sans", label: "Nunito Sans", family: '"Nunito Sans", "Open Sans", Arial, sans-serif', google: "Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "mulish", label: "Mulish", family: '"Mulish", "Open Sans", Arial, sans-serif', google: "Mulish:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "karla", label: "Karla", family: '"Karla", "Open Sans", Arial, sans-serif', google: "Karla:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "rubik", label: "Rubik", family: '"Rubik", "Open Sans", Arial, sans-serif', google: "Rubik:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "poppins", label: "Poppins", family: '"Poppins", "Open Sans", Arial, sans-serif', google: "Poppins:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "montserrat", label: "Montserrat", family: '"Montserrat", "Open Sans", Arial, sans-serif', google: "Montserrat:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "raleway", label: "Raleway", family: '"Raleway", "Open Sans", Arial, sans-serif', google: "Raleway:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "josefin-sans", label: "Josefin Sans", family: '"Josefin Sans", "Open Sans", Arial, sans-serif', google: "Josefin+Sans:ital,wght@0,400;0,600;0,700;1,400", category: "sans" },
  { id: "pt-sans", label: "PT Sans", family: '"PT Sans", "Open Sans", Arial, sans-serif', google: "PT+Sans:ital,wght@0,400;0,700;1,400", category: "sans" },
  { id: "lora", label: "Lora", family: '"Lora", Georgia, serif', google: "Lora:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "merriweather", label: "Merriweather", family: '"Merriweather", Georgia, serif', google: "Merriweather:ital,wght@0,400;0,700;1,400", category: "serif" },
  { id: "source-serif-4", label: "Source Serif 4", family: '"Source Serif 4", Georgia, serif', google: "Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "noto-serif", label: "Noto Serif", family: '"Noto Serif", Georgia, serif', google: "Noto+Serif:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "libre-baskerville", label: "Libre Baskerville", family: '"Libre Baskerville", Georgia, serif', google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400", category: "serif" },
  { id: "crimson-pro", label: "Crimson Pro", family: '"Crimson Pro", Georgia, serif', google: "Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "literata", label: "Literata", family: '"Literata", Georgia, serif', google: "Literata:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "newsreader", label: "Newsreader", family: '"Newsreader", Georgia, serif', google: "Newsreader:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "eb-garamond", label: "EB Garamond", family: '"EB Garamond", Georgia, serif', google: "EB+Garamond:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "cormorant", label: "Cormorant Garamond", family: '"Cormorant Garamond", Georgia, serif', google: "Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "spectral", label: "Spectral", family: '"Spectral", Georgia, serif', google: "Spectral:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "pt-serif", label: "PT Serif", family: '"PT Serif", Georgia, serif', google: "PT+Serif:ital,wght@0,400;0,700;1,400", category: "serif" },
  { id: "ibm-plex-serif", label: "IBM Plex Serif", family: '"IBM Plex Serif", Georgia, serif', google: "IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "roboto-serif", label: "Roboto Serif", family: '"Roboto Serif", Georgia, serif', google: "Roboto+Serif:ital,wght@0,400;0,600;0,700;1,400", category: "serif" },
  { id: "playfair", label: "Playfair Display", family: '"Playfair Display", Georgia, serif', google: "Playfair+Display:ital,wght@0,400;0,600;0,700;1,400", category: "display" },
  { id: "fraunces", label: "Fraunces", family: '"Fraunces", Georgia, serif', google: "Fraunces:ital,wght@0,400;0,600;0,700;1,400", category: "display" },
];

export function getPostFont(id: string | undefined | null): PostFontOption {
  return POST_FONTS.find((font) => font.id === id) || POST_FONTS[0];
}

export function isPostFontId(value: unknown): value is string {
  return typeof value === "string" && POST_FONTS.some((font) => font.id === value);
}

/** Build a single Google Fonts CSS URL for the selected families. */
export function googleFontsStylesheetUrl(ids: string[]): string | null {
  const families = [
    ...new Set(
      ids
        .map((id) => getPostFont(id).google)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  if (!families.length) return null;
  return `https://fonts.googleapis.com/css2?${families.map((family) => `family=${family}`).join("&")}&display=swap`;
}
