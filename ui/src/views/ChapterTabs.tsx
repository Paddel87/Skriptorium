import type { Chapter } from "../api";

/** Manuscript, the history of instructions over the text (step 5.13) or the short summary. */
export type ChapterView = "manuskript" | "verlauf" | "kurzfassung";

/** The tabs over a chapter; "Kurzfassung" exists once the chapter has one (steps 3.6, 6.2). */
export function ChapterTabs({
  chapter,
  view,
  hasSummary,
  onView,
}: {
  chapter: Chapter;
  view: ChapterView;
  hasSummary: boolean;
  onView: (view: ChapterView) => void;
}) {
  return (
    <nav className="tabs view-tabs" aria-label="Ansicht des Kapitels">
      <button
        type="button"
        aria-current={view === "manuskript"}
        onClick={() => {
          onView("manuskript");
        }}
      >
        Manuskript
      </button>
      <button
        type="button"
        aria-current={view === "verlauf"}
        onClick={() => {
          onView("verlauf");
        }}
      >
        Verlauf
      </button>
      {hasSummary && (
        <button
          type="button"
          aria-current={view === "kurzfassung"}
          onClick={() => {
            onView("kurzfassung");
          }}
        >
          Kurzfassung
          {chapter.summary_status !== "geprüft" && (
            <span className="unchecked" title="noch nicht geprüft">
              <span className="sr-only"> – noch nicht geprüft</span>
            </span>
          )}
        </button>
      )}
    </nav>
  );
}
