import { useState } from "react";
import {
  api,
  CATEGORIES,
  describeError,
  type Category,
  type ImportPreview,
  type ImportResult,
} from "../api";
import { ErrorText } from "./Common";

/**
 * The preview of an import (step 6.1, ADR-064): adjust categories, choose which existing entries
 * are overwritten, take over. Shared by the import page and the window of the world builder
 * (step 8.8). A new `preview` needs a new `key`, so the choices start afresh.
 */
export function ImportReview({
  world,
  markdown,
  preview,
  onApplied,
}: {
  world: string;
  markdown: string;
  preview: ImportPreview;
  onApplied: (result: ImportResult) => void;
}) {
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [overwrite, setOverwrite] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    setError(null);
    try {
      onApplied(await api.applyImport(world, markdown, categories, overwrite));
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
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
      <ErrorText message={error} />
      <button type="button" onClick={() => void apply()}>
        Übernehmen
      </button>
    </div>
  );
}
