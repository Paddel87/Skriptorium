import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
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

  it("navigates worlds, story, account and logs out", async () => {
    fakeApi({
      ...loggedIn,
      "GET /api/worlds/salzmark/stories": ok([STORY]),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
      "GET /api/auth/sessions": ok([]),
      "POST /api/worlds": created(WORLD),
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: "Die Salzmark" }),
    );
    expect(screen.getByText("› Die Salzmark")).toBeDefined();
    await user.click(
      await screen.findByRole("button", { name: "Die Überfahrt" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Die Überfahrt" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Die Salzmark" }));
    expect(
      await screen.findByRole("button", { name: "Die Überfahrt" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Konto" }));
    expect(
      await screen.findByRole("heading", { name: "Sitzungen" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Skriptorium" }));
    expect(
      await screen.findByRole("heading", { name: "Welten" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Abmelden" }));
    expect(
      await screen.findByRole("button", { name: "Anmelden" }),
    ).toBeDefined();
  });
});
