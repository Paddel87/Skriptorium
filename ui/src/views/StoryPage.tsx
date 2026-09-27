import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError, type Story } from "../api";
import { useLoad } from "../useLoad";
import { ChapterEditor } from "./ChapterEditor";
import { ErrorText } from "./Common";
import { Facts } from "./Facts";
import { Guests } from "./Guests";
import { StorySummary } from "./StorySummary";
import { WritingMode } from "./WritingMode";

/**
 * One story: guests from other worlds, writing mode, facts of this story, chapters, new chapter
 * (novels), chapter text in the editor.
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
    <div className="stack">
      <section className="card">
        <h2>{story.title}</h2>
        {story.perspective !== null && (
          <p className="note">Perspektive: {story.perspective}</p>
        )}
        <Guests story={story} onSaved={setStory} />
        <WritingMode story={story} onSaved={setStory} />
        <Facts story={story} onSaved={setStory} />
        <StorySummary key={story.summary} story={story} onSaved={setStory} />
        <ErrorText message={error} />
        {chapters.length > 1 && (
          <nav className="row" aria-label="Kapitel">
            {chapters.map((chapter) => (
              <button
                type="button"
                key={chapter.number}
                aria-current={chapter.number === current?.number}
                onClick={() => {
                  setOpen(chapter.number);
                }}
              >
                {chapter.number}. {chapter.title}
              </button>
            ))}
          </nav>
        )}
        {story.form === "roman" && (
          <form className="row" onSubmit={(event) => void addChapter(event)}>
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
      {current !== undefined && (
        <ChapterEditor
          key={current.number}
          chapter={current}
          story={story}
          onSaved={reload}
          onStory={setStory}
        />
      )}
    </div>
  );
}
