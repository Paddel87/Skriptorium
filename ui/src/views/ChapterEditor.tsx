import { lazy, Suspense, useState } from "react";
import {
  api,
  describeError,
  describeSummaryFailure,
  type Chapter,
  type Story,
} from "../api";
import { CanonFact } from "./CanonFact";
import { ChapterSummary } from "./ChapterSummary";
import { ErrorText, Field } from "./Common";
import { WritingPanel } from "./WritingPanel";

// The editor with its Markdown grammar is large; it is loaded when a chapter is opened.
const ManuscriptEditor = lazy(() =>
  import("./ManuscriptEditor").then((module) => ({
    default: module.ManuscriptEditor,
  })),
);

/**
 * One chapter: title and text in the editor, saving, completing with its summary, taking a
 * marked passage into the canon, and the writing panel below.
 */
export function ChapterEditor({
  chapter,
  story,
  onSaved,
  onStory,
}: {
  chapter: Chapter;
  /** The story; its guests are offered in the writing panel and in "In den Kanon". */
  story: Story;
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
  // Marked text in the editor, and the passage being taken into the canon (step 3.8).
  const [marked, setMarked] = useState("");
  const [taking, setTaking] = useState<string | null>(null);
  const [canonNote, setCanonNote] = useState<string | null>(null);
  // Counts canon changes, so the writing panel offers new entries in its `@` menu.
  const [canonRevision, setCanonRevision] = useState(0);

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
          onSelect={setMarked}
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
        <button
          type="button"
          disabled={marked.trim() === "" || taking !== null}
          onClick={() => {
            setCanonNote(null);
            setTaking(marked);
          }}
        >
          In den Kanon
        </button>
        {summarizing && (
          <span className="note" role="status">
            Kurzfassung wird erstellt …
          </span>
        )}
        {canonNote !== null && (
          <span className="ok" role="status">
            {canonNote}
          </span>
        )}
      </div>
      {taking !== null && (
        <CanonFact
          story={story}
          marked={taking}
          onStory={onStory}
          onDone={(note) => {
            setTaking(null);
            setCanonNote(note);
            setCanonRevision((value) => value + 1);
          }}
          onCancel={() => {
            setTaking(null);
          }}
        />
      )}
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
        guests={story.guest_links}
        canonRevision={canonRevision}
        storyModel={story.model}
        onModelChange={async (model) => {
          onStory(await api.updateStory(story.world, story.id, { model }));
        }}
        prepare={() => (state === "dirty" ? save() : Promise.resolve(true))}
        onAccept={append}
      />
    </section>
  );
}
