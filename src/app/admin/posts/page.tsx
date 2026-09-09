import { PostManager } from "@/components/PostManager";
import { getPosts } from "@/lib/parse";
export default async function AdminPostsPage() { return <PostManager initialPosts={await getPosts()} />; }
