"use client";

import { useEffect, useId, useState } from "react";

export type FrameImage = {
  src: string;
  file: string;
  title: string;
  body: string;
  points: string[];
  category: "travel" | "career" | "recognition";
};

type TabId = "overview" | "travel" | "career" | "recognition";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "travel", label: "Travel stills" },
  { id: "career", label: "Professional life" },
  { id: "recognition", label: "Recognition" },
];

const panelCopy: Record<
  TabId,
  { side: string; title: string; lead: string; body: string; points: string[] }
> = {
  overview: {
    side: "Overview",
    title: "Frames shaped by journeys and work.",
    lead: "Selected stills from travel and professional life, presented in monochrome.",
    body: "This archive gathers quiet roads, rooms where projects took shape, and ceremonies that marked progress. Black and white keeps attention on light, gesture and place — so each frame reads as a chapter rather than a colour study.",
    points: [
      "Travel stills from roads, cities and open horizons",
      "Professional moments from projects and gatherings",
      "Recognition frames tied to academic and innovation work",
      "A personal record across study, practice and place",
    ],
  },
  travel: {
    side: "Travel stills",
    title: "On the road between destinations.",
    lead: "Light, distance and the pause before the next stop.",
    body: "These frames come from trips across Algeria and beyond — long horizons, roadside quiet, and the in-between hours when the journey itself becomes the subject.",
    points: [
      "Open roads and long horizons",
      "Everyday places seen in transit",
      "Monochrome emphasis on form and sky",
      "A travel diary without tourist gloss",
    ],
  },
  career: {
    side: "Professional life",
    title: "Rooms, people and work in progress.",
    lead: "Career moments kept as still evidence of practice.",
    body: "From project spaces to shared events, these photographs hold the texture of professional life — collaboration, presentation and the ordinary settings where ideas move forward.",
    points: [
      "Field and studio contexts",
      "Gatherings around shared work",
      "Process over spectacle",
      "A visual CV of places and people",
    ],
  },
  recognition: {
    side: "Recognition",
    title: "Milestones marked in formal light.",
    lead: "Ceremony, certificate and the weight of a shared moment.",
    body: "Recognition frames document academic and innovation achievement — official ceremonies, awards and the people present when contribution was acknowledged.",
    points: [
      "Formal ceremonies and awards",
      "Certificate and recognition moments",
      "Innovation-focused academic events",
      "A milestone for the professional timeline",
    ],
  },
};

function MonoFrame({
  image,
  index,
}: {
  image: FrameImage;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className={`photo-frames-shot${loaded ? " is-loaded" : ""}`} style={{ ["--i" as string]: index }}>
      <div className="photo-frames-media">
        <span className="photo-frames-skeleton" aria-hidden="true" />
        <img
          src={image.src}
          alt={image.title}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <figcaption>
        <strong>{image.title}</strong>
        <p>{image.body}</p>
        {image.points.length > 0 && (
          <ul>
            {image.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
      </figcaption>
    </figure>
  );
}

export function PhotographyFrames({ images }: { images: FrameImage[] }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [visible, setVisible] = useState(true);
  const baseId = useId();
  const copy = panelCopy[tab];

  const filtered =
    tab === "overview" ? images : images.filter((image) => image.category === tab);

  function choose(next: TabId) {
    if (next === tab) return;
    setVisible(false);
    window.setTimeout(() => {
      setTab(next);
      setVisible(true);
    }, 180);
  }

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section className="photo-frames" id="gallery" aria-labelledby={`${baseId}-title`}>
      <div className="photo-chrome-shell">
        <h2 id={`${baseId}-title`} className="photo-frames-heading">
          These frames are available across trips &amp; career.
        </h2>

        <div className="photo-frames-tabs" role="tablist" aria-label="Frame categories">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`${baseId}-panel`}
              className={tab === item.id ? "is-active" : ""}
              onClick={() => choose(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab}`}
          className={`photo-frames-panel${visible ? " is-visible" : ""}`}
        >
          <div className="photo-frames-layout">
            <h3 className="photo-frames-side">{copy.side}</h3>
            <div className="photo-frames-main">
              <h4>{copy.title}</h4>
              <p className="photo-frames-lead">{copy.lead}</p>
              <p className="photo-frames-body">{copy.body}</p>
              <ul className="photo-frames-bullets">
                {copy.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              {filtered.length > 0 ? (
                <div className="photo-frames-shots" key={tab}>
                  {filtered.map((image, index) => (
                    <MonoFrame key={`${tab}-${image.file}`} image={image} index={index} />
                  ))}
                </div>
              ) : (
                <p className="photo-frames-empty">No frames in this category yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
