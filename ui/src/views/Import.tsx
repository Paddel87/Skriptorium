import { useState, type SyntheticEvent } from "react";
import {
  api,
  describeError,
  type ImportPreview,
  type ImportResult,
  type TranslatedMaterial,
} from "../api";
import { base64 } from "../files";
import { ErrorText, Field } from "./Common";
import { ImportReview } from "./ImportReview";

/** Files from SillyTavern: character cards (PNG, JSON) and lorebooks (JSON), step 6.8. */
const SILLYTAVERN = /\.(png|json)$/i;

/**
 * Import Markdown world material: preview, adjust categories and conflicts, take over. A file
 * from SillyTavern is translated into Markdown by the server first (step 6.8, ADR-065).
 */
export function Import({
  world,
  onImported,
}: {
  world: string;
  onImported: () => void;
}) {
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  // Counts the previews, so that each starts with fresh choices.
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // What the translation of a SillyTavern file left out, with the file's name.
  const [translated, setTranslated] = useState<{
    file: string;
    notes: string[];
  } | null>(null);

  async function loadPreview(text: string) {
    setError(null);
    setResult(null);
    try {
      setPreview(await api.previewImport(world, text));
      setRound((count) => count + 1);
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  async function readFile(file: File | undefined) {
    if (file === undefined) {
      return;
    }
    setTranslated(null);
    if (!SILLYTAVERN.test(file.name)) {
      setMarkdown(await file.text());
      return;
    }
    setError(null);
    let material: TranslatedMaterial;
    try {
      material = await api.translateSillyTavern(world, await base64(file));
    } catch (reason: unknown) {
      setError(describeError(reason));
      return;
    }
    setMarkdown(material.markdown);
    setTranslated({ file: file.name, notes: material.not_taken_over });
    await loadPreview(material.markdown);
  }

  return (
    <section className="card">
      <h2>Welt-Material importieren</h2>
      <form
        onSubmit={(event: SyntheticEvent) => {
          event.preventDefault();
          void loadPreview(markdown);
        }}
      >
        <Field label="Datei">
          <input
            type="file"
            accept=".md,.markdown,.txt,.json,.png,text/markdown,text/plain,application/json,image/png"
            onChange={(event) => void readFile(event.target.files?.[0])}
          />
        </Field>
        <p className="note">
          Markdown (.md, .txt) oder aus SillyTavern: Figurenkarte (.png, .json)
          oder Lorebook (.json)
        </p>
        <Field label="oder Text einfügen">
          <textarea
            rows={8}
            value={markdown}
            onChange={(event) => {
              setMarkdown(event.target.value);
            }}
          />
        </Field>
        {translated !== null && (
          <div className="import-note" role="status">
            <strong>Aus „{translated.file}“ übersetzt.</strong>
            {translated.notes.length > 0 && (
              <ul>
                {translated.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button type="submit" disabled={markdown.trim() === ""}>
          Vorschau
        </button>
      </form>
      <ErrorText message={error} />
      {preview !== null && (
        <ImportReview
          key={round}
          world={world}
          markdown={markdown}
          preview={preview}
          onApplied={(applied) => {
            setResult(applied);
            setPreview(null);
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
    </section>
  );
}
