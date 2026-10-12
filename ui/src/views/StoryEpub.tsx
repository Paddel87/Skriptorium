import { useId, useState, type SyntheticEvent } from "react";
import { api, describeError, type Story } from "../api";
import { ErrorText } from "./Common";

/**
 * The story as an e-book (step 7.4, ADR-071): EPUB with title page, table of contents and
 * the chapters, all of them or only the completed ones. The author goes into the file only.
 */
export function StoryEpub({ story }: { story: Story }) {
  const heading = useId();
  const [author, setAuthor] = useState("");
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(event: SyntheticEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const book = await api.exportEpub(story.world, story.id, {
        author: author.trim() === "" ? null : author.trim(),
        only_completed: onlyCompleted,
      });
      const address = URL.createObjectURL(book);
      const link = document.createElement("a");
      link.href = address;
      link.download = `${story.id}.epub`;
      link.click();
      URL.revokeObjectURL(address);
    } catch (reason: unknown) {
      setError(describeError(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="style-section" aria-labelledby={heading}>
      <h3 id={heading}>Als E-Book ausgeben</h3>
      <p className="note">
        EPUB mit Titelseite, Inhaltsverzeichnis und allen Kapiteln.
      </p>
      <form className="stack" onSubmit={(event) => void download(event)}>
        <label className="field">
          <span>Autor (optional)</span>
          <input
            value={author}
            maxLength={200}
            placeholder="Name auf der Titelseite"
            onChange={(event) => {
              setAuthor(event.target.value);
            }}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={onlyCompleted}
            onChange={(event) => {
              setOnlyCompleted(event.target.checked);
            }}
          />
          nur abgeschlossene Kapitel
        </label>
        <div className="row">
          <button type="submit" disabled={busy}>
            ⇩ EPUB herunterladen
          </button>
        </div>
        <ErrorText message={error} />
      </form>
    </section>
  );
}
