import type { WriteLength } from "../api";
import { describeWriteError } from "../api";
import { ErrorText } from "./Common";
import { describeUsage, type WriteFlow } from "./useWriteFlow";

/**
 * The answer of the AI at the end of the text (step 5.11): the proposal while it arrives, then
 * the buttons to take it over, change it, discard it or write it anew with the model and length
 * chosen now. Nothing while no proposal is there.
 */
export function ProposalBlock({
  flow,
  chosenModel,
  length,
}: {
  flow: WriteFlow;
  chosenModel: string;
  length: WriteLength;
}) {
  const {
    phase,
    proposal,
    aborted,
    failure,
    error,
    lastOrder,
    usage,
    editing,
  } = flow;
  if (phase !== "writing" && phase !== "review") {
    return null;
  }
  return (
    <article className="proposal" aria-label="Vorschlag">
      <p className="who">
        Vorschlag der KI · {lastOrder?.model ?? chosenModel} über OpenRouter ·{" "}
        {lastOrder?.length ?? length}
      </p>
      <textarea
        aria-label="Vorschlag der KI"
        className={editing ? "proposal-text editing" : "proposal-text"}
        rows={rowsFor(proposal)}
        value={proposal}
        readOnly={phase !== "review" || !editing}
        onChange={(event) => {
          flow.setProposal(event.target.value);
        }}
      />
      {phase === "review" && (
        <>
          {aborted && <p className="note">Abgebrochen.</p>}
          {failure !== null && (
            <p className="error" role="alert">
              {describeWriteError(failure)}
              {failure === "abgelehnt" &&
                " Wähle unten ein anderes Modell und schreibe neu."}
            </p>
          )}
          <ErrorText message={error} />
          <div className="row">
            {proposal.trim() !== "" && (
              <button
                type="button"
                className="primary"
                onClick={() => void flow.accept()}
              >
                Übernehmen
              </button>
            )}
            {proposal.trim() !== "" && !editing && (
              <button
                type="button"
                onClick={() => {
                  flow.setEditing(true);
                }}
              >
                Ändern
              </button>
            )}
            <button type="button" onClick={flow.discard}>
              Verwerfen
            </button>
            {lastOrder !== null && (
              <button
                type="button"
                onClick={() =>
                  void flow.send({ ...lastOrder, model: chosenModel, length })
                }
              >
                Neu schreiben mit {chosenModel}
              </button>
            )}
            {usage !== null && (
              <span className="note cost">{describeUsage(usage)}</span>
            )}
          </div>
        </>
      )}
    </article>
  );
}

/** Rough height of the proposal, where the browser cannot size the field to its text. */
function rowsFor(text: string): number {
  const lines = text
    .split("\n")
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 75)), 0);
  return Math.max(2, lines);
}
