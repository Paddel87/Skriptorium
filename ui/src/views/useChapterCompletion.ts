import { useState } from "react";
import {
  api,
  describeError,
  describeSummaryFailure,
  type Chapter,
  type Story,
} from "../api";

/**
 * Completing a chapter and creating its summary (steps 3.6, 6.2). Errors go to the editor's
 * error line through `setError`; `onSummarized` runs once the summary is there.
 */
export function useChapterCompletion({
  chapter,
  dirty,
  save,
  setError,
  onStory,
  onSaved,
  onSummarized,
}: {
  chapter: Chapter;
  /** The text has changes that are not saved yet. */
  dirty: boolean;
  save: () => Promise<boolean>;
  setError: (message: string | null) => void;
  onStory: (story: Story) => void;
  onSaved: () => void;
  onSummarized: () => void;
}) {
  const [summarizing, setSummarizing] = useState(false);
  const [summaryNote, setSummaryNote] = useState<string | null>(null);

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
    if (dirty && !(await save())) {
      return;
    }
    try {
      await api.completeChapter(chapter.world, chapter.story, chapter.number);
    } catch (reason: unknown) {
      setError(describeError(reason));
      return;
    }
    await summarize();
    onSummarized();
  }

  return { summarizing, summaryNote, summarize, complete };
}
