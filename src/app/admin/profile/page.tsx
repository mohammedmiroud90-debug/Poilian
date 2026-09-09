import { AdminInfoPage } from "@/components/AdminInfoPage";
export default function ProfilePage() { return <AdminInfoPage eyebrow="ACCOUNT" title="Admin profile" description="You are signed in with an administrator account. Your account permissions are managed in Parse through the isAdmin field." links={[["/admin/settings", "Open site settings"]]} />; }
