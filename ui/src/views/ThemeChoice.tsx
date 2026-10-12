import { useState } from "react";
import { applyTheme, readTheme, saveTheme, THEMES, type Theme } from "../theme";
import { Icon } from "./Icons";

/**
 * Choice of appearance in the bar on the left (steps 5.19, 5.11, 6.14): each click moves on from
 * automatic to light to dark to black; the current choice stands under the symbol.
 */
export function ThemeChoice() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const index = THEMES.findIndex(({ id }) => id === theme);
  const label = THEMES[index]?.label ?? "";
  return (
    <button
      type="button"
      className="rail-button"
      aria-label={`Darstellung: ${label}`}
      title="Darstellung wechseln"
      onClick={() => {
        const next = THEMES[(index + 1) % THEMES.length]?.id ?? "automatisch";
        setTheme(next);
        saveTheme(next);
        applyTheme(next);
      }}
    >
      <span aria-hidden="true" className="symbol">
        <Icon name="theme" />
      </span>
      <span className="rail-label">
        {label === "Automatisch" ? "Auto" : label}
      </span>
    </button>
  );
}
