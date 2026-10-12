/** Letting the AI describe an image or a map once (step 7.13, ADR-074). */

import { WRITE_EVENTS, streamEvents } from "./stream";
import type { WriteEvent } from "./writing";
import { enc, worldPath } from "./paths";

/** Events of a description: start, text pieces, then done or error. */
export type DescribeEvent = Extract<
  WriteEvent,
  { type: "start" | "text" | "done" | "error" }
>;

/**
 * Ask a model that reads images to describe the image behind `path`; each event goes to
 * `onEvent`. Errors and aborting behave as in `streamWrite`. Nothing is saved.
 */
export function streamDescription(
  path: string,
  model: string,
  onEvent: (event: DescribeEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamEvents(
    path,
    { model },
    WRITE_EVENTS,
    { type: "error", kind: "verbindung" },
    onEvent,
    signal,
  );
}

export const describeApi = {
  describeImagePath: (world: string, entry: string, image: string) =>
    `${worldPath(world)}/entries/${enc(entry)}/images/${enc(image)}/describe`,
  describeMapPath: (world: string, file: string) =>
    `${worldPath(world)}/maps/${enc(file)}/describe`,
  /** Stream of "Aussehen herauslösen" (step 7.16); takes `{model}` like a description. */
  appearancePath: (world: string, entry: string) =>
    `${worldPath(world)}/entries/${enc(entry)}/appearance`,
};
