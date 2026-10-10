import { useCallback } from "react";
import { api } from "../api";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";

const TIME = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * The taken-over exchanges of a chapter, oldest first, laid out like a chat (step 5.13,
 * FR-027, ADR-056): the author's instruction on the right, the AI's text as it went into the
 * manuscript on the left. Only to look up: never part of the manuscript, never sent to the AI.
 * `round` changes when a new exchange was noted.
 */
export function InstructionHistory({
  world,
  story,
  chapter,
  round = 0,
}: {
  world: string;
  story: string;
  chapter: number;
  round?: number;
}) {
  const load = useCallback(
    () => api.instructions(world, story, chapter),
    [world, story, chapter],
  );
  const { data, error } = useLoad(load, round);

  return (
    <section className="history" aria-label="Verlauf der Anweisungen">
      <p className="note">
        Was du angewiesen und übernommen hast – nur zum Nachschlagen, geht nicht
        an die KI.
      </p>
      <ErrorText message={error} />
      {data?.length === 0 && (
        <p>Noch keine übernommenen Vorschläge in diesem Kapitel.</p>
      )}
      {data !== undefined && data.length > 0 && (
        <ol className="history-list">
          {data.map((note, index) => (
            <li key={index}>
              <div className="history-in" aria-label="Deine Anweisung">
                <time dateTime={note.at}>{TIME.format(new Date(note.at))}</time>
                <p>{note.instruction}</p>
              </div>
              <div className="history-out" aria-label="Text der KI">
                <p className="who">
                  KI{note.model !== null && ` · ${shortModel(note.model)}`}
                </p>
                <p>{note.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Model identifier without the provider, e.g. "x-ai/grok-4.6" → "grok-4.6". */
function shortModel(model: string): string {
  return model.slice(model.lastIndexOf("/") + 1);
}
