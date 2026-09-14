import type { ReactNode, SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const EditorIcons = {
  Heading: () => (
    <Icon>
      <path d="M3 3v10M13 3v10M3 8h10" />
      <path d="M11.5 13h3" />
    </Icon>
  ),
  Bold: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5h4.4c1.9 0 3.35 1.2 3.35 2.85 0 1.1-.55 2-1.45 2.45 1.2.4 2 1.45 2 2.7 0 1.85-1.55 3-3.7 3H4V2.5zm2.15 1.85v2.9h2.1c.95 0 1.5-.5 1.5-1.4s-.55-1.5-1.5-1.5h-2.1zm0 4.7v3.4h2.45c1.1 0 1.8-.55 1.8-1.65s-.7-1.75-1.8-1.75H6.15z" />
    </svg>
  ),
  Italic: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M7.2 2.5h5.3l-.55 1.7H9.7L7.55 11.8H9.8l-.55 1.7H4l.55-1.7h2.15L8.85 4.2H6.65L7.2 2.5z" />
    </svg>
  ),
  Strike: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8.2 2.4c1.85 0 3.2.85 3.55 2.15l-1.55.35c-.2-.65-.85-1-1.9-1-1.15 0-1.85.45-1.85 1.15 0 .5.3.85 1.15 1.1H3.9V7.4h8.2v1.25H9.7c1.45.4 2.25 1.2 2.25 2.45 0 1.7-1.5 2.9-3.85 2.9-2.1 0-3.55-1-3.85-2.45l1.6-.4c.25.85 1 1.35 2.25 1.35 1.25 0 2-.55 2-1.4 0-.7-.45-1.15-1.55-1.4H3.9V7.4h3.45c-.7-.25-1.1-.7-1.1-1.4 0-1.2 1.1-2.05 2.95-2.05zM2.5 7.4h11v1.25h-11V7.4z" />
    </svg>
  ),
  Code: () => (
    <Icon>
      <path d="M5.5 4.5 2.5 8l3 3.5M10.5 4.5l3 3.5-3 3.5M9 3.5l-2 9" />
    </Icon>
  ),
  CodeBlock: () => (
    <Icon>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <path d="M6 6.5 4.5 8 6 9.5M10 6.5l1.5 1.5L10 9.5" />
    </Icon>
  ),
  Link: () => (
    <Icon>
      <path d="M6.5 9.5 5 11a2.1 2.1 0 0 1-3-3l2-2a2.1 2.1 0 0 1 3 0" />
      <path d="M9.5 6.5 11 5a2.1 2.1 0 0 1 3 3l-2 2a2.1 2.1 0 0 1-3 0" />
      <path d="M6.2 9.8 9.8 6.2" />
    </Icon>
  ),
  Quote: () => (
    <Icon>
      <path d="M3.5 12.5V7.5A3 3 0 0 1 6.5 4.5" />
      <path d="M9.5 12.5V7.5A3 3 0 0 1 12.5 4.5" />
      <path d="M3.5 12.5h3M9.5 12.5h3" />
    </Icon>
  ),
  Image: () => (
    <Icon>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <circle cx="5.8" cy="6.5" r="1" />
      <path d="M2.8 11.2 6.2 8.2l2.2 2 2-1.6 2.8 2.6" />
    </Icon>
  ),
  Video: () => (
    <Icon>
      <rect x="2.5" y="4" width="8" height="8" rx="1.5" />
      <path d="M10.5 6.5 13.5 4.8v6.4L10.5 9.5" />
    </Icon>
  ),
  Table: () => (
    <Icon>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" />
      <path d="M2.5 7h11M2.5 10h11M6.5 3.5v9M10 3.5v9" />
    </Icon>
  ),
  Ol: () => (
    <Icon>
      <path d="M6.5 4H13M6.5 8H13M6.5 12H13" />
      <path d="M3 3.5h1.2V6M3.6 6H3M3 9.2c.5 0 .9.25.9.7s-.4.7-.9.7c.5 0 .9.3.9.75S3.5 12.1 3 12.1H2.5" />
    </Icon>
  ),
  Ul: () => (
    <Icon>
      <path d="M6.5 4H13M6.5 8H13M6.5 12H13" />
      <circle cx="3.5" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Align: () => (
    <Icon>
      <path d="M2.5 4H13.5M2.5 8H11M2.5 12H13.5" />
    </Icon>
  ),
  More: () => (
    <Icon>
      <circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="8" r="1" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Help: () => (
    <Icon>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M6.4 6.2a1.7 1.7 0 0 1 3.2 1c0 1.1-1.6 1.4-1.6 2.4" />
      <circle cx="8" cy="11.4" r=".6" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Undo: () => (
    <Icon>
      <path d="M4 7.5H10a3 3 0 1 1 0 6H8" />
      <path d="M4 7.5 6.5 5M4 7.5 6.5 10" />
    </Icon>
  ),
  Redo: () => (
    <Icon>
      <path d="M12 7.5H6a3 3 0 1 0 0 6h2" />
      <path d="M12 7.5 9.5 5M12 7.5 9.5 10" />
    </Icon>
  ),
  Hr: () => (
    <Icon>
      <path d="M2.5 8h11" />
    </Icon>
  ),
  Clear: () => (
    <Icon>
      <path d="M4 12.5h5.5M6.2 3.5 3.5 12.5M9.5 3.5 7.8 8.2" />
      <path d="M5.5 3.5h5" />
    </Icon>
  ),
  Underline: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5h1.9v5.3c0 1.55 1.05 2.55 2.6 2.55s2.6-1 2.6-2.55V2.5H13v5.3c0 2.55-1.85 4.2-4.5 4.2S4 10.35 4 7.8V2.5zM3.5 13.2h9v1.3h-9v-1.3z" />
    </svg>
  ),
  ViewRich: () => (
    <Icon>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" />
      <path d="M5 7h6M5 9.5h4" />
    </Icon>
  ),
  ViewMd: () => (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="currentColor" aria-hidden="true">
      <path d="M2 3.5h14v9H2v-9zm1.5 1.5v6h2.1L7 8.4 8.4 11h2.1V5H9v3.8L7.5 6.4 6 8.8V5H3.5zm8.2 0v3.2h1.3V5H15v6h-1.5V8.2h-1.3V11H10.7V5h1z" />
    </svg>
  ),
};
