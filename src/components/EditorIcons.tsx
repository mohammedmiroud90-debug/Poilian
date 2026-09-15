import type { ReactNode, SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const EditorIcons = {
  Heading: () => (
    <Icon>
      <path d="M3.2 3v11M13.8 3v11M3.2 8.5h10.6" />
    </Icon>
  ),
  Bold: () => (
    <Icon strokeWidth="1.7">
      <path d="M5 3.2h4.1a2.5 2.5 0 0 1 0 5H5V3.2Zm0 5h4.6a2.7 2.7 0 0 1 0 5.4H5V8.2Z" />
    </Icon>
  ),
  Italic: () => (
    <Icon strokeWidth="1.7">
      <path d="M7.4 3.2h4M5.6 13.4h4M9.6 3.2 7.4 13.4" />
    </Icon>
  ),
  Underline: () => (
    <Icon strokeWidth="1.7">
      <path d="M4.6 3.2v4.9a3.9 3.9 0 0 0 7.8 0V3.2" />
      <path d="M3.6 13.6h9.8" />
    </Icon>
  ),
  Strike: () => (
    <Icon strokeWidth="1.7">
      <path d="M4.8 4.5c.5-1 1.7-1.6 3.2-1.6 1.9 0 3.2.9 3.4 2.2" />
      <path d="M5.6 11.8c.4 1 1.6 1.7 3 1.7 1.9 0 3.4-.9 3.4-2.4 0-1-.6-1.6-1.7-2" />
      <path d="M2.8 8.5h11.4" />
    </Icon>
  ),
  Code: () => (
    <Icon>
      <path d="M6 5 3 8.5 6 12M11 5l3 3.5-3 3.5M9.4 3.8l-1.8 9.4" />
    </Icon>
  ),
  CodeBlock: () => (
    <Icon>
      <rect x="2.6" y="3.6" width="11.8" height="9.8" rx="1.5" />
      <path d="M6.6 6.8 5 8.5l1.6 1.7M10.4 6.8 12 8.5l-1.6 1.7" />
    </Icon>
  ),
  Link: () => (
    <Icon>
      <path d="M6.8 10.1 5.2 11.7a2.3 2.3 0 0 1-3.2-3.2l2.2-2.2a2.3 2.3 0 0 1 3.2 0" />
      <path d="M10.2 6.9 11.8 5.3a2.3 2.3 0 0 1 3.2 3.2l-2.2 2.2a2.3 2.3 0 0 1-3.2 0" />
      <path d="M6.4 10.5 10.6 6.3" />
    </Icon>
  ),
  Quote: () => (
    <Icon>
      <path d="M3.8 13.2V8a3.2 3.2 0 0 1 3.2-3.2" />
      <path d="M10.2 13.2V8a3.2 3.2 0 0 1 3.2-3.2" />
    </Icon>
  ),
  Image: () => (
    <Icon>
      <rect x="2.6" y="3.6" width="11.8" height="9.8" rx="1.5" />
      <circle cx="6.1" cy="7" r="1.1" />
      <path d="M2.9 11.6 6.6 8.1l2.4 2.1 2.1-1.7 3 2.8" />
    </Icon>
  ),
  Video: () => (
    <Icon>
      <rect x="2.6" y="4.4" width="8.4" height="8.2" rx="1.5" />
      <path d="M11 6.6 14.4 4.6v7.8L11 10.4" />
    </Icon>
  ),
  Table: () => (
    <Icon>
      <rect x="2.6" y="3.6" width="11.8" height="9.8" rx="1.3" />
      <path d="M2.6 7.3h11.8M2.6 10.7h11.8M7 3.6v9.8M10.6 3.6v9.8" />
    </Icon>
  ),
  Ol: () => (
    <Icon>
      <path d="M7 4.2h7.2M7 8.5h7.2M7 12.8h7.2" />
      <path d="M3.2 3.2h1.3v2.7M3.2 5.9h1.3M3.1 9.6c.5 0 1 .25 1 .8s-.5.8-1 .8c.5 0 1 .3 1 .85s-.5.85-1 .85H2.5" />
    </Icon>
  ),
  Ul: () => (
    <Icon>
      <path d="M7 4.2h7.2M7 8.5h7.2M7 12.8h7.2" />
      <circle cx="3.4" cy="4.2" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="3.4" cy="8.5" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="3.4" cy="12.8" r="1.05" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Align: () => (
    <Icon>
      <path d="M2.6 4.2h11.8M2.6 8.5h9M2.6 12.8h11.8" />
    </Icon>
  ),
  More: () => (
    <Icon>
      <circle cx="3.4" cy="8.5" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="8.5" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="8.5" r="1.05" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Help: () => (
    <Icon>
      <circle cx="8.5" cy="8.5" r="5.8" />
      <path d="M6.8 6.6a1.8 1.8 0 0 1 3.4 1c0 1.15-1.7 1.5-1.7 2.55" />
      <circle cx="8.5" cy="12" r=".6" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Undo: () => (
    <Icon>
      <path d="M4.2 8H10.6a3.2 3.2 0 1 1 0 6.4H8.4" />
      <path d="M4.2 8 6.8 5.4M4.2 8l2.6 2.6" />
    </Icon>
  ),
  Redo: () => (
    <Icon>
      <path d="M12.8 8H6.4a3.2 3.2 0 1 0 0 6.4H8.6" />
      <path d="M12.8 8l-2.6-2.6M12.8 8l-2.6 2.6" />
    </Icon>
  ),
  Hr: () => (
    <Icon>
      <path d="M2.6 8.5h11.8" />
    </Icon>
  ),
  Clear: () => (
    <Icon>
      <path d="M4.2 13.4h5.9M6.6 3.8 3.6 13.4M10.2 3.8 8.3 8.9" />
      <path d="M5.9 3.8h5.4" />
    </Icon>
  ),
  Indent: () => (
    <Icon>
      <path d="M2.6 4.2h11.8M2.6 8.5h11.8M2.6 12.8h11.8" />
      <path d="M5.4 6.3 3 8.5l2.4 2.2" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Outdent: () => (
    <Icon>
      <path d="M2.6 4.2h11.8M2.6 8.5h11.8M2.6 12.8h11.8" />
      <path d="M3.2 6.3l2.4 2.2-2.4 2.2" fill="currentColor" stroke="none" />
    </Icon>
  ),
  ViewRich: () => (
    <Icon>
      <rect x="2.6" y="3.6" width="11.8" height="9.8" rx="1.3" />
      <path d="M5.2 7.2h6.6M5.2 9.9h4.4" />
    </Icon>
  ),
  ViewMd: () => (
    <Icon>
      <rect x="1.8" y="3.6" width="13.4" height="9.8" rx="1.3" />
      <path d="M3.8 10.2V6.4l2.2 2.6 2.2-2.6v3.8M10.6 6.4v3.8h1.8M11 8.3h1.8" />
    </Icon>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M9 3.6v10.8M3.6 9h10.8" />
    </svg>
  ),
  Pdf: () => (
    <Icon>
      <path d="M4.8 3.6h5l3.4 3.6v6.2H4.8Z" />
      <path d="M9.8 3.6v3.6h3.4" />
      <path d="M6.8 10h4M6.8 12.1h2.8" />
    </Icon>
  ),
};
