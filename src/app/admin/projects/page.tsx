import { redirect } from "next/navigation";
import { ProjectManager } from "@/components/ProjectManager";
import { currentAdmin } from "@/lib/admin";
import { getProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";
export default async function AdminProjectsPage() { if (!await currentAdmin()) redirect("/admin"); return <ProjectManager initialProjects={await getProjects(true)} />; }
