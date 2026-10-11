/** Worlds and their canon entries (`/api/worlds`). */

import { request } from "./core";
import { enc, worldPath } from "./paths";

export type Category =
  "figur" | "ort" | "gegenstand" | "zeitlinie" | "regel" | "kultur";

/** Categories in display order; `plural` names a group of entries (filter, list on the canon page). */
export const CATEGORIES: readonly {
  id: Category;
  label: string;
  plural: string;
}[] = [
  { id: "figur", label: "Figur", plural: "Figuren" },
  { id: "ort", label: "Ort / Geografie", plural: "Orte" },
  { id: "gegenstand", label: "Gegenstand", plural: "Gegenstände" },
  { id: "zeitlinie", label: "Zeitlinie", plural: "Zeitlinie" },
  { id: "regel", label: "Regel", plural: "Regeln" },
  { id: "kultur", label: "Kultur", plural: "Kultur" },
];

export interface World {
  id: string;
  name: string;
  description: string;
}

export interface CanonEntry {
  world: string;
  id: string;
  category: Category;
  name: string;
  aliases: string[];
  status: string | null;
  body: string;
}

export const canonApi = {
  worlds: () => request("GET", "/api/worlds") as Promise<World[]>,
  createWorld: (name: string, description: string) =>
    request("POST", "/api/worlds", { name, description }) as Promise<World>,
  updateWorld: (
    world: string,
    change: Partial<Pick<World, "name" | "description">>,
  ) => request("PATCH", worldPath(world), change) as Promise<World>,

  entries: (world: string) =>
    request("GET", `${worldPath(world)}/entries`) as Promise<CanonEntry[]>,
  entry: (world: string, id: string) =>
    request(
      "GET",
      `${worldPath(world)}/entries/${enc(id)}`,
    ) as Promise<CanonEntry>,
  createEntry: (world: string, entry: Omit<CanonEntry, "world" | "id">) =>
    request(
      "POST",
      `${worldPath(world)}/entries`,
      entry,
    ) as Promise<CanonEntry>,
  updateEntry: (
    world: string,
    id: string,
    change: Partial<Omit<CanonEntry, "world" | "id">>,
  ) =>
    request(
      "PATCH",
      `${worldPath(world)}/entries/${enc(id)}`,
      change,
    ) as Promise<CanonEntry>,
  deleteEntry: (world: string, id: string) =>
    request("DELETE", `${worldPath(world)}/entries/${enc(id)}`),
};
