import { useCallback, useState, type SyntheticEvent } from "react";
import {
  api,
  CATEGORIES,
  describeError,
  type CanonEntry,
  type Category,
  type Story,
} from "../api";
import { appendParagraph, oneLine, suggestFact } from "../canonFact";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";

const CATEGORY_KEY = "skriptorium.letzte-kategorie";
let lastCategory: Category = readCategory();

/** The category chosen last for a new entry; "figur" at first (owner, step 3.8). */
function readCategory(): Category {
  try {
    const stored = window.localStorage.getItem(CATEGORY_KEY);
    return CATEGORIES.find((c) => c.id === stored)?.id ?? "figur";
  } catch {
    return "figur";
  }
}

function rememberCategory(category: Category): void {
  lastCategory = category;
  try {
    window.localStorage.setItem(CATEGORY_KEY, category);
  } catch {
    // Browser storage is a convenience only; the choice is kept for this page load.
  }
}

/**
 * Fakt aus dem Text in den Kanon (step 3.8, FR-015, FR-024): take a marked passage of the
 * manuscript as a new canon entry of the story's world or as a supplement to an entry the story
 * uses. A supplement goes into the canon (a paragraph at the end of the entry – for a guest in
 * its home world, so wherever it appears) or holds only in this story. Entry and category are
 * suggested from the passage, so saving takes two clicks.
 */
export function CanonFact({
  story,
  marked,
  onStory,
  onDone,
  onCancel,
}: {
  story: Story;
  marked: string;
  /** The story after a story fact was added. */
  onStory: (story: Story) => void;
  /** Called with a confirmation once the passage is saved. */
  onDone: (note: string) => void;
  onCancel: () => void;
}) {
  const load = useCallback(
    () => loadStoryEntries(story.world, story.guest_links),
    [story.world, story.guest_links],
  );
  const entries = useLoad(load);
  if (entries.data === undefined) {
    return (
      <section className="card" aria-label="In den Kanon">
        {entries.error === null ? (
          <p>Kanon lädt …</p>
        ) : (
          <>
            <ErrorText message={entries.error} />
            <button type="button" onClick={onCancel}>
              Abbrechen
            </button>
          </>
        )}
      </section>
    );
  }
  return (
    <FactForm
      story={story}
      marked={marked}
      entries={entries.data}
      onStory={onStory}
      onDone={onDone}
      onCancel={onCancel}
    />
  );
}

function FactForm({
  story,
  marked,
  entries,
  onStory,
  onDone,
  onCancel,
}: {
  story: Story;
  marked: string;
  entries: readonly CanonEntry[];
  onStory: (story: Story) => void;
  onDone: (note: string) => void;
  onCancel: () => void;
}) {
  const [suggestion] = useState(() => suggestFact(marked, entries));
  const [kind, setKind] = useState<"ergaenzen" | "neu">(
    suggestion.entry === null ? "neu" : "ergaenzen",
  );
  const [entryId, setEntryId] = useState(
    suggestion.entry?.id ?? entries[0]?.id ?? "",
  );
  const entry = entries.find((candidate) => candidate.id === entryId);
  const guest = entry !== undefined && entry.world !== story.world;
  // A guest's canon belongs to another world; changing it is chosen, not preset.
  const [scope, setScope] = useState<"kanon" | "geschichte" | null>(null);
  const target = scope ?? (guest ? "geschichte" : "kanon");
  const [name, setName] = useState(suggestion.name);
  const [category, setCategory] = useState<Category>(lastCategory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const body = kind === "neu" && suggestion.name === "" ? marked.trim() : "";

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onDone(await store());
    } catch (reason: unknown) {
      setError(describeError(reason));
      setBusy(false);
    }
  }

  async function store(): Promise<string> {
    if (kind === "neu") {
      const created = await api.createEntry(story.world, {
        category,
        name: name.trim(),
        aliases: [],
        status: null,
        body,
      });
      rememberCategory(category);
      return `Neuer Kanon-Eintrag „${created.name}“ angelegt.`;
    }
    if (entry === undefined) {
      throw new Error("no entry chosen");
    }
    if (target === "geschichte") {
      onStory(
        await api.addFact(story.world, story.id, {
          entry: entry.id,
          fact: oneLine(marked),
        }),
      );
      return `Fakt zu „${entry.name}“ gilt nur in dieser Geschichte.`;
    }
    // Read the entry again right before writing, so a change made elsewhere is kept.
    const current = await api.entry(entry.world, entry.id);
    await api.updateEntry(entry.world, entry.id, {
      body: appendParagraph(current.body, marked),
    });
    return `Kanon-Eintrag „${entry.name}“ ergänzt.`;
  }

  const ready = kind === "neu" ? name.trim() !== "" : entry !== undefined;

  return (
    <section className="card" aria-label="In den Kanon">
      <form className="stack" onSubmit={(event) => void save(event)}>
        <h3>In den Kanon</h3>
        <blockquote className="marked">{marked.trim()}</blockquote>
        <div className="row" role="radiogroup" aria-label="Art">
          <label className="check">
            <input
              type="radio"
              name="art"
              checked={kind === "ergaenzen"}
              disabled={entries.length === 0}
              onChange={() => {
                setKind("ergaenzen");
              }}
            />
            Bestehenden Eintrag ergänzen
          </label>
          <label className="check">
            <input
              type="radio"
              name="art"
              checked={kind === "neu"}
              onChange={() => {
                setKind("neu");
              }}
            />
            Neuer Eintrag
          </label>
        </div>
        {kind === "ergaenzen" ? (
          <>
            <Field label="Eintrag">
              <select
                value={entryId}
                onChange={(event) => {
                  setEntryId(event.target.value);
                  setScope(null);
                }}
              >
                {entries.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.world === story.world
                      ? candidate.name
                      : `${candidate.name} (Gast)`}
                  </option>
                ))}
              </select>
            </Field>
            <div className="stack" role="radiogroup" aria-label="Gilt für">
              <label className="check">
                <input
                  type="radio"
                  name="ziel"
                  checked={target === "kanon"}
                  onChange={() => {
                    setScope("kanon");
                  }}
                />
                {guest
                  ? "Kanon der Figur – gilt überall, wo sie auftritt"
                  : "Kanon der Welt – gilt in allen Geschichten dieser Welt"}
              </label>
              <label className="check">
                <input
                  type="radio"
                  name="ziel"
                  checked={target === "geschichte"}
                  onChange={() => {
                    setScope("geschichte");
                  }}
                />
                Nur diese Geschichte
              </label>
            </div>
          </>
        ) : (
          <div className="row">
            <Field label="Name des Eintrags">
              <input
                value={name}
                required
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
            </Field>
            <Field label="Kategorie">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as Category);
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <ErrorText message={error} />
        <div className="row">
          <button type="submit" disabled={busy || !ready}>
            Eintragen
          </button>
          <button type="button" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </form>
    </section>
  );
}
