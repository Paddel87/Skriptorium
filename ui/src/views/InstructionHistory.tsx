import { useCallback } from "react";
import { api } from "../api";
import { useLoad } from "../useLoad";
import { ErrorText } from "./Common";

const TIME = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * The instructions of a chapter whose proposals were taken over, oldest first (step 5.13,
 * FR-027, ADR-056). Only to look up: the list is never part of the manuscript and never goes
 * to the AI. `round` changes when a new instruction was noted.
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
        Anweisungen, deren Vorschlag du übernommen hast – nur zum Nachschlagen,
        sie gehen nicht an die KI.
      </p>
      <ErrorText message={error} />
      {data?.length === 0 && (
        <p>Noch keine übernommenen Anweisungen in diesem Kapitel.</p>
      )}
      {data !== undefined && data.length > 0 && (
        <ol className="history-list">
          {data.map((note, index) => (
            <li key={index}>
              <time dateTime={note.at}>{TIME.format(new Date(note.at))}</time>
              <p>{note.instruction}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
