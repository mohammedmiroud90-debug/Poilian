import { HomeHero } from "@/components/HomeHero";
import { HomePostList } from "@/components/HomePostList";
import { HomeFooter } from "@/components/HomeFooter";
import { getPosts } from "@/lib/parse";

export default async function PersonalBlogHome() {
  const posts = await getPosts();
  return (
    <main className="personal-home">
      <HomeHero />
      <HomePostList posts={posts} />
      <HomeFooter />
    </main>
  );
}
