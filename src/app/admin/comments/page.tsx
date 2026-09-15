import { AdminComments } from "@/components/AdminComments";
import { getAdminPosts, getCommentsForPosts } from "@/lib/parse";
import { getAuthorProfile } from "@/lib/profile";

export default async function AdminCommentsPage() {
  const [posts, profile] = await Promise.all([getAdminPosts(), getAuthorProfile()]);
  const byId = new Map(posts.map((post) => [post.id, post]));
  const comments = await getCommentsForPosts(posts.map((post) => post.id));
  const entries = comments.map((comment) => {
    const post = byId.get(comment.postId || "");
    return {
      ...comment,
      post: post?.title || "Unknown post",
      postId: comment.postId || post?.id || "",
      slug: post?.slug || "",
    };
  });
  return <AdminComments initialEntries={entries} author={profile.name || "Poilian"} />;
}
