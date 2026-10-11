/** Import and export of a world: Markdown import and SillyTavern files. */

import { request } from "./core";
import { worldPath, enc } from "./paths";
import type { Category } from "./canon";

export interface ImportItem {
  id: string;
  name: string;
  category: Category | null;
  aliases: string[];
  body: string;
  conflict: string | null;
}

/** Import Markdown translated from a SillyTavern file (step 6.8, ADR-065). */
export interface TranslatedMaterial {
  markdown: string;
  not_taken_over: string[];
}

export interface ImportPreview {
  world: string;
  introduction: string;
  items: ImportItem[];
  not_taken_over: string[];
}

export interface ImportResult {
  created: string[];
  overwritten: string[];
  skipped: string[];
}

export const transferApi = {
  /** Download address of the world as a SillyTavern lorebook (step 6.9). */
  lorebookPath: (world: string) => `${worldPath(world)}/export/sillytavern`,
  /** Download address of a figure as a SillyTavern character card (step 6.9). */
  cardPath: (world: string, entry: string) =>
    `${worldPath(world)}/entries/${enc(entry)}/export/sillytavern`,
  translateSillyTavern: (world: string, content: string) =>
    request("POST", `${worldPath(world)}/import/sillytavern`, {
      content,
    }) as Promise<TranslatedMaterial>,
  previewImport: (world: string, markdown: string) =>
    request("POST", `${worldPath(world)}/import/preview`, {
      markdown,
    }) as Promise<ImportPreview>,
  applyImport: (
    world: string,
    markdown: string,
    categories: Record<string, Category>,
    overwrite: string[],
  ) =>
    request("POST", `${worldPath(world)}/import`, {
      markdown,
      categories,
      overwrite,
    }) as Promise<ImportResult>,
};
