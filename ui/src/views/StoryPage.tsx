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
  type GuestLink,
  type Story,
  type SummaryStatus,
} from "../api";
import { loadGuest, loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";
import { WritingPanel } from "./WritingPanel";

// The editor with its Markdown grammar is large; it is loaded when a chapter is opened.
const ManuscriptEditor = lazy(() =>
  import("./ManuscriptEditor").then((module) => ({
    default: module.ManuscriptEditor,
  })),
);

/**
 * One story: guests from other worlds, writing mode, chapters, new chapter (novels), chapter
 * text in the editor.
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
          guests={story.guest_links}
          onSaved={reload}
          onStory={setStory}
        />
      )}
    </div>
  );
}

/**
 * Gäste aus anderen Welten (FR-017, step 3.7): entries of other worlds bound into this story
 * only. The AI knows a guest when it is named with `@`, led by the author or put into a new
 * scene; otherwise only if the budget has room after the world's own entries.
 */
function Guests({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const loadWorlds = useCallback(() => api.worlds(), []);
  const worlds = useLoad(loadWorlds);
  const links = story.guest_links;
  const loadLinked = useCallback(
    () => Promise.all(links.map(loadGuest)),
    [links],
  );
  const linked = useLoad(loadLinked);
  const [from, setFrom] = useState("");
  const loadOffered = useCallback(
    () => (from === "" ? Promise.resolve([]) : api.entries(from)),
    [from],
  );
  const offered = useLoad(loadOffered);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState<string | null>(null);

  const otherWorlds = (worlds.data ?? []).filter((w) => w.id !== story.world);
  const worldName = (id: string) =>
    (worlds.data ?? []).find((w) => w.id === id)?.name ?? id;
  const choices = (offered.data ?? []).filter(
    (candidate) =>
      !links.some((l) => l.world === from && l.entry === candidate.id),
  );

  async function add(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      onSaved(
        await api.addGuest(story.world, story.id, { world: from, entry }),
      );
      setEntry("");
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  async function remove(link: GuestLink, name: string) {
    setError(null);
    if (story.controlled_characters.includes(link.entry)) {
      setError(
        `${name} führst du selbst – erst in der Figuren-Schreibweise abwählen.`,
      );
      return;
    }
    try {
      onSaved(await api.removeGuest(story.world, story.id, link));
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details>
      <summary>Gäste aus anderen Welten ({links.length})</summary>
      <div className="stack">
        <p className="note">
          Ein Gast gilt nur in dieser Geschichte. Die KI kennt ihn, wenn du ihn
          mit @ nennst, selbst führst oder in eine neue Szene setzt – sonst nur,
          wenn nach dem Kanon dieser Welt noch Platz ist. Die Regeln seiner
          Heimatwelt gelten hier nicht.
        </p>
        {links.length > 0 && (
          <ul aria-label="Gäste">
            {links.map((link, index) => {
              const found = linked.data?.[index];
              const name = found?.name ?? link.entry;
              return (
                <li key={`${link.world}/${link.entry}`} className="row">
                  <span>
                    {name} aus {worldName(link.world)}
                    {found === null && " – Eintrag fehlt in seiner Welt"}
                  </span>
                  <button type="button" onClick={() => void remove(link, name)}>
                    {name} entfernen
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form className="row" onSubmit={(event) => void add(event)}>
          <Field label="Welt des Gastes">
            <select
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setEntry("");
              }}
            >
              <option value="">– Welt wählen –</option>
              {otherWorlds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gast-Eintrag">
            <select
              value={entry}
              disabled={from === ""}
              onChange={(event) => {
                setEntry(event.target.value);
              }}
            >
              <option value="">– Eintrag wählen –</option>
              {choices.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </Field>
          <button type="submit" disabled={entry === ""}>
            Als Gast einbinden
          </button>
        </form>
        <ErrorText
          message={worlds.error ?? linked.error ?? offered.error ?? error}
        />
      </div>
    </details>
  );
}

/**
 * Figuren-Schreibweise (FR-012): perspective and the characters the author leads; the AI
 * writes no action, speech or thought for them. Guest characters of the story can be led too.
 */
function WritingMode({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const load = useCallback(
    () => loadStoryEntries(story.world, story.guest_links),
    [story.world, story.guest_links],
  );
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
              {entry.world === story.world
                ? entry.name
                : `${entry.name} (Gast)`}
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
  guests,
  onSaved,
  onStory,
}: {
  chapter: Chapter;
  /** Guest links of the story, offered in the writing panel. */
  guests: readonly GuestLink[];
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
        guests={guests}
        prepare={() => (state === "dirty" ? save() : Promise.resolve(true))}
        onAccept={append}
      />
    </section>
  );
}
