import { currentSpaceUser, getSpaceMessages } from "@/lib/space";

export default async function SpaceMessagesPage() {
  const user = await currentSpaceUser();
  if (!user) return null;
  const messages = await getSpaceMessages(user.email);

  return (
    <section className="space-page">
      <header className="space-page-title">
        <p className="section-label">USER SPACE</p>
        <h1>Your messages</h1>
        <p>Contact and quote requests submitted with {user.email}.</p>
      </header>

      {messages.length === 0 ? (
        <p className="space-empty">No messages yet. Use the contact form to send one.</p>
      ) : (
        <ul className="space-list">
          {messages.map((item) => (
            <li key={item.id}>
              <div className="space-list-head">
                <strong>{item.subject || "Message"}</strong>
                <span className="space-pill">{item.status || "new"}</span>
              </div>
              {item.topic ? <small>Topic: {item.topic}</small> : null}
              <p>{item.message}</p>
              <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("en-US")}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
