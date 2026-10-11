import { useState } from "react";
import { api, describeError, type Chapter } from "../api";

/**
 * Title and text of a chapter being written, whether they are saved, and saving them. Taken-over
 * AI text goes to the end of the chapter and is saved at once (FR-009). `error` is shared with
 * the other actions of the editor, which report through `setError`.
 */
export function useChapterDraft(chapter: Chapter, onSaved: () => void) {
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

  function editTitle(value: string) {
    setTitle(value);
    setState("dirty");
  }

  function editText(value: string) {
    setText(value);
    setState("dirty");
  }

  return {
    title,
    text,
    state,
    error,
    setError,
    save,
    append,
    editTitle,
    editText,
  };
}
