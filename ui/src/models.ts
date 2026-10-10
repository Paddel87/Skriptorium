/** Display of catalog models (step 5.12, ADR-055). */
import type { CatalogModel } from "./api";

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
