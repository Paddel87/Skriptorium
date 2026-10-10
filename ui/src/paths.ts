import { createContext, useContext } from "react";

/**
 * Addresses of the views (step 5.11, ADR-046). They live behind `#`, so the server serves the
 * interface at `/` only and every view survives reload, the back button and bookmarks.
 */

/** Areas of a world; each has its own address. */
export type WorldArea = "geschichten" | "kanon" | "import" | "beschreibung";

export function worldPath(world: string, area: WorldArea = "geschichten") {
  return `/welt/${encodeURIComponent(world)}/${area}`;
}

/** One canon entry of a world, shown on the canon page (step 5.11 part 3). */
export function canonEntryPath(world: string, entry: string) {
  return `${worldPath(world, "kanon")}/${encodeURIComponent(entry)}`;
}

export function storyPath(world: string, story: string) {
  return `/welt/${encodeURIComponent(world)}/geschichte/${encodeURIComponent(story)}`;
}

export function chapterPath(world: string, story: string, chapter: number) {
  return `${storyPath(world, story)}/kapitel/${String(chapter)}`;
}

/**
 * Lets a view tell the list on the left that worlds, stories or chapters changed (new, renamed),
 * so it loads them again. `revision` counts the changes.
 */
export interface Navigation {
  revision: number;
  refresh: () => void;
}

export const NavigationContext = createContext<Navigation>({
  revision: 0,
  refresh: () => undefined,
});

export function useNavigation(): Navigation {
  return useContext(NavigationContext);
}
