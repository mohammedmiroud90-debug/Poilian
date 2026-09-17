import { currentSpaceUser, getSpaceAnswers } from "@/lib/space";

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function SpaceAnswersPage() {
  const user = await currentSpaceUser();
  if (!user) return null;
  const answers = await getSpaceAnswers(user.email);

  return (
    <section className="space-page">
      <header className="space-page-title">
        <p className="section-label">USER SPACE</p>
        <h1>Your answers</h1>
        <p>Questions submitted with {user.email} and any replies published on Ask me.</p>
      </header>

      {answers.length === 0 ? (
        <p className="space-empty">No questions yet. Ask one on the Ask me page.</p>
      ) : (
        <ul className="space-list">
          {answers.map((item) => (
            <li key={item.id}>
              <div className="space-list-head">
                <strong>{item.title}</strong>
                <span className={`space-pill is-${item.status}`}>{item.status}</span>
              </div>
              <p>{stripHtml(item.question).slice(0, 220)}</p>
              {item.answer ? (
                <blockquote>{stripHtml(item.answer).slice(0, 320)}</blockquote>
              ) : (
                <small>Waiting for a reply.</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
