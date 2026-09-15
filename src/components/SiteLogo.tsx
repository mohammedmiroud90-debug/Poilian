"use client";

import { createContext, useContext } from "react";
import { defaultCommentAvatarUrl, defaultLogoUrl } from "@/lib/branding";

const SiteLogoContext = createContext(defaultLogoUrl);
const CommentAvatarContext = createContext(defaultCommentAvatarUrl);

export function SiteBrandingProvider({
  logoUrl,
  commentAvatarUrl,
  children,
}: {
  logoUrl?: string;
  commentAvatarUrl?: string;
  children: React.ReactNode;
}) {
  return (
    <SiteLogoContext.Provider value={logoUrl?.trim() || defaultLogoUrl}>
      <CommentAvatarContext.Provider value={commentAvatarUrl?.trim() || defaultCommentAvatarUrl}>
        {children}
      </CommentAvatarContext.Provider>
    </SiteLogoContext.Provider>
  );
}

export function useDefaultCommentAvatar() {
  return useContext(CommentAvatarContext);
}

export function SiteLogo({
  alt = "Bitt-i.com",
  width,
  height,
  className,
  priority,
}: {
  alt?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  const src = useContext(SiteLogoContext);
  return <img src={src} alt={alt} width={width} height={height} className={className} fetchPriority={priority ? "high" : undefined} />;
}
