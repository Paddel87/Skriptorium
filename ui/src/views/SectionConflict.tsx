import { useEffect, useRef } from "react";
import type { SectionAsk } from "./useSectionChoice";

/** How much of the old text the question shows. */
const SHOWN = 300;

/**
 * The question when a taken-over text meets a section that already has text (step 8.4,
 * ADR-083): the old text is shown, the author replaces it, adds below it or cancels. Escape
 * cancels; it does not reach the dialog underneath.
 */
export function SectionConflict({ asking }: { asking: SectionAsk | null }) {
  const cancel = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (asking !== null) {
      cancel.current?.focus();
    }
  }, [asking]);

  if (asking === null) {
    return null;
  }
  const old =
    asking.current.length > SHOWN
      ? `${asking.current.slice(0, SHOWN).trimEnd()} …`
      : asking.current;

  return (
    <div
      className="overlay image-viewer-veil"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          asking.answer(null);
        }
      }}
    >
      <div
        className="section-conflict"
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-conflict-title"
      >
        <h3 id="section-conflict-title">„{asking.heading}“ hat schon Text</h3>
        <p className="note">Bisher steht dort:</p>
        <blockquote className="section-conflict-text">{old}</blockquote>
        <div className="row">
          <button
            type="button"
            className="primary"
            onClick={() => {
              asking.answer("replace");
            }}
          >
            Ersetzen
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              asking.answer("append");
            }}
          >
            Darunter ergänzen
          </button>
          <button
            ref={cancel}
            type="button"
            className="ghost"
            onClick={() => {
              asking.answer(null);
            }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
