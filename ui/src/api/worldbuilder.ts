/** The conversation with the world builder (step 6.7). */

import { WRITE_EVENTS, streamEvents } from "./stream";
import type { Source } from "./stream";
import type { WriteEvent } from "./writing";
import { worldPath } from "./paths";
import { request } from "./core";

/** One turn of the conversation with the world builder (step 6.7). */
export interface WorldbuilderMessage {
  role: "user" | "assistant";
  content: string;
}

/** The name to look for in the manuscript; `story` missing: all stories of the world (ADR-087). */
export interface ManuscriptSearch {
  name: string;
  story: string | null;
}

/** Numbers of the passages found, no text (step 8.9); `tokens` is their share in a request. */
export interface ManuscriptHits {
  total: number;
  stories: number;
  chapters: number;
  included: number;
  tokens: number;
}

/** What the author sends to the world builder; `references` are entries named with `@`. */
export interface WorldbuilderOrder {
  messages: WorldbuilderMessage[];
  references: string[];
  /** Missing model: the server's preset. */
  model: string | null;
  web_search: boolean;
  /** Passages of the manuscript that go along with this request (step 8.9). */
  manuscript?: ManuscriptSearch;
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
  manuscriptHits: (world: string, search: ManuscriptSearch) =>
    request(
      "POST",
      `${worldPath(world)}/worldbuilder/hits`,
      search,
    ) as Promise<ManuscriptHits>,
};
