import { useEffect, useState, type SyntheticEvent } from "react";
import {
  api,
  CATEGORIES,
  describeError,
  type Category,
  type ImportPreview,
  type ImportResult,
  type TranslatedMaterial,
} from "../api";
import { base64 } from "../files";
import { ErrorText, Field } from "./Common";

/** Files from SillyTavern: character cards (PNG, JSON) and lorebooks (JSON), step 6.8. */
const SILLYTAVERN = /\.(png|json)$/i;

/**
 * Import Markdown world material: preview, adjust categories and conflicts, take over. A file
 * from SillyTavern is translated into Markdown by the server first (step 6.8, ADR-065). With
 * `initialText` (a proposal of the world builder, step 6.7) the field is filled and the preview
 * is requested right away.
 */
export function Import({
  world,
  onImported,
  initialText = "",
}: {
  world: string;
  onImported: () => void;
  initialText?: string;
}) {
  const [markdown, setMarkdown] = useState(initialText);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [overwrite, setOverwrite] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // What the translation of a SillyTavern file left out, with the file's name.
  const [translated, setTranslated] = useState<{
    file: string;
    notes: string[];
  } | null>(null);

  // A proposal handed over by the world builder is previewed right away, once.
  useEffect(() => {
    if (initialText.trim() === "") {
      return;
    }
    let current = true;
    api
      .previewImport(world, initialText)
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
  }, [world, initialText]);

  async function loadPreview(text: string) {
    setError(null);
    setResult(null);
    try {
      setPreview(await api.previewImport(world, text));
      setCategories({});
      setOverwrite([]);
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  async function apply() {
    setError(null);
    try {
      setResult(await api.applyImport(world, markdown, categories, overwrite));
      setPreview(null);
      onImported();
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
        <div>
          <h3>Vorschau: {preview.items.length} Einträge</h3>
          {preview.introduction !== "" && (
            <p className="note">
              Die Einleitung wird an die Weltbeschreibung angehängt.
            </p>
          )}
          <table>
            <thead>
              <tr>
                <th>Eintrag</th>
                <th>Kategorie</th>
                <th>Hinweis</th>
              </tr>
            </thead>
            <tbody>
              {preview.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    <select
                      aria-label={`Kategorie für ${item.name}`}
                      value={categories[item.id] ?? item.category ?? ""}
                      onChange={(event) => {
                        setCategories({
                          ...categories,
                          [item.id]: event.target.value as Category,
                        });
                      }}
                    >
                      <option value="" disabled>
                        – wählen –
                      </option>
                      {CATEGORIES.map(({ id, label }) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {item.conflict !== null && (
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={overwrite.includes(item.id)}
                          onChange={(event) => {
                            setOverwrite(
                              event.target.checked
                                ? [...overwrite, item.id]
                                : overwrite.filter((id) => id !== item.id),
                            );
                          }}
                        />
                        {item.conflict === "vorhanden"
                          ? "existiert schon"
                          : "doppelt"}{" "}
                        – überschreiben
                      </label>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => void apply()}>
            Übernehmen
          </button>
        </div>
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
