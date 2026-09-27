import { useCallback, useState } from "react";
import { api, describeError, type Story, type StoryFact } from "../api";
import { loadStoryEntries } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";

/**
 * Fakten dieser Geschichte (FR-024, step 3.8): facts about canon entries that hold only in this
 * story; the AI gets them with the entries the story names. A fact can be removed again.
 */
export function Facts({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const load = useCallback(
    () => loadStoryEntries(story.world, story.guest_links),
    [story.world, story.guest_links],
  );
  const entries = useLoad(load);
  const [error, setError] = useState<string | null>(null);
  const facts = story.facts;
  const name = (id: string) =>
    (entries.data ?? []).find((entry) => entry.id === id)?.name ?? id;

  async function remove(fact: StoryFact) {
    setError(null);
    try {
      onSaved(await api.removeFact(story.world, story.id, fact));
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details>
      <summary>Fakten dieser Geschichte ({facts.length})</summary>
      <div className="stack">
        <p className="note">
          Diese Fakten gelten nur hier, nicht im Kanon. Du legst sie an, indem
          du im Manuskript eine Stelle markierst und „In den Kanon“ wählst.
        </p>
        {facts.length > 0 && (
          <ul aria-label="Fakten">
            {facts.map((fact, index) => (
              <li key={`${fact.entry}:${fact.fact}`} className="row">
                <span>
                  {name(fact.entry)}: {fact.fact}
                </span>
                <button
                  type="button"
                  aria-label={`Fakt ${String(index + 1)} entfernen`}
                  onClick={() => void remove(fact)}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}
        <ErrorText message={entries.error ?? error} />
      </div>
    </details>
  );
}
