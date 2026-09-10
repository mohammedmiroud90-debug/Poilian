import { SettingsManager } from "@/components/SettingsManager";
import { getAuthorProfile } from "@/lib/profile";

export default async function SettingsPage() {
  const profile = await getAuthorProfile();
  return <SettingsManager initialImage={profile.promotionImage} />;
}
