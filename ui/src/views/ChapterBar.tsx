import type { ReactNode } from "react";

/** Top line of a chapter: story, chapter title and saving (step 5.11). */
export function ChapterBar({
  storyTitle,
  title,
  onTitle,
  saved,
  canSave,
  onSave,
  lead,
  tools,
}: {
  storyTitle: string;
  title: string;
  onTitle: (title: string) => void;
  /** Show the note that the chapter was saved. */
  saved: boolean;
  canSave: boolean;
  onSave: () => void;
  /** At the start of the line (the menu button on small screens). */
  lead?: ReactNode;
  /** At the end of the line (the button for the bar on the right). */
  tools?: ReactNode;
}) {
  return (
    <header className="chapter-bar">
      {lead}
      <span className="crumb">{storyTitle} ›</span>
      <input
        className="chapter-title"
        aria-label="Kapiteltitel"
        value={title}
        onChange={(event) => {
          onTitle(event.target.value);
        }}
      />
      <span className="spacer" />
      {saved && <span className="ok">Gespeichert.</span>}
      <button type="button" onClick={onSave} disabled={!canSave}>
        Speichern
      </button>
      {tools}
    </header>
  );
}
