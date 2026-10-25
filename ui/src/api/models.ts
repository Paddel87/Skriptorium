/** Models, favorites and usage (`/api/models`, `/api/usage`). */

import { request } from "./core";

/** Requests, tokens and cost of one month (step 3.9, ADR-023). */
export interface MonthUsage {
  month: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  /** Requests without a cost reported by the provider (aborted, failed). */
  without_cost: number;
}

/** A cost in US dollars as shown to the author, e.g. "0,0021 $". */
export function formatCost(cost: number): string {
  return `${cost.toLocaleString("de-DE", { maximumFractionDigits: 4 })} $`;
}

/** One model of OpenRouter's catalog (step 5.12, ADR-055); prices in US dollars. */
export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  /** Per million tokens; `null` if OpenRouter names no price. */
  input_price: number | null;
  output_price: number | null;
  /** One proposal: 30,000 tokens in, 500 out. */
  estimated_cost: number | null;
  context_length: number | null;
  /** Inputs pass OpenRouter's own moderation. */
  moderated: boolean;
  /** "lange": long reasoning measured; "vor": always reasons first. */
  thinking: "lange" | "vor" | null;
  /** Checked with the owner's stories. */
  checked: boolean;
  /** Accepts images, for "Von der KI beschreiben lassen" (step 7.13). */
  reads_images: boolean;
}

/** The tasks that start with a model of their own (step 9.7, ADR-096). */
export type ModelTask =
  | "schreiben"
  | "weltenbau"
  | "kurzfassung"
  | "gesamtzusammenfassung"
  | "bildbeschreibung"
  | "aussehen"
  | "bilderzeugung";

/** The saved model per task; `null` means the preset of the program. */
export type TaskModels = Record<ModelTask, string | null>;

/** Favorites, the preset model, the model per task and the catalog (ADR-055, ADR-096). */
export interface ModelList {
  /** Same as `favorites`. */
  models: string[];
  default: string;
  favorites: string[];
  tasks: TaskModels;
  /** Empty while OpenRouter's list cannot be loaded. */
  catalog: CatalogModel[];
  catalog_available: boolean;
}

export const modelsApi = {
  models: () => request("GET", "/api/models") as Promise<ModelList>,
  setFavorites: (favorites: string[]) =>
    request("PUT", "/api/models/favoriten", {
      favorites,
    }) as Promise<ModelList>,
  setTaskModels: (tasks: TaskModels) =>
    request("PUT", "/api/models/aufgaben", { tasks }) as Promise<ModelList>,
  usage: () => request("GET", "/api/usage") as Promise<MonthUsage>,
};
