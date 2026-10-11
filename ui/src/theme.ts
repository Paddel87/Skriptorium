/**
 * Light or dark appearance (step 5.19): follow the device, or the author's own choice. "Schwarz"
 * is dark on true black for AMOLED screens (step 6.14).
 */
export type Theme = "automatisch" | "hell" | "dunkel" | "schwarz";

export const THEMES: readonly { id: Theme; label: string }[] = [
  { id: "automatisch", label: "Automatisch" },
  { id: "hell", label: "Hell" },
  { id: "dunkel", label: "Dunkel" },
  { id: "schwarz", label: "Schwarz" },
];

const ROOT_THEME: Record<Exclude<Theme, "automatisch">, string> = {
  hell: "light",
  dunkel: "dark",
  schwarz: "black",
};

// Colour of the browser bar and of the status bar of the installed app; the page's own meta
// tags follow the device, this one goes first and wins while "Schwarz" is chosen.
const BAR_ID = "darstellung-leiste";
const BLACK = "#000000";

const KEY = "skriptorium.darstellung";

/** The stored choice; "automatisch" when none is stored or the browser keeps nothing. */
export function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(KEY);
    return THEMES.some((theme) => theme.id === stored)
      ? (stored as Theme)
      : "automatisch";
  } catch {
    return "automatisch";
  }
}

/** Remember the choice in this browser; without storage it holds until the page is left. */
export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // Storage blocked (e.g. private window): the choice still applies to this page.
  }
}

/** Set the page colours: the stylesheet reads `data-theme` on the root element. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "automatisch") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = ROOT_THEME[theme];
  }
  document.getElementById(BAR_ID)?.remove();
  if (theme === "schwarz") {
    const bar = document.createElement("meta");
    bar.id = BAR_ID;
    bar.name = "theme-color";
    bar.content = BLACK;
    document.head.prepend(bar);
  }
}
