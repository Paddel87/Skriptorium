import { lazy, Suspense, useState, type ReactNode } from "react";
import { api, type CanonEntry, type Chapter, type Story } from "../api";
import { CanonFact } from "./CanonFact";
import { ChapterBar } from "./ChapterBar";
import { ChapterLength } from "./ChapterLength";
import { ChapterSummary } from "./ChapterSummary";
import { ChapterTabs, type ChapterView } from "./ChapterTabs";
import { ErrorText } from "./Common";
import { InstructionHistory } from "./InstructionHistory";
import { useCanonTake } from "./useCanonTake";
import { useChapterCompletion } from "./useChapterCompletion";
import { useChapterDraft } from "./useChapterDraft";
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
  const draft = useChapterDraft(chapter, onSaved);
  const { text, state, save } = draft;
  const { factForm, ...canon } = useCanonTake(onCanonChanged);
  const [view, setView] = useState<ChapterView>("manuskript");
  const [noted, setNoted] = useState(0);
  // The tab "Kurzfassung" exists once the chapter is completed or has one (steps 3.6, 6.2).
  const hasSummary =
    chapter.status === "abgeschlossen" || chapter.summary !== "";
  // Counts the moments the end of the text should come into view (steps 5.9, 5.11).
  const [ends, setEnds] = useState(0);
  const { summarizing, summaryNote, summarize, complete } =
    useChapterCompletion({
      chapter,
      dirty: state === "dirty",
      save,
      setError: draft.setError,
      onStory,
      onSaved,
      // The new short summary is to be checked (step 6.2).
      onSummarized: () => {
        setView("kurzfassung");
      },
    });

  return (
    <section
      className="chapter"
      aria-label={`Kapitel ${String(chapter.number)}`}
    >
      <ChapterBar
        storyTitle={story.title}
        title={draft.title}
        onTitle={draft.editTitle}
        saved={state === "saved"}
        canSave={state === "dirty"}
        onSave={() => void save()}
        lead={lead}
        tools={tools}
      />
      <WritingPanel
        world={chapter.world}
        story={chapter.story}
        chapter={chapter.number}
        chapterEmpty={text.trim() === ""}
        guests={story.guest_links}
        canonRevision={canon.canonRevision + canonVersion}
        storyModel={story.model}
        onModelChange={async (model) => {
          onStory(await api.updateStory(story.world, story.id, { model }));
        }}
        prepare={() => (state === "dirty" ? save() : Promise.resolve(true))}
        onAccept={draft.append}
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
              disabled={canon.marked.trim() === "" || canon.taking !== null}
              title="Markierte Stelle in den Kanon oder nur in diese Geschichte"
              onClick={canon.start}
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
        <ChapterTabs
          chapter={chapter}
          view={view}
          hasSummary={hasSummary}
          onView={setView}
        />
        {view === "kurzfassung" && hasSummary && (
          <section className="card chapter-summary">
            <h3>Kurzfassung von Kapitel {chapter.number}</h3>
            <p className="note">
              Die KI liest beim Weiterschreiben diese Kurzfassung statt des
              vollen Kapitels. Sie ist keine Anweisung.
            </p>
            <ChapterSummary
              key={`${chapter.summary_status}:${chapter.summary}`}
              chapter={chapter}
              busy={summarizing}
              onSummarize={() => void summarize()}
              onSaved={onSaved}
            />
          </section>
        )}
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
              onChange={draft.editText}
              onSelect={canon.setMarked}
              onEnd={() => {
                setEnds((value) => value + 1);
              }}
            />
            <ChapterLength
              world={chapter.world}
              story={chapter.story}
              chapter={chapter.number}
              text={text}
              summary={story.summary}
            />
          </div>
        </Suspense>
        <ErrorText message={draft.error} />
        {summarizing && (
          <p className="note" role="status">
            Kurzfassung wird erstellt …
          </p>
        )}
        {canon.canonNote !== null && (
          <p className="ok" role="status">
            {canon.canonNote}
          </p>
        )}
        {canon.taking !== null && (
          <div ref={factForm}>
            <CanonFact
              story={story}
              marked={canon.taking}
              onStory={onStory}
              onDone={canon.done}
              onCancel={canon.cancel}
            />
          </div>
        )}
        {summaryNote !== null && (
          <p className="error" role="alert">
            {summaryNote}
          </p>
        )}
      </WritingPanel>
    </section>
  );
}
