import { SettingsManager } from "@/components/SettingsManager";
import { getAuthorProfile } from "@/lib/profile";
import { getNotes } from "@/lib/notes";

export default async function SettingsPage() {
  const profile = await getAuthorProfile();
  return (
    <SettingsManager
      initialImage={profile.promotionImage}
      initialLogo={profile.logoUrl}
      initialCommentAvatar={profile.commentAvatarUrl}
      initialFavicon={profile.faviconUrl}
      initialPostContentFont={profile.postContentFont}
      initialPostHeadingFont={profile.postHeadingFont}
      initialNotes={await getNotes(true)}
    />
  );
}
