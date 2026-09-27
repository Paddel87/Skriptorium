import { useCallback, useState, type SyntheticEvent } from "react";
import { api, describeError, type GuestLink, type Story } from "../api";
import { loadGuest } from "../storyEntries";
import { useLoad } from "../useLoad";
import { ErrorText, Field } from "./Common";

/**
 * Gäste aus anderen Welten (FR-017, step 3.7): entries of other worlds bound into this story
 * only. The AI knows a guest when it is named with `@`, led by the author or put into a new
 * scene; otherwise only if the budget has room after the world's own entries.
 */
export function Guests({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const loadWorlds = useCallback(() => api.worlds(), []);
  const worlds = useLoad(loadWorlds);
  const links = story.guest_links;
  const loadLinked = useCallback(
    () => Promise.all(links.map(loadGuest)),
    [links],
  );
  const linked = useLoad(loadLinked);
  const [from, setFrom] = useState("");
  const loadOffered = useCallback(
    () => (from === "" ? Promise.resolve([]) : api.entries(from)),
    [from],
  );
  const offered = useLoad(loadOffered);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState<string | null>(null);

  const otherWorlds = (worlds.data ?? []).filter((w) => w.id !== story.world);
  const worldName = (id: string) =>
    (worlds.data ?? []).find((w) => w.id === id)?.name ?? id;
  const choices = (offered.data ?? []).filter(
    (candidate) =>
      !links.some((l) => l.world === from && l.entry === candidate.id),
  );

  async function add(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      onSaved(
        await api.addGuest(story.world, story.id, { world: from, entry }),
      );
      setEntry("");
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  async function remove(link: GuestLink, name: string) {
    setError(null);
    if (story.controlled_characters.includes(link.entry)) {
      setError(
        `${name} führst du selbst – erst in der Figuren-Schreibweise abwählen.`,
      );
      return;
    }
    try {
      onSaved(await api.removeGuest(story.world, story.id, link));
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details>
      <summary>Gäste aus anderen Welten ({links.length})</summary>
      <div className="stack">
        <p className="note">
          Ein Gast gilt nur in dieser Geschichte. Die KI kennt ihn, wenn du ihn
          mit @ nennst, selbst führst oder in eine neue Szene setzt – sonst nur,
          wenn nach dem Kanon dieser Welt noch Platz ist. Die Regeln seiner
          Heimatwelt gelten hier nicht.
        </p>
        {links.length > 0 && (
          <ul aria-label="Gäste">
            {links.map((link, index) => {
              const found = linked.data?.[index];
              const name = found?.name ?? link.entry;
              return (
                <li key={`${link.world}/${link.entry}`} className="row">
                  <span>
                    {name} aus {worldName(link.world)}
                    {found === null && " – Eintrag fehlt in seiner Welt"}
                  </span>
                  <button type="button" onClick={() => void remove(link, name)}>
                    {name} entfernen
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form className="row" onSubmit={(event) => void add(event)}>
          <Field label="Welt des Gastes">
            <select
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setEntry("");
              }}
            >
              <option value="">– Welt wählen –</option>
              {otherWorlds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gast-Eintrag">
            <select
              value={entry}
              disabled={from === ""}
              onChange={(event) => {
                setEntry(event.target.value);
              }}
            >
              <option value="">– Eintrag wählen –</option>
              {choices.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </Field>
          <button type="submit" disabled={entry === ""}>
            Als Gast einbinden
          </button>
        </form>
        <ErrorText
          message={worlds.error ?? linked.error ?? offered.error ?? error}
        />
      </div>
    </details>
  );
}
