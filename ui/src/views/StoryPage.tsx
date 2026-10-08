import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError, type Story } from "../api";
import { useLoad } from "../useLoad";
import { CanonLookup } from "./CanonLookup";
import { ChapterEditor } from "./ChapterEditor";
import { ErrorText } from "./Common";
import { Facts } from "./Facts";
import { Guests } from "./Guests";
import { StorySummary } from "./StorySummary";
import { WritingMode } from "./WritingMode";

/** Below this width the side bar opens over the page as a menu (step 5.11). */
const NARROW = "(max-width: 56rem)";

/**
 * One story, laid out for writing (step 5.11): in the middle the open chapter with its editor,
 * the Figuren-Schreibweise and the writing panel; on the side a bar that can be closed, with
 * the chapters, the canon to look up and the settings of the story (guests, facts, overall
 * summary). On narrow screens the bar opens over the page.
 */
export function StoryPage({ story: initial }: { story: Story }) {
  // Settings saved on this page win over the story passed in until the page is left.
  const [saved, setStory] = useState<Story | null>(null);
  const story = saved?.id === initial.id ? saved : initial;
  const load = useCallback(() => api.chapters(story.world, story.id), [story]);
  const { data, error, reload } = useLoad(load);
  const [open, setOpen] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [narrow] = useState(() => matches(NARROW));
  const [side, setSide] = useState(!narrow);
  const [canonRound, setCanonRound] = useState(0);

  const chapters = data ?? [];
  const current =
    chapters.find((chapter) => chapter.number === open) ?? chapters[0];

  async function addChapter(event: SyntheticEvent) {
    event.preventDefault();
    setCreateError(null);
    try {
      const created = await api.saveChapter(
        story.world,
        story.id,
        chapters.length + 1,
        {
          title: newTitle,
        },
      );
      setNewTitle("");
      setOpen(created.number);
      reload();
    } catch (reason: unknown) {
      setCreateError(describeError(reason));
    }
  }

  return (
    <div className={side ? "story with-side" : "story"}>
      <div className="story-main stack">
        <div className="row">
          <h2>{story.title}</h2>
          <span className="spacer" />
          <button
            type="button"
            aria-expanded={side}
            aria-controls="story-side"
            onClick={() => {
              setSide(!side);
            }}
          >
            {side ? "Leiste schließen" : "Kapitel, Kanon, Geschichte"}
          </button>
        </div>
        <ErrorText message={error} />
        {current !== undefined ? (
          <ChapterEditor
            key={current.number}
            chapter={current}
            story={story}
            onSaved={reload}
            onStory={setStory}
            onCanonChanged={() => {
              setCanonRound((round) => round + 1);
            }}
            mode={<WritingMode story={story} onSaved={setStory} />}
          />
        ) : (
          data !== undefined && (
            <p className="card note">
              Noch kein Kapitel – lege in der Leiste unter „Kapitel“ eines an.
            </p>
          )
        )}
      </div>
      {side && (
        <aside
          id="story-side"
          className="story-side card"
          aria-label="Kapitel, Kanon und Geschichte"
        >
          {narrow && (
            <button
              type="button"
              className="link"
              onClick={() => {
                setSide(false);
              }}
            >
              Schließen
            </button>
          )}
          <section className="stack">
            <h3>Kapitel</h3>
            <nav aria-label="Kapitel">
              <ul className="list">
                {chapters.map((chapter) => (
                  <li key={chapter.number}>
                    <button
                      type="button"
                      aria-current={chapter.number === current?.number}
                      onClick={() => {
                        setOpen(chapter.number);
                        if (narrow) {
                          setSide(false);
                        }
                      }}
                    >
                      {chapter.number}. {chapter.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            {story.form === "roman" && (
              <form
                className="row"
                onSubmit={(event) => void addChapter(event)}
              >
                <input
                  aria-label="Titel des neuen Kapitels"
                  placeholder="Titel des neuen Kapitels"
                  value={newTitle}
                  onChange={(event) => {
                    setNewTitle(event.target.value);
                  }}
                  required
                />
                <button type="submit">Kapitel anlegen</button>
              </form>
            )}
            <ErrorText message={createError} />
          </section>
          <section className="stack">
            <h3>Kanon</h3>
            <CanonLookup
              key={canonRound}
              world={story.world}
              guests={story.guest_links}
            />
          </section>
          <section className="stack">
            <h3>Geschichte</h3>
            <Guests story={story} onSaved={setStory} />
            <Facts story={story} onSaved={setStory} />
            <StorySummary
              key={story.summary}
              story={story}
              onSaved={setStory}
            />
          </section>
        </aside>
      )}
    </div>
  );
}

/** Whether the media query applies; `false` where the browser cannot tell (tests). */
function matches(query: string): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
}
