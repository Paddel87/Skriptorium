import { useCallback, useState, type SyntheticEvent } from "react";
import {
  api,
  CATEGORIES,
  describeError,
  type CanonEntry,
  type Category,
  type GuestLink,
} from "../api";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";
import { EntryText } from "./EntryText";

/** Marks a new entry in the editing state; entry identifiers never contain a space. */
const NEW = " new";

const HINTS: Partial<Record<Category, string>> = {
  zeitlinie:
    "Ereignisse in ihrer Reihenfolge untereinander, z. B. als nummerierte Liste.",
  gegenstand:
    "Abschnitte Zweck, Verwendung und Auswirkung werden bei leerem Text angelegt.",
};

/**
 * Canon entries of a world (step 5.11 part 3): search over name and aliases, categories as
 * filter, the list on the left, the chosen entry on the right to read and change. The chosen
 * entry has its own address (`selected`, `onSelect`); on narrow screens the entry takes the whole
 * width, with a way back to the list.
 *
 * The same view serves the bar on the right of a story (finding of 2026-10-10 on step 5.11):
 * `compact` always shows list or entry, `guests` adds the story's guests from other worlds,
 * which can be read here but are changed in their own world.
 */
export function Canon({
  world,
  selected = null,
  onSelect = () => undefined,
  guests,
  compact = false,
  onChanged,
}: {
  world: string;
  /** Identifier of the entry shown on the right, or none. */
  selected?: string | null;
  onSelect?: (entry: string | null) => void;
  /** Guests of a story; given, they are listed and marked as guests. */
  guests?: readonly GuestLink[];
  /** List or entry, never both side by side (the narrow bar of a story). */
  compact?: boolean;
  /** Called after an entry was created, changed or deleted. */
  onChanged?: () => void;
}) {
  const load = useCallback(
    () =>
      guests === undefined
        ? api.entries(world)
        : loadStoryEntries(world, guests),
    [world, guests],
  );
  const { data, error, reload } = useLoad(load);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category | null>(null);
  // The entry being changed, or `NEW` for a new one.
  const [editing, setEditing] = useState<string | null>(null);

  const entries = data ?? [];
  const needle = query.trim().toLocaleLowerCase("de");
  const shown = entries.filter(
    (entry) =>
      (filter === null || entry.category === filter) &&
      (needle === "" ||
        [entry.name, ...entry.aliases].some((name) =>
          name.toLocaleLowerCase("de").includes(needle),
        )),
  );
  const current = entries.find((entry) => entry.id === selected);
  const formFor =
    editing === NEW ? null : editing === selected ? current : undefined;
  const detail = editing === NEW || selected !== null;
  const guest = (entry: CanonEntry) => entry.world !== world;

  function choose(entry: string | null) {
    setEditing(null);
    onSelect(entry);
  }

  return (
    <section className={compact ? "card canon-panel" : "card"}>
      <div className="row">
        <h2>Kanon</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(NEW);
          }}
        >
          Neuer Eintrag
        </button>
      </div>
      <ErrorText message={error} />
      {data?.length === 0 && editing !== NEW ? (
        <p>Noch keine Kanon-Einträge.</p>
      ) : (
        <div
          className={[
            "canon",
            compact ? "compact" : "",
            detail ? "has-detail" : "",
          ]
            .filter((name) => name !== "")
            .join(" ")}
        >
          <div className="canon-list">
            <input
              type="search"
              aria-label="Kanon durchsuchen"
              placeholder="Suchen: Name oder Alias"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            <div
              className="chips"
              role="group"
              aria-label="Nach Kategorie filtern"
            >
              <button
                type="button"
                className="chip"
                aria-pressed={filter === null}
                onClick={() => {
                  setFilter(null);
                }}
              >
                Alle {entries.length}
              </button>
              {CATEGORIES.map(({ id, plural }) => {
                const count = entries.filter((e) => e.category === id).length;
                return count === 0 ? null : (
                  <button
                    key={id}
                    type="button"
                    className="chip"
                    aria-pressed={filter === id}
                    onClick={() => {
                      setFilter(filter === id ? null : id);
                    }}
                  >
                    {plural} {count}
                  </button>
                );
              })}
            </div>
            <p className="note">
              {shown.length === 0 && data !== undefined
                ? "Kein Eintrag passt."
                : `${String(shown.length)} von ${String(entries.length)} Einträgen`}
            </p>
            {CATEGORIES.map(({ id, plural }) => {
              const group = shown.filter((entry) => entry.category === id);
              if (group.length === 0) {
                return null;
              }
              return (
                <div key={id}>
                  <h3 className="canon-group">{plural}</h3>
                  <ul className="canon-items">
                    {group.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="canon-item"
                          aria-current={
                            entry.id === selected ? "true" : undefined
                          }
                          onClick={() => {
                            choose(entry.id);
                          }}
                        >
                          {entry.name}
                          {entry.aliases.length > 0 && (
                            <small>
                              {" "}
                              · {entry.aliases.slice(0, 2).join(", ")}
                            </small>
                          )}
                          {entry.status !== null && (
                            <small> ({entry.status})</small>
                          )}
                          {guest(entry) && <small> · Gast</small>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="canon-detail">
            {detail && (
              <button
                type="button"
                className="link canon-back"
                onClick={() => {
                  choose(null);
                }}
              >
                ← Liste
              </button>
            )}
            {formFor !== undefined ? (
              <EntryForm
                key={formFor?.id ?? "new"}
                world={world}
                entry={formFor}
                onClose={(saved) => {
                  setEditing(null);
                  reload();
                  if (saved !== undefined) {
                    onChanged?.();
                    onSelect(saved);
                  }
                }}
              />
            ) : current !== undefined ? (
              <article>
                <div className="row">
                  <h2>{current.name}</h2>
                  {!guest(current) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(current.id);
                      }}
                    >
                      Bearbeiten
                    </button>
                  )}
                </div>
                {guest(current) && (
                  <p className="note">
                    Gast aus einer anderen Welt – nur in deren Kanon zu ändern.
                  </p>
                )}
                <p className="note">
                  {CATEGORIES.find((c) => c.id === current.category)?.label}
                  {current.aliases.length > 0 &&
                    ` · Auch: ${current.aliases.join(", ")}`}
                  {current.status !== null && ` · ${current.status}`}
                </p>
                <EntryText text={current.body} name={current.name} />
              </article>
            ) : selected !== null && data !== undefined ? (
              <p>Eintrag nicht gefunden.</p>
            ) : (
              <p className="note">Einen Eintrag links wählen.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function EntryForm({
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
  const [body, setBody] = useState(entry?.body ?? "");
  const [error, setError] = useState<string | null>(null);

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
            setCategory(event.target.value as Category);
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
          rows={10}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
          }}
        />
      </Field>
      {HINTS[category] !== undefined && (
        <p className="note">{HINTS[category]}</p>
      )}
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
