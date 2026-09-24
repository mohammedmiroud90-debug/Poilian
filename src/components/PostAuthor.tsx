"use client";

import { useState } from "react";

export function PostAuthor({ author, bio, avatarUrl }: { author: string; bio: string; avatarUrl: string }) {
  const [following, setFollowing] = useState(false);
  return <section className="post-author-end" aria-label={`About ${author}`}><img className="post-author-avatar" src={avatarUrl} alt={`${author} - Author profile picture`} width={48} height={48} /><div><strong>Written by {author}</strong><span>{bio}</span></div><button type="button" onClick={() => setFollowing((value) => !value)}>{following ? "Following" : "Follow"}</button></section>;
}
