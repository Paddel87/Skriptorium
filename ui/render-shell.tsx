/** Render the frame of the logged-in views at an address, for component tests (step 5.11). */
import { render } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { vi } from "vitest";
import { Shell } from "./src/views/Shell";

/** Shows the current address, so tests can check where a click led. */
function Address() {
  return <output aria-label="Adresse">{useLocation().pathname}</output>;
}

export function renderShell(path: string, onLogout = vi.fn()) {
  return {
    onLogout,
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <Shell onLogout={onLogout} />
        <Address />
      </MemoryRouter>,
    ),
  };
}
