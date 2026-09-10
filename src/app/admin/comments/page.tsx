import { AdminComments } from "@/components/AdminComments";
import { getComments, getPosts } from "@/lib/parse";
import { getAuthorProfile } from "@/lib/profile";

export default async function AdminCommentsPage() {
  const [posts, profile] = await Promise.all([getPosts(), getAuthorProfile()]);
  const entries = (await Promise.all(posts.map(async (post) => (await getComments(post.id)).map((comment) => ({ ...comment, post: post.title, postId: post.id, slug: post.slug }))))).flat();
  return <AdminComments initialEntries={entries} author={profile.name || "Poilian"} />;
}
