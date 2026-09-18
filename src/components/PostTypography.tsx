import { getPostFont, googleFontsStylesheetUrl } from "@/lib/postFonts";

/** Loads selected Google Fonts and sets CSS variables for post title + body. */
export function PostTypography({
  contentFontId,
  headingFontId,
}: {
  contentFontId: string;
  headingFontId: string;
}) {
  const content = getPostFont(contentFontId);
  const heading = getPostFont(headingFontId);
  const href = googleFontsStylesheetUrl([content.id, heading.id]);

  return (
    <>
      {href ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={href} />
        </>
      ) : null}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .post-page {
              --post-content-font: ${content.family};
              --post-heading-font: ${heading.family};
            }
          `,
        }}
      />
    </>
  );
}
