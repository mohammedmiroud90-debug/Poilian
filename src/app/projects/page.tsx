import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <><BlogHeader /><main className="content-page projects-page"><p className="section-label">SELECTED WORK</p><h1>Projects &amp; Companies</h1><p className="page-intro">A collection of the projects, ideas and companies I&apos;m building and contributing to.</p><div className="project-showcase">{projects.map((project) => <article key={project.id}><div className="project-copy"><p>{project.company || "PROJECT"}</p><h2>{project.title}</h2><span>{project.summary}</span>{project.url && <a href={project.url} target="_blank" rel="noreferrer">View project <b>↗</b></a>}</div>{project.imageUrl ? <img src={project.imageUrl} alt="" /> : <div className="project-mark" aria-hidden="true">{project.title.slice(0, 1)}</div>}</article>)}</div><Link className="back-link" href="/en">← Back home</Link></main></>;
}
