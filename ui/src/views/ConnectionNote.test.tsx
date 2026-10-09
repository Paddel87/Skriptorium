import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConnectionNote } from "./ConnectionNote";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ConnectionNote (step 5.21)", () => {
  it("says so while the device has no connection and disappears with it back", () => {
    const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    render(<ConnectionNote />);
    expect(screen.queryByRole("status")).toBeNull();
    online.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status").textContent).toMatch(
      /^Keine Verbindung\. Der Text auf dem Bildschirm bleibt stehen/,
    );
    online.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByRole("status")).toBeNull();
  });
});
