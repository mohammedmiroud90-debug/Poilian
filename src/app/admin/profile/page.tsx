import { ProfileManager } from "@/components/ProfileManager";
import { getAuthorProfile } from "@/lib/profile";
export default async function ProfilePage() { return <ProfileManager initialProfile={await getAuthorProfile()} />; }
