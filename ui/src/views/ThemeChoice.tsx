import { useState } from "react";
import { applyTheme, readTheme, saveTheme, THEMES, type Theme } from "../theme";

/** Choice of appearance in the header (step 5.19): automatic, light or dark. */
export function ThemeChoice() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  return (
    <label className="check theme-choice">
      Darstellung
      <select
        value={theme}
        onChange={(event) => {
          const next = event.target.value as Theme;
          setTheme(next);
          saveTheme(next);
          applyTheme(next);
        }}
      >
        {THEMES.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
