import {
  lazy,
  Suspense,
  useCallback,
  useState,
  type SyntheticEvent,
} from "react";
import {
  api,
  describeError,
  type CanonEntry,
  type Chapter,
  type Story,
} from "../api";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";
import { WritingPanel } from "./WritingPanel";

// The editor with its Markdown grammar is large; it is loaded when a chapter is opened.
const ManuscriptEditor = lazy(() =>
  import("./ManuscriptEditor").then((module) => ({
    default: module.ManuscriptEditor,
  })),
);

/** One story: writing mode, chapters, new chapter (novels), chapter text in the editor. */
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
        <WritingMode story={story} onSaved={setStory} />
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
          onSaved={reload}
        />
      )}
    </div>
  );
}

/**
 * Figuren-Schreibweise (FR-012): perspective and the characters the author leads; the AI
 * writes no action, speech or thought for them.
 */
function WritingMode({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const load = useCallback(() => api.entries(story.world), [story.world]);
  const entries = useLoad(load);
  const [perspective, setPerspective] = useState(story.perspective ?? "");
  const [led, setLed] = useState<string[]>(story.controlled_characters);
  const [state, setState] = useState<"clean" | "dirty" | "saved">("clean");
  const [error, setError] = useState<string | null>(null);

  const figures = (entries.data ?? []).filter(
    (entry: CanonEntry) => entry.category === "figur",
  );

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      const clean = perspective.trim();
      onSaved(
        await api.updateStory(story.world, story.id, {
          perspective: clean === "" ? null : clean,
          controlled_characters: led,
        }),
      );
      setState("saved");
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details>
      <summary>Figuren-Schreibweise</summary>
      <form className="stack" onSubmit={(event) => void save(event)}>
        <Field label="Erzählperspektive">
          <input
            value={perspective}
            placeholder="z. B. Ich-Erzählerin, Präteritum"
            onChange={(event) => {
              setPerspective(event.target.value);
              setState("dirty");
            }}
          />
        </Field>
        <div
          className="row"
          role="group"
          aria-label="Figuren, die du selbst führst"
        >
          {figures.map((entry) => (
            <label className="check" key={entry.id}>
              <input
                type="checkbox"
                checked={led.includes(entry.id)}
                onChange={(event) => {
                  setLed(
                    event.target.checked
                      ? [...led, entry.id]
                      : led.filter((id) => id !== entry.id),
                  );
                  setState("dirty");
                }}
              />
              {entry.name}
            </label>
          ))}
        </div>
        <p className="note">
          Für die gewählten Figuren schreibt die KI keine Handlung, Rede oder
          Gedanken, nur was sie wahrnehmen – und hört dort auf, wo du
          weiterschreibst.
        </p>
        <ErrorText message={entries.error ?? error} />
        <div className="row">
          <button type="submit" disabled={state !== "dirty"}>
            Schreibweise speichern
          </button>
          {state === "saved" && <span className="ok">Gespeichert.</span>}
        </div>
      </form>
    </details>
  );
}

function ChapterEditor({
  chapter,
  onSaved,
}: {
  chapter: Chapter;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(chapter.title);
  const [text, setText] = useState(chapter.text);
  const [state, setState] = useState<"clean" | "dirty" | "saved">("clean");
  const [error, setError] = useState<string | null>(null);

  async function save(): Promise<boolean> {
    setError(null);
    try {
      await api.saveChapter(chapter.world, chapter.story, chapter.number, {
        title,
        text,
      });
      setState("saved");
      onSaved();
      return true;
    } catch (reason: unknown) {
      setError(describeError(reason));
      return false;
    }
  }

  /** Taken-over AI text goes to the end of the chapter and is saved at once (FR-009). */
  async function append(proposal: string) {
    const own = text.trimEnd();
    const next = own === "" ? proposal.trim() : `${own}\n\n${proposal.trim()}`;
    await api.saveChapter(chapter.world, chapter.story, chapter.number, {
      title,
      text: next,
    });
    setText(next);
    setState("saved");
    onSaved();
  }

  async function complete() {
    setError(null);
    try {
      await api.completeChapter(chapter.world, chapter.story, chapter.number);
      onSaved();
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <section className="card">
      <Field label="Kapiteltitel">
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setState("dirty");
          }}
        />
      </Field>
      <Suspense fallback={<p>Editor lädt …</p>}>
        <ManuscriptEditor
          label="Manuskript"
          value={text}
          onChange={(value) => {
            setText(value);
            setState("dirty");
          }}
        />
      </Suspense>
      <ErrorText message={error} />
      <div className="row">
        <button
          type="button"
          onClick={() => void save()}
          disabled={state !== "dirty"}
        >
          Speichern
        </button>
        {state === "saved" && <span className="ok">Gespeichert.</span>}
        {chapter.status === "abgeschlossen" ? (
          <span className="note">Kapitel abgeschlossen</span>
        ) : (
          <button type="button" onClick={() => void complete()}>
            Kapitel abschließen
          </button>
        )}
      </div>
      <WritingPanel
        world={chapter.world}
        story={chapter.story}
        chapter={chapter.number}
        prepare={() => (state === "dirty" ? save() : Promise.resolve(true))}
        onAccept={append}
      />
    </section>
  );
}
