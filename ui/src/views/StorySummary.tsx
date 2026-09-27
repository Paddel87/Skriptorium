import { useState, type SyntheticEvent } from "react";
import { api, describeError, type Story } from "../api";
import { ErrorText, Field } from "./Common";

/**
 * Gesamtzusammenfassung (FR-010): continued by the AI whenever a chapter summary is created;
 * the author can read and change it.
 */
export function StorySummary({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const [summary, setSummary] = useState(story.summary);
  const [error, setError] = useState<string | null>(null);

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      onSaved(await api.setStorySummary(story.world, story.id, summary));
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <details>
      <summary>Gesamtzusammenfassung</summary>
      <form className="stack" onSubmit={(event) => void save(event)}>
        {story.summary === "" && (
          <p className="note">
            Entsteht, sobald das erste Kapitel abgeschlossen ist.
          </p>
        )}
        <Field label="Gesamtzusammenfassung">
          <textarea
            rows={8}
            value={summary}
            onChange={(event) => {
              setSummary(event.target.value);
            }}
          />
        </Field>
        <ErrorText message={error} />
        <div className="row">
          <button type="submit" disabled={summary === story.summary}>
            Gesamtzusammenfassung speichern
          </button>
        </div>
      </form>
    </details>
  );
}
