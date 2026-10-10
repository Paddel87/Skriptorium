import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  modelList,
  CHAPTER,
  created,
  fail,
  fakeApi,
  noContent,
  ok,
  STORY,
  WORLD,
} from "../fake-api";
import { App, appTitle } from "./App";

afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = "";
});

const loggedIn = {
  "GET /api/auth/session": ok({ id: "s", current: true }),
  "GET /api/worlds": ok([WORLD]),
  "POST /api/auth/logout": noContent(),
};

describe("App", () => {
  it("names the application", () => {
    expect(appTitle()).toBe("Skriptorium");
  });

  it("shows the login without a session and logs in", async () => {
    let session = false;
    const { calls } = fakeApi({
      ...loggedIn,
      "GET /api/auth/session": () =>
        session
          ? { status: 200, body: {} }
          : { status: 401, body: { detail: "Anmeldung erforderlich" } },
      "POST /api/auth/login": () => {
        session = true;
        return { status: 204 };
      },
    });
    const user = userEvent.setup();
    render(<App />);
    const field = await screen.findByLabelText("Passwort");
    expect(field).toHaveProperty("type", "password");
    await user.type(field, "ein langes Passwort hier");
    await user.click(screen.getByRole("button", { name: "Anmelden" }));
    expect(
      await screen.findByRole("button", { name: "Die Salzmark" }),
    ).toBeDefined();
    expect(calls.find((c) => c.path === "/api/auth/login")?.body).toEqual({
      password: "ein langes Passwort hier",
    });
  });

  it("shows login errors", async () => {
    fakeApi({
      "GET /api/auth/session": fail(401, "Anmeldung erforderlich"),
      "POST /api/auth/login": fail(429, "Zu viele Fehlversuche"),
    });
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText("Passwort"), "x");
    await user.click(screen.getByRole("button", { name: "Anmelden" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /15 Minuten/,
    );
  });

  it("sets the password with a setup code", async () => {
    const { calls } = fakeApi({
      "GET /api/auth/session": fail(401, "Anmeldung erforderlich"),
      "POST /api/auth/setup": noContent(),
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /Einrichtungscode/ }),
    );
    await user.type(screen.getByLabelText("Einrichtungscode"), " CODE123 ");
    await user.type(
      screen.getByLabelText("Neues Passwort"),
      "Salzwind über der Mark 7",
    );
    await user.type(screen.getByLabelText("Passwort wiederholen"), "anders");
    await user.click(
      screen.getByRole("button", { name: "Passwort festlegen" }),
    );
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /stimmen nicht/,
    );
    await user.clear(screen.getByLabelText("Passwort wiederholen"));
    await user.type(
      screen.getByLabelText("Passwort wiederholen"),
      "Salzwind über der Mark 7",
    );
    expect(screen.getByRole("link", { name: /Pwned Passwords/ })).toBeDefined();
    await user.click(
      screen.getByRole("button", { name: "Passwort festlegen" }),
    );
    expect(
      await screen.findByRole("button", { name: "Anmelden" }),
    ).toBeDefined();
    expect(calls.find((c) => c.path === "/api/auth/setup")?.body).toEqual({
      code: "CODE123",
      password: "Salzwind über der Mark 7",
    });
  });

  it("shows setup errors and goes back", async () => {
    fakeApi({
      "GET /api/auth/session": fail(401, "x"),
      "POST /api/auth/setup": fail(422, { reason: "breached" }),
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /Einrichtungscode/ }),
    );
    await user.type(screen.getByLabelText("Einrichtungscode"), "c");
    await user.type(screen.getByLabelText("Neues Passwort"), "p");
    await user.type(screen.getByLabelText("Passwort wiederholen"), "p");
    await user.click(
      screen.getByRole("button", { name: "Passwort festlegen" }),
    );
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /Datenlecks/,
    );
    await user.click(
      screen.getByRole("button", { name: "Zurück zur Anmeldung" }),
    );
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeDefined();
  });

  it("navigates with the list and the bar on the left; addresses survive a reload (step 5.11)", async () => {
    fakeApi({
      ...loggedIn,
      "GET /api/worlds/salzmark/stories": ok([STORY]),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
      "GET /api/worlds/salzmark/entries": ok([]),
      "GET /api/models": ok(modelList(["m"])),
      "GET /api/auth/sessions": ok([]),
      "GET /api/usage": ok({
        month: "2026-10",
        requests: 0,
        input_tokens: 0,
        output_tokens: 0,
        cost_usd: 0,
        without_cost: 0,
      }),
      "POST /api/worlds": created(WORLD),
    });
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Welten" }),
    ).toBeDefined();
    const list = screen.getByRole("navigation", { name: "Geschichten" });
    await user.click(
      await within(list).findByRole("link", { name: "Die Salzmark" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Die Salzmark" }),
    ).toBeDefined();
    expect(window.location.hash).toBe("#/welt/salzmark/geschichten");
    await user.click(within(list).getByRole("link", { name: "Die Überfahrt" }));
    expect(await screen.findByDisplayValue("Aufbruch")).toBeDefined();
    expect(window.location.hash).toBe("#/welt/salzmark/geschichte/ueberfahrt");

    // The same address after a reload opens the same story again.
    unmount();
    render(<App />);
    expect(await screen.findByDisplayValue("Aufbruch")).toBeDefined();

    const bar = screen.getByRole("navigation", { name: "Bereiche" });
    await user.click(within(bar).getByRole("button", { name: "Kanon" }));
    expect(window.location.hash).toBe("#/welt/salzmark/kanon");
    await user.click(within(bar).getByRole("button", { name: "Konto" }));
    expect(
      await screen.findByRole("heading", { name: "Sitzungen" }),
    ).toBeDefined();
    await user.click(within(bar).getByRole("button", { name: "Welten" }));
    expect(
      await screen.findByRole("heading", { name: "Welten" }),
    ).toBeDefined();
    const listToggle = within(bar).getByRole("button", { name: "Liste" });
    expect(listToggle.getAttribute("aria-pressed")).toBe("true");
    await user.click(listToggle);
    expect(listToggle.getAttribute("aria-pressed")).toBe("false");
    await user.click(within(bar).getByRole("button", { name: "Abmelden" }));
    expect(
      await screen.findByRole("button", { name: "Anmelden" }),
    ).toBeDefined();
    expect(window.location.hash).toBe("#/");
  });

  it("opens and closes the menu on small screens", async () => {
    fakeApi({ ...loggedIn, "GET /api/worlds/salzmark/stories": ok([STORY]) });
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.click(await screen.findByRole("button", { name: "Menü" }));
    expect(container.querySelector(".shell.menu-open")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Schließen" }));
    expect(container.querySelector(".shell.menu-open")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Menü" }));
    await user.click(await screen.findByRole("link", { name: "Die Salzmark" }));
    expect(container.querySelector(".shell.menu-open")).toBeNull();
  });
});

describe("expired session", () => {
  it("asks to log in again above the open screen and keeps it", async () => {
    let expired = false;
    fakeApi({
      ...loggedIn,
      "GET /api/worlds/salzmark/stories": () =>
        expired
          ? { status: 401, body: { detail: "Anmeldung erforderlich" } }
          : { status: 200, body: [] },
      "POST /api/worlds/salzmark/stories": () => ({
        status: 401,
        body: { detail: "Anmeldung erforderlich" },
      }),
      "POST /api/auth/login": () => {
        expired = false;
        return { status: 204 };
      },
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("link", { name: "Die Salzmark" }));
    await user.type(
      await screen.findByLabelText("Titel"),
      "Mein ungespeicherter Titel",
    );
    expired = true;
    await user.click(
      screen.getByRole("button", { name: "Geschichte anlegen" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Sitzung abgelaufen",
    });
    expect(screen.getByLabelText("Titel")).toHaveProperty(
      "value",
      "Mein ungespeicherter Titel",
    );
    expect(
      within(dialog).queryByRole("button", { name: /Einrichtungscode/ }),
    ).toBeNull();
    await user.type(
      within(dialog).getByLabelText("Passwort"),
      "ein langes Passwort hier",
    );
    await user.click(within(dialog).getByRole("button", { name: "Anmelden" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(screen.getByLabelText("Titel")).toHaveProperty(
      "value",
      "Mein ungespeicherter Titel",
    );
  });
});
