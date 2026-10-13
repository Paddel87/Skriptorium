import { useEffect, useRef, useState } from "react";
import {
  api,
  describeError,
  type ImportPreview,
  type ImportResult,
} from "../api";
import { ErrorText } from "./Common";
import { ImportReview } from "./ImportReview";

/**
 * The import preview as a window over the world builder (step 8.8): the proposal is previewed
 * right away, the author adjusts and takes it over; the result and "Zurück zum Weltenbauer" end
 * it. The page stays as it is, so the conversation goes on. Escape and "Abbrechen" close it
 * without a change; `onImported` is called when entries were taken over.
 */
export function ImportDialog({
  world,
  markdown,
  onImported,
  onClose,
}: {
  world: string;
  markdown: string;
  onImported: () => void;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let current = true;
    api
      .previewImport(world, markdown)
      .then((loaded) => {
        if (current) {
          setPreview(loaded);
        }
      })
      .catch((reason: unknown) => {
        if (current) {
          setError(describeError(reason));
        }
      });
    return () => {
      current = false;
    };
  }, [world, markdown]);

  // Focus goes into the window, and back to where it was when the window closes.
  useEffect(() => {
    const before = document.activeElement;
    title.current?.focus();
    return () => {
      if (before instanceof HTMLElement) {
        before.focus();
      }
    };
  }, []);

  return (
    <div
      className="overlay image-viewer-veil"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="import-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
      >
        <h3 id="import-dialog-title" ref={title} tabIndex={-1}>
          Als Kanon übernehmen
        </h3>
        <ErrorText message={error} />
        {preview === null && error === null && (
          <p className="note" role="status">
            Vorschau wird erstellt …
          </p>
        )}
        {preview !== null && result === null && (
          <ImportReview
            world={world}
            markdown={markdown}
            preview={preview}
            onApplied={(applied) => {
              setResult(applied);
              onImported();
            }}
          />
        )}
        {result !== null && (
          <p className="ok">
            Übernommen: {result.created.length} neu, {result.overwritten.length}{" "}
            überschrieben, {result.skipped.length} übersprungen.
          </p>
        )}
        <div className="row">
          <button
            type="button"
            className={result === null ? "ghost" : "primary"}
            onClick={onClose}
          >
            {result === null ? "Abbrechen" : "Zurück zum Weltenbauer"}
          </button>
        </div>
      </div>
    </div>
  );
}
