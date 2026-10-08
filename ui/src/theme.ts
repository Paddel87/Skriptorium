/** Light or dark appearance (step 5.19): follow the device, or the author's own choice. */
export type Theme = "automatisch" | "hell" | "dunkel";

export const THEMES: readonly { id: Theme; label: string }[] = [
  { id: "automatisch", label: "Automatisch" },
  { id: "hell", label: "Hell" },
  { id: "dunkel", label: "Dunkel" },
];

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
    root.dataset.theme = theme === "dunkel" ? "dark" : "light";
  }
}
