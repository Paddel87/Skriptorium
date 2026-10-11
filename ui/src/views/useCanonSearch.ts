import { useState } from "react";
import type { CanonEntry, Category } from "../api";

/** Search over name and aliases plus the category filter of the canon list (step 5.11). */
export function useCanonSearch(entries: readonly CanonEntry[]) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category | null>(null);
  const needle = query.trim().toLocaleLowerCase("de");
  const shown = entries.filter(
    (entry) =>
      (filter === null || entry.category === filter) &&
      (needle === "" ||
        [entry.name, ...entry.aliases].some((name) =>
          name.toLocaleLowerCase("de").includes(needle),
        )),
  );
  return { query, setQuery, filter, setFilter, shown };
}
