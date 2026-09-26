import {
  lazy,
  Suspense,
  useCallback,
  useState,
  type SyntheticEvent,
} from "react";
import { api, describeError, type Chapter, type Story } from "../api";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";
import { WritingPanel } from "./WritingPanel";

// The editor with its Markdown grammar is large; it is loaded when a chapter is opened.
const ManuscriptEditor = lazy(() =>
  import("./ManuscriptEditor").then((module) => ({
    default: module.ManuscriptEditor,
  })),
);

/** One story: chapters, new chapter (novels), chapter text in the editor. */
export function StoryPage({ story }: { story: Story }) {
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
