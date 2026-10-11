/** Asking the AI for a proposal: orders, events and their German error texts. */

import { streamEvents, WRITE_EVENTS } from "./stream";
import { storyPath } from "./paths";

/** Length of a proposal, chosen per request (step 5.15). */
export type WriteLength = "kurz" | "mittel" | "lang";

/** What the author asks the AI for (step 3.3); an empty instruction means "continue". */
export interface WriteOrder {
  instruction: string;
  references?: string[];
  scene?: { place: string | null; characters: string[]; goal: string } | null;
  model: string;
  /** Missing: the server's default "mittel". */
  length?: WriteLength;
}

/** Why a proposal ended without `done`; "verbindung" means the stream broke off. */
export type WriteErrorKind =
  | "abgelehnt"
  | "zu_viele_anfragen"
  | "ungueltig"
  | "nicht_erreichbar"
  | "verbindung";

/** Events of the proposal stream (Server-Sent Events of the write endpoint). */
export type WriteEvent =
  | { type: "start"; model: string; estimated_tokens: number }
  | { type: "text"; text: string }
  /** The AI's note that it changed an instruction contradicting the canon (step 4.14). */
  | { type: "hinweis"; text: string }
  | {
      type: "done";
      input_tokens: number | null;
      output_tokens: number | null;
      cost_usd: number | null;
      finish_reason: string | null;
    }
  | { type: "error"; kind: WriteErrorKind };

/** User-facing text for a failed proposal, in German. */
export function describeWriteError(kind: WriteErrorKind): string {
  const texts: Record<WriteErrorKind, string> = {
    abgelehnt: "Das Modell hat die Anfrage abgelehnt.",
    zu_viele_anfragen:
      "Der Anbieter meldet zu viele Anfragen. Bitte kurz warten oder ein anderes Modell wählen.",
    ungueltig: "Der Anbieter hat die Anfrage als ungültig abgelehnt.",
    nicht_erreichbar: "Der KI-Anbieter ist gerade nicht erreichbar.",
    verbindung: "Die Verbindung ist abgebrochen.",
  };
  return texts[kind];
}

/**
 * Ask for a proposal at the end of a chapter and pass each event to `onEvent` as it arrives.
 * Refusals before streaming (unknown entry, context too large, no provider) throw an ApiError;
 * aborting through `signal` rejects with the abort reason. A stream that ends without `done` or
 * `error` reports the error kind "verbindung". Nothing is saved on the server.
 */
export function streamWrite(
  path: string,
  order: WriteOrder,
  onEvent: (event: WriteEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamEvents(
    path,
    order,
    WRITE_EVENTS,
    { type: "error", kind: "verbindung" },
    onEvent,
    signal,
  );
}

export const writingApi = {
  writePath: (world: string, story: string, number: number) =>
    `${storyPath(world, story)}/chapters/${String(number)}/write`,
};
