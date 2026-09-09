import Link from "next/link";

type IconName = "posts" | "pages" | "comments" | "settings";

function Icon({ name }: { name: IconName }) {
  const paths = {
    posts: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    pages: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v5h5M9 12h6M9 16h6" /></>,
    comments: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20h-3v-.08A1.7 1.7 0 0 0 10.68 18.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.02 14.7 1.7 1.7 0 0 0 5.47 13.7H5v-3h.08A1.7 1.7 0 0 0 6.6 9.67a1.7 1.7 0 0 0-.34-1.88L6.2 7.73 8.32 5.6l.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.3 4.45V4h3v.08a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1.03H20v3h-.08A1.7 1.7 0 0 0 18.4 14.7Z" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

const workspaces: { title: string; description: string; href: string; icon: IconName }[] = [
  { title: "Manage posts", description: "Create, edit, and publish your articles.", href: "/admin/posts", icon: "posts" },
  { title: "Manage pages", description: "Update the public pages across your website.", href: "/admin/pages", icon: "pages" },
  { title: "Check comments", description: "Review and moderate reader conversations.", href: "/admin/comments", icon: "comments" },
  { title: "Website settings", description: "Control your website preferences and details.", href: "/admin/settings", icon: "settings" },
];

export function AdminOverview() {
  return (
    <section className="admin-home">
      <header className="admin-home-intro">
        <p className="section-label">POILIAN ADMIN</p>
        <h1>Manage your website.</h1>
        <p>Choose a workspace to create, update, and keep your website running smoothly.</p>
      </header>

      <div className="admin-home-cards">
        {workspaces.map((workspace) => (
          <Link href={workspace.href} key={workspace.href} className="admin-home-card">
            <span className="admin-home-icon"><Icon name={workspace.icon} /></span>
            <div>
              <h2>{workspace.title}</h2>
              <p>{workspace.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
