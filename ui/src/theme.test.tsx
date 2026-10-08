import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { applyTheme, readTheme, saveTheme } from "./theme";
import { ThemeChoice } from "./views/ThemeChoice";

afterEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  vi.restoreAllMocks();
});

describe("theme", () => {
  it("follows the device until the author chooses (step 5.19)", () => {
    expect(readTheme()).toBe("automatisch");
    saveTheme("dunkel");
    expect(readTheme()).toBe("dunkel");
    window.localStorage.setItem("skriptorium.darstellung", "lila");
    expect(readTheme()).toBe("automatisch");
  });

  it("sets and removes the theme on the root element", () => {
    applyTheme("dunkel");
    expect(document.documentElement.dataset.theme).toBe("dark");
    applyTheme("hell");
    expect(document.documentElement.dataset.theme).toBe("light");
    applyTheme("automatisch");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("works without browser storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blockiert");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blockiert");
    });
    expect(readTheme()).toBe("automatisch");
    expect(() => {
      saveTheme("hell");
    }).not.toThrow();
  });
});

describe("ThemeChoice", () => {
  it("switches the appearance and remembers it", async () => {
    saveTheme("hell");
    const user = userEvent.setup();
    render(<ThemeChoice />);
    const choice = screen.getByLabelText("Darstellung");
    expect(choice).toHaveProperty("value", "hell");
    await user.selectOptions(choice, "dunkel");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readTheme()).toBe("dunkel");
  });
});
