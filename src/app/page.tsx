import { HomeHero } from "@/components/HomeHero";
import { HomePostList } from "@/components/HomePostList";
import { HomeFooter } from "@/components/HomeFooter";
import { getPosts } from "@/lib/parse";
import { getAuthorProfile } from "@/lib/profile";

export default async function PersonalBlogHome() {
  const [posts, authorProfile] = await Promise.all([getPosts(), getAuthorProfile()]);
  return (
    <main className="personal-home">
      <HomeHero />
      <HomePostList posts={posts} authorName={authorProfile.name} />
      <HomeFooter />
    </main>
  );
}
