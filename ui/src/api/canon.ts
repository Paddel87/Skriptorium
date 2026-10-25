/** Worlds and their canon entries (`/api/worlds`). */

import { request } from "./core";
import type { ImageOrigin, StoredImageOrigin } from "./images";
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

/**
 * A point on a map that leads to a canon entry (step 7.14, ADR-079); `x` and `y` are shares
 * of the map's width and height (0 to 1, from the top left).
 */
export interface MapMarker {
  entry: string;
  x: number;
  y: number;
}

/** A map of a world (step 7.10): the author's name for it, its file and its markers. */
export interface WorldMap {
  name: string;
  file: string;
  markers: MapMarker[];
}

export interface World {
  id: string;
  name: string;
  description: string;
  maps: WorldMap[];
}

export interface CanonEntry {
  world: string;
  id: string;
  category: Category;
  name: string;
  aliases: string[];
  status: string | null;
  body: string;
  /** File names of the entry's images; the first is the main image (step 7.6). */
  images: string[];
}

/** Fields of an entry the author writes in the form; images change through their own calls. */
export type EntryFields = Omit<CanonEntry, "world" | "id" | "images">;

const entryPath = (world: string, id: string) =>
  `${worldPath(world)}/entries/${enc(id)}`;

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
  createEntry: (world: string, entry: EntryFields) =>
    request(
      "POST",
      `${worldPath(world)}/entries`,
      entry,
    ) as Promise<CanonEntry>,
  updateEntry: (world: string, id: string, change: Partial<EntryFields>) =>
    request(
      "PATCH",
      `${worldPath(world)}/entries/${enc(id)}`,
      change,
    ) as Promise<CanonEntry>,
  deleteEntry: (world: string, id: string) =>
    request("DELETE", `${worldPath(world)}/entries/${enc(id)}`),

  /** Address of one map of a world, for `<img src>` (step 7.10, ADR-073). */
  mapPath: (world: string, file: string) =>
    `${worldPath(world)}/maps/${enc(file)}`,
  /** `herkunft` only for a generated map taken over (step 9.6, ADR-095). */
  addMap: (
    world: string,
    name: string,
    content: string,
    herkunft: ImageOrigin | null = null,
  ) =>
    request("POST", `${worldPath(world)}/maps`, {
      name,
      content,
      ...(herkunft === null ? {} : { herkunft }),
    }) as Promise<World>,
  mapOrigin: (world: string, file: string) =>
    request(
      "GET",
      `${worldPath(world)}/maps/${enc(file)}/origin`,
    ) as Promise<StoredImageOrigin | null>,
  renameMap: (world: string, file: string, name: string) =>
    request("PATCH", `${worldPath(world)}/maps/${enc(file)}`, {
      name,
    }) as Promise<World>,
  /** Replaces all markers of a map (step 7.14). */
  setMarkers: (world: string, file: string, markers: MapMarker[]) =>
    request("PUT", `${worldPath(world)}/maps/${enc(file)}/markers`, {
      markers,
    }) as Promise<World>,
  removeMap: (world: string, file: string) =>
    request(
      "DELETE",
      `${worldPath(world)}/maps/${enc(file)}`,
    ) as Promise<World>,

  /** Address of one image of an entry, for `<img src>` (step 7.6, ADR-072). */
  imagePath: (world: string, id: string, image: string) =>
    `${entryPath(world, id)}/images/${enc(image)}`,
  /**
   * Adds an image, sent as base64 in JSON like every other body; `herkunft` only for a
   * generated image taken over (step 9.6, ADR-095).
   */
  addImage: (
    world: string,
    id: string,
    content: string,
    herkunft: ImageOrigin | null = null,
  ) =>
    request("POST", `${entryPath(world, id)}/images`, {
      content,
      ...(herkunft === null ? {} : { herkunft }),
    }) as Promise<CanonEntry>,
  imageOrigin: (world: string, id: string, image: string) =>
    request(
      "GET",
      `${entryPath(world, id)}/images/${enc(image)}/origin`,
    ) as Promise<StoredImageOrigin | null>,
  removeImage: (world: string, id: string, image: string) =>
    request(
      "DELETE",
      `${entryPath(world, id)}/images/${enc(image)}`,
    ) as Promise<CanonEntry>,
  setMainImage: (world: string, id: string, image: string) =>
    request(
      "POST",
      `${entryPath(world, id)}/images/${enc(image)}/main`,
    ) as Promise<CanonEntry>,
};
