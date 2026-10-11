/** The conversation with the world builder (step 6.7). */

import { WRITE_EVENTS, streamEvents } from "./stream";
import type { Source } from "./stream";
import type { WriteEvent } from "./writing";
import { worldPath } from "./paths";

/** One turn of the conversation with the world builder (step 6.7). */
export interface WorldbuilderMessage {
  role: "user" | "assistant";
  content: string;
}

/** What the author sends to the world builder; `references` are entries named with `@`. */
export interface WorldbuilderOrder {
  messages: WorldbuilderMessage[];
  references: string[];
  /** Missing model: the server's preset. */
  model: string | null;
  web_search: boolean;
}

/** Events of the world builder stream; like the proposal stream plus the sources found. */
export type WorldbuilderEvent =
  | {
      type: "start";
      model: string;
      estimated_tokens: number;
      web_search: boolean;
    }
  | { type: "text"; text: string }
  | { type: "quellen"; sources: Source[] }
  | Extract<WriteEvent, { type: "done" | "error" }>;

/**
 * Talk to the world builder (step 6.7, ADR-064): sends the conversation and passes each event of
 * the answer to `onEvent`. Errors and aborting behave as in `streamWrite`. Nothing is saved.
 */
export function streamWorldbuilder(
  path: string,
  order: WorldbuilderOrder,
  onEvent: (event: WorldbuilderEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamEvents(
    path,
    order,
    [...WRITE_EVENTS, "quellen"],
    { type: "error", kind: "verbindung" },
    onEvent,
    signal,
  );
}

export const worldbuilderApi = {
  worldbuilderPath: (world: string) => `${worldPath(world)}/worldbuilder`,
};
