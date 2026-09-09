import type { Post } from "@/lib/parse";

export const englishCategories = ["Personal Notes", "Research", "Technology", "Cybersecurity", "Photography", "Algeria"] as const;

export function postCategories(post: Post) {
  return post.category.split(/[,/|]/).map((value) => value.trim()).filter(Boolean);
}

export function postsInCategory(posts: Post[], category: string) {
  const expected = category.trim().toLowerCase();
  return posts.filter((post) => postCategories(post).some((value) => value.toLowerCase() === expected));
}
