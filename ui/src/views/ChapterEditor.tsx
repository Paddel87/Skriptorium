import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  describeError,
  describeSummaryFailure,
  type CanonEntry,
  type Chapter,
  type Story,
} from "../api";
import { CanonFact } from "./CanonFact";
import { ChapterSummary } from "./ChapterSummary";
import { ErrorText } from "./Common";
import { InstructionHistory } from "./InstructionHistory";
import { WritingPanel } from "./WritingPanel";

// The editor with its Markdown grammar is large; it is loaded when a chapter is opened.
const ManuscriptEditor = lazy(() =>
  import("./ManuscriptEditor").then((module) => ({
    default: module.ManuscriptEditor,
  })),
);

/**
 * One chapter (step 5.11): a top line with the story, the chapter title and saving; below it the
 * text in the editor, which scrolls like a chat with the AI's proposal at its end, and the
 * instruction at the bottom with completing the chapter and taking a marked passage into the
 * canon.
 */
export function ChapterEditor({
  chapter,
  story,
  onSaved,
  onStory,
  mode,
  onCanonChanged,
  lead,
  tools,
  canonVersion = 0,
  onLookUp,
}: {
  chapter: Chapter;
  /** The story; its guests are offered in the writing panel and in "In den Kanon". */
  story: Story;
  onSaved: () => void;
  /** The story after its overall summary changed. */
  onStory: (story: Story) => void;
  /** Short line of the Figuren-Schreibweise, right above the instruction (step 5.11). */
  mode?: ReactNode;
  /** Called after a passage went into the canon, so canon views load again. */
  onCanonChanged?: () => void;
  /** At the start of the top line (the menu button on small screens). */
  lead?: ReactNode;
  /** At the end of the top line (the button for the bar on the right). */
  tools?: ReactNode;
  /** Counts canon changes made elsewhere on the page, so the `@` menu loads again. */
  canonVersion?: number;
  /** Show an entry named under "Herangezogen" in the bar on the right (step 5.16). */
  onLookUp?: (entry: CanonEntry) => void;
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
  // Manuscript or the history of instructions over the text (step 5.13).
  const [view, setView] = useState<"manuskript" | "verlauf">("manuskript");
  const [noted, setNoted] = useState(0);
  const [canonNote, setCanonNote] = useState<string | null>(null);
  // Counts canon changes, so the writing panel offers new entries in its `@` menu.
  const [canonRevision, setCanonRevision] = useState(0);
  // Counts the moments the end of the text should come into view (steps 5.9, 5.11).
  const [ends, setEnds] = useState(0);
  const factForm = useRef<HTMLDivElement>(null);

  // The form for "In den Kanon" opens below the text; bring its top into view, so it can grow
  // downwards while it loads the entries (step 5.2).
  useEffect(() => {
    if (taking !== null) {
      factForm.current?.scrollIntoView({ block: "start" });
    }
  }, [taking]);

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
    <section
      className="chapter"
      aria-label={`Kapitel ${String(chapter.number)}`}
    >
      <header className="chapter-bar">
        {lead}
        <span className="crumb">{story.title} ›</span>
        <input
          className="chapter-title"
          aria-label="Kapiteltitel"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setState("dirty");
          }}
        />
        <span className="spacer" />
        {state === "saved" && <span className="ok">Gespeichert.</span>}
        <button
          type="button"
          onClick={() => void save()}
          disabled={state !== "dirty"}
        >
          Speichern
        </button>
        {tools}
      </header>
      <WritingPanel
        world={chapter.world}
        story={chapter.story}
        chapter={chapter.number}
        chapterEmpty={text.trim() === ""}
        guests={story.guest_links}
        canonRevision={canonRevision + canonVersion}
        storyModel={story.model}
        onModelChange={async (model) => {
          onStory(await api.updateStory(story.world, story.id, { model }));
        }}
        prepare={() => (state === "dirty" ? save() : Promise.resolve(true))}
        onAccept={append}
        endSignal={ends}
        mode={mode}
        onLookUp={onLookUp}
        onNoted={() => {
          setNoted((value) => value + 1);
        }}
        tools={
          <>
            <button
              type="button"
              disabled={marked.trim() === "" || taking !== null}
              title="Markierte Stelle in den Kanon oder nur in diese Geschichte"
              onClick={() => {
                setCanonNote(null);
                setTaking(marked);
              }}
            >
              In den Kanon
            </button>
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
          </>
        }
      >
        <nav className="tabs view-tabs" aria-label="Ansicht des Kapitels">
          <button
            type="button"
            aria-current={view === "manuskript"}
            onClick={() => {
              setView("manuskript");
            }}
          >
            Manuskript
          </button>
          <button
            type="button"
            aria-current={view === "verlauf"}
            onClick={() => {
              setView("verlauf");
            }}
          >
            Verlauf
          </button>
        </nav>
        {view === "verlauf" && (
          <InstructionHistory
            world={chapter.world}
            story={chapter.story}
            chapter={chapter.number}
            round={noted}
          />
        )}
        <Suspense fallback={<p>Editor lädt …</p>}>
          <div hidden={view !== "manuskript"}>
            <ManuscriptEditor
              label="Manuskript"
              value={text}
              onChange={(value) => {
                setText(value);
                setState("dirty");
              }}
              onSelect={setMarked}
              onEnd={() => {
                setEnds((value) => value + 1);
              }}
            />
          </div>
        </Suspense>
        <ErrorText message={error} />
        {summarizing && (
          <p className="note" role="status">
            Kurzfassung wird erstellt …
          </p>
        )}
        {canonNote !== null && (
          <p className="ok" role="status">
            {canonNote}
          </p>
        )}
        {taking !== null && (
          <div ref={factForm}>
            <CanonFact
              story={story}
              marked={taking}
              onStory={onStory}
              onDone={(note) => {
                setTaking(null);
                setCanonNote(note);
                setCanonRevision((value) => value + 1);
                onCanonChanged?.();
              }}
              onCancel={() => {
                setTaking(null);
              }}
            />
          </div>
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
      </WritingPanel>
    </section>
  );
}
