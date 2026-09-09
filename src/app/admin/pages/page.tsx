import { PageManager } from "@/components/PageManager";
import { getSitePages } from "@/lib/pages";
export default async function AdminPagesPage() { return <PageManager initialPages={await getSitePages(true)} />; }
