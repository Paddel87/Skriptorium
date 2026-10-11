import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  modelList,
  openStorySettings,
  CHAPTER,
  fail,
  fakeApi,
  ok,
  STORY,
} from "../../fake-api";
import { describeSummaryFailure, type Chapter } from "../api";
import { StoryPage } from "./StoryPage";

const BASE = "/api/worlds/salzmark/stories/ueberfahrt";
const DONE = { ...CHAPTER, status: "abgeschlossen" as const };
// The writing panel below the chapter loads these; answered so they add no error messages.
const PANEL = {
  "GET /api/models": ok(modelList(["x-ai/grok-4.7"])),
  "GET /api/worlds/salzmark/entries": ok([]),
  // The guests section of the story page offers other worlds.
  "GET /api/worlds": ok([]),
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("chapter and overall summaries (step 3.6)", () => {
  it("completes a chapter, creates the summaries and saves a checked summary", async () => {
    let chapter: Chapter = CHAPTER;
    const { calls } = fakeApi({
      ...PANEL,
      [`GET ${BASE}/chapters`]: () => ({ status: 200, body: [chapter] }),
      [`POST ${BASE}/chapters/1/complete`]: () => {
        chapter = DONE;
        return { status: 200, body: chapter };
      },
      [`POST ${BASE}/chapters/1/summarize`]: () => {
        chapter = {
          ...DONE,
          summary: "Ilka bricht auf.",
          summary_status: "erzeugt",
        };
        return {
          status: 200,
          body: {
            chapter,
            story: { ...STORY, summary: "Ilka verlässt die Insel." },
            failure: null,
          },
        };
      },
      [`PUT ${BASE}/chapters/1/summary`]: (body) => {
        const { summary, status } = body as {
          summary: string;
          status: Chapter["summary_status"];
        };
        chapter = { ...chapter, summary, summary_status: status };
        return { status: 200, body: chapter };
      },
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);

    await user.click(
      await screen.findByRole("button", { name: "Kapitel abschließen" }),
    );

    const summary = await screen.findByLabelText("Kurzfassung des Kapitels");
    await waitFor(() => {
      expect(summary).toHaveProperty("value", "Ilka bricht auf.");
    });
    expect(
      screen.getByText("Status: von der KI erstellt, noch nicht geprüft"),
    ).toBeDefined();
    await openStorySettings(user);
    expect(screen.getByLabelText("Gesamtzusammenfassung")).toHaveProperty(
      "value",
      "Ilka verlässt die Insel.",
    );
    expect(calls.map((c) => `${c.method} ${c.path}`)).toContain(
      `POST ${BASE}/chapters/1/summarize`,
    );

    await user.type(summary, " Allein.");
    await user.click(
      screen.getByRole("button", { name: "Als geprüft markieren" }),
    );
    await waitFor(() => {
      expect(screen.getByText("Status: geprüft")).toBeDefined();
    });
    expect(calls.find((c) => c.method === "PUT")?.body).toEqual({
      summary: "Ilka bricht auf. Allein.",
      status: "geprüft",
    });
  });

  it("names a failed summary and creates it again on request", async () => {
    let answer = {
      chapter: DONE,
      story: STORY,
      failure: { stage: "kapitel", kind: "abgelehnt" },
    };
    const { calls } = fakeApi({
      ...PANEL,
      [`GET ${BASE}/chapters`]: () => ({
        status: 200,
        body: [
          calls.some((c) => c.path.endsWith("/complete")) ? DONE : CHAPTER,
        ],
      }),
      [`POST ${BASE}/chapters/1/complete`]: ok(DONE),
      [`POST ${BASE}/chapters/1/summarize`]: () => ({
        status: 200,
        body: answer,
      }),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);

    await user.click(
      await screen.findByRole("button", { name: "Kapitel abschließen" }),
    );

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Kurzfassung nicht erstellt. Das Modell hat die Anfrage abgelehnt. " +
        "Bis dahin nutzt die KI den Kapitelanfang.",
    );
    answer = { ...answer, failure: { stage: "gesamt", kind: "leer" } };
    await user.click(
      await screen.findByRole("button", { name: "Kurzfassung nachholen" }),
    );
    await waitFor(() => {
      expect(calls.filter((c) => c.path.endsWith("/summarize"))).toHaveLength(
        2,
      );
    });
    expect(
      await screen.findByText(
        "Kurzfassung erstellt, Gesamtzusammenfassung nicht fortgeschrieben. " +
          "Das Modell hat keinen Text geliefert.",
      ),
    ).toBeDefined();
  });

  it("reports errors of completing and summarizing", async () => {
    let completeFails = true;
    fakeApi({
      ...PANEL,
      [`GET ${BASE}/chapters`]: ok([CHAPTER]),
      [`POST ${BASE}/chapters/1/complete`]: () =>
        completeFails ? fail(404, "weg")() : { status: 200, body: DONE },
      [`POST ${BASE}/chapters/1/summarize`]: fail(
        503,
        "KI-Anbieter nicht eingerichtet",
      ),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const button = await screen.findByRole("button", {
      name: "Kapitel abschließen",
    });

    await user.click(button);
    expect(await screen.findByText("weg")).toBeDefined();
    completeFails = false;
    await user.click(button);
    expect(
      await screen.findByText(
        "Kein KI-Anbieter eingerichtet (OPENROUTER_API_KEY fehlt auf dem Server).",
      ),
    ).toBeDefined();
  });

  it("edits the overall summary", async () => {
    let fails = true;
    const { calls } = fakeApi({
      ...PANEL,
      [`GET ${BASE}/chapters`]: ok([CHAPTER]),
      [`PUT ${BASE}/summary`]: (body) =>
        fails
          ? fail(500, "nicht gespeichert")()
          : { status: 200, body: { ...STORY, ...(body as object) } },
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await openStorySettings(user);
    await user.click(
      await screen.findByText("Gesamtzusammenfassung", { selector: "summary" }),
    );
    expect(
      screen.getByText("Entsteht, sobald das erste Kapitel abgeschlossen ist."),
    ).toBeDefined();
    const field = screen.getByLabelText("Gesamtzusammenfassung");
    const save = screen.getByRole("button", {
      name: "Gesamtzusammenfassung speichern",
    });
    expect(save).toHaveProperty("disabled", true);

    await user.type(field, "Ilka sucht Tomas.");
    await user.click(save);
    expect(await screen.findByText("nicht gespeichert")).toBeDefined();
    fails = false;
    await user.click(save);
    await waitFor(() => {
      expect(
        screen.queryByText(
          "Entsteht, sobald das erste Kapitel abgeschlossen ist.",
        ),
      ).toBeNull();
    });
    expect(calls.filter((c) => c.method === "PUT").at(-1)?.body).toEqual({
      summary: "Ilka sucht Tomas.",
    });
  });
});

describe("the short summary in its own tab (step 6.2)", () => {
  it("has no tab while the chapter is open and has no summary", async () => {
    fakeApi({ ...PANEL, [`GET ${BASE}/chapters`]: ok([CHAPTER]) });
    render(<StoryPage story={STORY} />);

    await screen.findByRole("button", { name: "Kapitel abschließen" });
    expect(screen.queryByRole("button", { name: /^Kurzfassung/ })).toBeNull();
    expect(screen.queryByLabelText("Kurzfassung des Kapitels")).toBeNull();
  });

  it("marks an unchecked summary and shows it only in its tab", async () => {
    const created = {
      ...DONE,
      summary: "Ilka bricht auf.",
      summary_status: "erzeugt" as const,
    };
    fakeApi({ ...PANEL, [`GET ${BASE}/chapters`]: ok([created]) });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);

    const tab = await screen.findByRole("button", {
      name: /^Kurzfassung\s*– noch nicht geprüft$/,
    });
    expect(screen.queryByLabelText("Kurzfassung des Kapitels")).toBeNull();
    await user.click(tab);

    expect(tab.getAttribute("aria-current")).toBe("true");
    expect(screen.getByLabelText("Kurzfassung des Kapitels")).toHaveProperty(
      "value",
      "Ilka bricht auf.",
    );
    expect(screen.getByText(/Sie ist keine Anweisung/)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Manuskript" }));
    expect(screen.queryByLabelText("Kurzfassung des Kapitels")).toBeNull();
  });

  it("shows no mark for a checked summary", async () => {
    const checked = {
      ...DONE,
      summary: "Ilka bricht auf.",
      summary_status: "geprüft" as const,
    };
    fakeApi({ ...PANEL, [`GET ${BASE}/chapters`]: ok([checked]) });
    render(<StoryPage story={STORY} />);

    expect(
      await screen.findByRole("button", { name: "Kurzfassung" }),
    ).toBeDefined();
  });
});

describe("describeSummaryFailure", () => {
  it("names too long texts", () => {
    expect(describeSummaryFailure({ stage: "kapitel", kind: "zu_gross" })).toBe(
      "Kurzfassung nicht erstellt. Der Text ist zu lang für eine Anfrage. " +
        "Bis dahin nutzt die KI den Kapitelanfang.",
    );
  });
});
