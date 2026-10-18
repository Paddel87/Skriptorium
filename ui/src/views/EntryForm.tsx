import { useState, type SyntheticEvent } from "react";
import {
  api,
  CATEGORIES,
  describeError,
  type CanonEntry,
  type Category,
} from "../api";
import { templateFor } from "../sections";
import { ErrorText, Field } from "./Common";

const TIMELINE_HINT =
  "Ereignisse in ihrer Reihenfolge untereinander, z. B. als nummerierte Liste.";

/** What stands under the text field: a new entry shows the sections of its category (ADR-092). */
function hintFor(category: Category, creating: boolean): string | undefined {
  if (category === "zeitlinie") {
    return TIMELINE_HINT;
  }
  if (!creating || templateFor(category) === "") {
    return undefined;
  }
  const label = CATEGORIES.find(({ id }) => id === category)?.label ?? category;
  return `Die Abschnitte gehören zur Art „${label}“. Leere Abschnitte dürfen bleiben, eigene Abschnitte kannst du ergänzen.`;
}

/** Form to create a canon entry (`entry` is `null`) or to change or delete one. */
export function EntryForm({
  world,
  entry,
  onClose,
}: {
  world: string;
  entry: CanonEntry | null;
  /** Saved: its identifier; deleted: `null`; cancelled: nothing. */
  onClose: (saved?: string | null) => void;
}) {
  const [category, setCategory] = useState<Category>(
    entry?.category ?? "figur",
  );
  const [name, setName] = useState(entry?.name ?? "");
  const [aliases, setAliases] = useState(entry?.aliases.join(", ") ?? "");
  const [status, setStatus] = useState(entry?.status ?? "");
  // A new entry starts with the empty sections of its category (step 9.3, ADR-092).
  const [body, setBody] = useState(entry?.body ?? templateFor(category));
  const [error, setError] = useState<string | null>(null);
  const hint = hintFor(category, entry === null);

  /** The text follows the category while it is empty or still the template of the old one. */
  function changeCategory(next: Category) {
    if (
      entry === null &&
      (body.trim() === "" || body === templateFor(category))
    ) {
      setBody(templateFor(next));
    }
    setCategory(next);
  }

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    const values = {
      category,
      name,
      aliases: aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias !== ""),
      status: status.trim() === "" ? null : status.trim(),
      body,
    };
    try {
      const saved =
        entry === null
          ? await api.createEntry(world, values)
          : await api.updateEntry(world, entry.id, values);
      onClose(saved.id);
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  async function remove() {
    if (
      entry === null ||
      !window.confirm(`„${entry.name}“ wirklich löschen?`)
    ) {
      return;
    }
    try {
      await api.deleteEntry(world, entry.id);
      onClose(null);
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <form className="entry-form" onSubmit={(event) => void save(event)}>
      <h2>{entry === null ? "Neuer Kanon-Eintrag" : entry.name}</h2>
      <Field label="Kategorie">
        <select
          value={category}
          onChange={(event) => {
            changeCategory(event.target.value as Category);
          }}
        >
          {CATEGORIES.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Name">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          required
        />
      </Field>
      <Field label="Aliasse (durch Komma getrennt)">
        <input
          value={aliases}
          onChange={(event) => {
            setAliases(event.target.value);
          }}
        />
      </Field>
      <Field label="Status (z. B. tot, verschollen)">
        <input
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
          }}
        />
      </Field>
      <Field label="Text">
        <textarea
          rows={12}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
          }}
        />
      </Field>
      {hint !== undefined && <p className="note">{hint}</p>}
      <p className="note">
        Hinweis: Kommentare im Dateikopf der Markdown-Datei gehen beim Speichern
        verloren.
      </p>
      <ErrorText message={error} />
      <div className="row">
        <button type="submit">Speichern</button>
        <button
          type="button"
          onClick={() => {
            onClose();
          }}
        >
          Abbrechen
        </button>
        {entry !== null && (
          <button
            type="button"
            className="danger"
            onClick={() => void remove()}
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
