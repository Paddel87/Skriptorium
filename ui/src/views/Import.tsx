import { useState, type SyntheticEvent } from "react";
import {
  api,
  CATEGORIES,
  describeError,
  type Category,
  type ImportPreview,
  type ImportResult,
} from "../api";
import { ErrorText, Field } from "./Common";

/** Import Markdown world material: preview, adjust categories and conflicts, take over. */
export function Import({
  world,
  onImported,
}: {
  world: string;
  onImported: () => void;
}) {
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [overwrite, setOverwrite] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function showPreview(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    try {
      setPreview(await api.previewImport(world, markdown));
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
    if (file !== undefined) {
      setMarkdown(await file.text());
    }
  }

  return (
    <section className="card">
      <h2>Welt-Material importieren</h2>
      <form onSubmit={(event) => void showPreview(event)}>
        <Field label="Markdown-Datei">
          <input
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            onChange={(event) => void readFile(event.target.files?.[0])}
          />
        </Field>
        <Field label="oder Text einfügen">
          <textarea
            rows={8}
            value={markdown}
            onChange={(event) => {
              setMarkdown(event.target.value);
            }}
          />
        </Field>
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
