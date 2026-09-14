type DottedWorldMapProps = {
  className?: string;
  patternId?: string;
  maskId?: string;
  dotFill?: string;
};

/** Continent silhouettes masked over a dotted pattern — decorative map accent. */
export function DottedWorldMap({
  className = "footer-dotted-map",
  patternId = "footer-map-dots",
  maskId = "footer-map-mask",
  dotFill = "rgba(210,200,190,0.42)",
}: DottedWorldMapProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 640 320" preserveAspectRatio="xMaxYMid slice" role="presentation">
        <defs>
          <pattern id={patternId} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.2" fill={dotFill} />
          </pattern>
          <mask id={maskId}>
            <rect width="640" height="320" fill="#000" />
            <path
              fill="#fff"
              d="M78 58c18-16 46-24 74-18 22 5 41 18 52 36 8 14 7 31-2 43-12 16-32 22-52 28-18 5-39 8-54-2-19-13-26-37-21-58 2-10 3-21 3-29z"
            />
            <path fill="#fff" d="M132 148c12-2 24 4 28 14 3 8-1 16-8 20-10 6-22 4-30-2-7-5-8-15-3-22 3-5 8-9 13-10z" />
            <path
              fill="#fff"
              d="M168 176c14-4 28 2 34 14 8 16 6 36-2 52-7 14-20 26-36 30-12 3-24-2-30-12-8-14-6-34 2-48 7-13 19-28 32-36z"
            />
            <path fill="#fff" d="M312 72c16-10 36-10 50 2 10 9 12 24 6 36-8 14-26 18-42 14-14-4-24-16-22-30 1-8 4-16 8-22z" />
            <path
              fill="#fff"
              d="M318 118c18-6 38-2 50 12 12 14 14 36 8 54-6 18-22 34-42 38-16 3-32-4-40-18-10-16-8-38 2-54 8-12 14-26 22-32z"
            />
            <path fill="#fff" d="M372 96c18-8 40-6 54 8 10 10 12 28 4 40-10 14-30 18-46 12-14-5-24-18-22-32 1-10 5-20 10-28z" />
            <path
              fill="#fff"
              d="M430 68c28-18 64-20 94-6 22 10 40 30 44 54 3 18-4 36-18 48-18 16-44 20-68 16-26-4-50-18-64-40-10-16-8-38 4-52 2-8 5-14 8-20z"
            />
            <path fill="#fff" d="M508 168c10-4 22 0 26 10 3 8-1 16-8 20-9 5-20 3-26-4-6-7-4-17 2-22 2-2 4-3 6-4z" />
            <path fill="#fff" d="M520 214c18-8 40-4 52 10 8 10 8 26-2 34-12 10-30 10-44 4-12-5-20-16-18-28 1-8 6-16 12-20z" />
            <path fill="#fff" d="M214 42c10-8 24-6 30 4 4 8 0 16-8 20-10 5-22 2-28-6-4-6-2-12 6-18z" />
          </mask>
        </defs>
        <rect width="640" height="320" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
      </svg>
    </div>
  );
}

/** @deprecated Prefer DottedWorldMap — kept for existing footer imports. */
export function FooterDottedMap() {
  return <DottedWorldMap />;
}
