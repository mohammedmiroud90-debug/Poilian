"use client";

import Image from "next/image";
import { useState } from "react";

const avatarUrl = "https://founder.brintiel.com/static/images/profile-pic.png";

export function PostAuthor({ author }: { author: string }) {
  const [following, setFollowing] = useState(false);
  return <section className="post-author-end" aria-label={`About ${author}`}><Image className="post-author-avatar" src={avatarUrl} alt="" width={48} height={48} /><div><strong>Written by {author}</strong><span>Personal writing, research and practical perspectives from Algeria.</span></div><button type="button" onClick={() => setFollowing((value) => !value)}>{following ? "Following" : "Follow"}</button></section>;
}
