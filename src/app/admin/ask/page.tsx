import { AdminAsk } from "@/components/AdminAsk";
import { getAdminQuestions } from "@/lib/questions";

export default async function AdminAskPage() {
  return <AdminAsk initialEntries={await getAdminQuestions()} />;
}
