/** Display of catalog models and the model per task (steps 5.12, 9.7, ADR-055, ADR-096). */
import type { CatalogModel, ModelList, ModelTask } from "./api";

/**
 * The saved model of `task`, or `null` for the preset: also `null` when the loaded catalog no
 * longer offers it – the server then uses the preset as well (ADR-096).
 */
export function taskModel(list: ModelList, task: ModelTask): string | null {
  const saved = list.tasks[task];
  if (
    saved === null ||
    (list.catalog_available && !list.catalog.some((m) => m.id === saved))
  ) {
    return null;
  }
  return saved;
}

/** Name without the provider prefix, e.g. "SpaceXAI: Grok 4.6" → "Grok 4.6". */
export function shortName(model: CatalogModel | undefined, id: string): string {
  if (model === undefined) {
    return id;
  }
  const colon = model.name.indexOf(": ");
  return colon >= 0 ? model.name.slice(colon + 2) : model.name;
}

/** Estimated cost of one proposal in cents, e.g. "6,3 ct"; `null` if unknown. */
export function formatCents(dollars: number | null): string | null {
  if (dollars === null) {
    return null;
  }
  return `${(dollars * 100).toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} ct`;
}

/** Context size, e.g. "500 Tsd." or "1 Mio."; "?" if unknown. */
export function formatContext(tokens: number | null): string {
  if (tokens === null) {
    return "?";
  }
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Mio.`;
  }
  return `${String(Math.round(tokens / 1000))} Tsd.`;
}

/** Price per million tokens, e.g. "2,00 $"; "?" if unknown. */
export function formatPrice(dollars: number | null): string {
  if (dollars === null) {
    return "?";
  }
  return `${dollars.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

/** Option text in the selection field: star for favorites, short name, cost per proposal. */
export function optionLabel(
  model: CatalogModel | undefined,
  id: string,
  favorite: boolean,
): string {
  const cost = formatCents(model?.estimated_cost ?? null);
  return `${favorite ? "★ " : ""}${shortName(model, id)}${cost === null ? "" : ` · ${cost}`}`;
}

/**
 * Extra tokens and fee of one world-builder answer with web search (step 6.7): the pages found
 * are billed as input. Measured 2026-10-11 with grok-4.6: 17,100–22,400 tokens more input and
 * about 0.01 $ for the search itself (three answers, logbook); the upper value, so the label does
 * not promise too little.
 */
const WEB_SEARCH_TOKENS = 22_000;
const WEB_SEARCH_FEE = 0.01;

/** Estimated extra cost of web search for `model` in dollars; `null` if its price is unknown. */
export function webSearchSurcharge(
  model: CatalogModel | undefined,
): number | null {
  if (model?.input_price == null) {
    return null;
  }
  return (WEB_SEARCH_TOKENS * model.input_price) / 1_000_000 + WEB_SEARCH_FEE;
}
