import type { Metadata } from "next";
import { SpaceLogin } from "@/components/SpaceLogin";
import { SpaceShell } from "@/components/SpaceShell";
import { currentSpaceUser } from "@/lib/space";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "User space",
};

export const dynamic = "force-dynamic";

export default async function SpaceLayout({ children }: { children: React.ReactNode }) {
  const user = await currentSpaceUser();
  if (!user) return <SpaceLogin />;
  return <SpaceShell username={user.username}>{children}</SpaceShell>;
}
