import { useState, type SyntheticEvent } from "react";
import { api, describeError, type Chapter, type SummaryStatus } from "../api";
import { ErrorText, Field } from "./Common";

const SUMMARY_STATUS_TEXT: Record<SummaryStatus, string> = {
  fehlt: "fehlt – die KI nutzt den Kapitelanfang",
  erzeugt: "von der KI erstellt, noch nicht geprüft",
  geprüft: "geprüft",
};

/**
 * Kurzfassung of a chapter (FR-010): shown once the chapter is completed or has one; saving
 * marks it as checked; a missing or unwanted one can be created again.
 */
export function ChapterSummary({
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
