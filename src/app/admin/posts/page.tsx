import { PostManager } from "@/components/PostManager";
import { getAdminPosts } from "@/lib/parse";

export default async function AdminPostsPage() {
  return <PostManager initialPosts={await getAdminPosts()} />;
}
