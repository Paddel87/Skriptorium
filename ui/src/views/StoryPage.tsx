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
  describeSummaryFailure,
  type CanonEntry,
  type Chapter,
  type Story,
  type SummaryStatus,
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
          onSaved={reload}
          onStory={setStory}
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

/**
 * Gesamtzusammenfassung (FR-010): continued by the AI whenever a chapter summary is created;
 * the author can read and change it.
 */
function StorySummary({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const [summary, setSummary] = useState(story.summary);
  const [error, setError] = useState<string | null>(null);

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      onSaved(await api.setStorySummary(story.world, story.id, summary));
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details>
      <summary>Gesamtzusammenfassung</summary>
      <form className="stack" onSubmit={(event) => void save(event)}>
        {story.summary === "" && (
          <p className="note">
            Entsteht, sobald das erste Kapitel abgeschlossen ist.
          </p>
        )}
        <Field label="Gesamtzusammenfassung">
          <textarea
            rows={8}
            value={summary}
            onChange={(event) => {
              setSummary(event.target.value);
            }}
          />
        </Field>
        <ErrorText message={error} />
        <div className="row">
          <button type="submit" disabled={summary === story.summary}>
            Gesamtzusammenfassung speichern
          </button>
        </div>
      </form>
    </details>
  );
}

const SUMMARY_STATUS_TEXT: Record<SummaryStatus, string> = {
  fehlt: "fehlt – die KI nutzt den Kapitelanfang",
  erzeugt: "von der KI erstellt, noch nicht geprüft",
  geprüft: "geprüft",
};

/**
 * Kurzfassung of a chapter (FR-010): shown once the chapter is completed or has one; saving
 * marks it as checked; a missing or unwanted one can be created again.
 */
function ChapterSummary({
  chapter,
  busy,
  onSummarize,
  onSaved,
}: {
  chapter: Chapter;
  busy: boolean;
  onSummarize: () => void;
  onSaved: () => void;
}) {
  const [summary, setSummary] = useState(chapter.summary);
  const [error, setError] = useState<string | null>(null);

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      await api.setChapterSummary(
        chapter.world,
        chapter.story,
        chapter.number,
        summary,
        summary.trim() === "" ? "fehlt" : "geprüft",
      );
      onSaved();
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <form className="stack" onSubmit={(event) => void save(event)}>
      <Field label="Kurzfassung des Kapitels">
        <textarea
          rows={5}
          value={summary}
          onChange={(event) => {
            setSummary(event.target.value);
          }}
        />
      </Field>
      <p className="note">
        Status: {SUMMARY_STATUS_TEXT[chapter.summary_status]}
      </p>
      <ErrorText message={error} />
      <div className="row">
        <button
          type="submit"
          disabled={
            busy ||
            (summary === chapter.summary &&
              chapter.summary_status !== "erzeugt")
          }
        >
          Kurzfassung speichern (geprüft)
        </button>
        <button type="button" disabled={busy} onClick={onSummarize}>
          {chapter.summary_status === "fehlt"
            ? "Kurzfassung nachholen"
            : "Kurzfassung neu erstellen"}
        </button>
      </div>
    </form>
  );
}

function ChapterEditor({
  chapter,
  onSaved,
  onStory,
}: {
  chapter: Chapter;
  onSaved: () => void;
  /** The story after its overall summary changed. */
  onStory: (story: Story) => void;
}) {
  const [title, setTitle] = useState(chapter.title);
  const [text, setText] = useState(chapter.text);
  const [state, setState] = useState<"clean" | "dirty" | "saved">("clean");
  const [error, setError] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryNote, setSummaryNote] = useState<string | null>(null);

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

  /** Create the chapter summary and continue the overall summary (step 3.6). */
  async function summarize() {
    setSummarizing(true);
    setSummaryNote(null);
    setError(null);
    try {
      const result = await api.summarizeChapter(
        chapter.world,
        chapter.story,
        chapter.number,
      );
      onStory(result.story);
      if (result.failure !== null) {
        setSummaryNote(describeSummaryFailure(result.failure));
      }
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setSummarizing(false);
      onSaved();
    }
  }

  /** Own unsaved text is saved first; the summary follows right after. */
  async function complete() {
    setError(null);
    if (state === "dirty" && !(await save())) {
      return;
    }
    try {
      await api.completeChapter(chapter.world, chapter.story, chapter.number);
    } catch (reason: unknown) {
      setError(describeError(reason));
      return;
    }
    await summarize();
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
          <button
            type="button"
            disabled={summarizing}
            onClick={() => void complete()}
          >
            Kapitel abschließen
          </button>
        )}
        {summarizing && (
          <span className="note" role="status">
            Kurzfassung wird erstellt …
          </span>
        )}
      </div>
      {summaryNote !== null && (
        <p className="error" role="alert">
          {summaryNote}
        </p>
      )}
      {(chapter.status === "abgeschlossen" || chapter.summary !== "") && (
        <ChapterSummary
          key={`${chapter.summary_status}:${chapter.summary}`}
          chapter={chapter}
          busy={summarizing}
          onSummarize={() => void summarize()}
          onSaved={onSaved}
        />
      )}
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
