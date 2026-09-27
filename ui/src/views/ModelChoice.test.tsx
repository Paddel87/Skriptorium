import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAPTER,
  ENTRY,
  fail,
  fakeApi,
  ok,
  sseFeed,
  STORY,
} from "../../fake-api";
import { Account } from "./Account";
import { StoryPage } from "./StoryPage";
import { describeUsage } from "./WritingPanel";

const BASE = "/api/worlds/salzmark/stories/ueberfahrt";
const MODELS = {
  models: ["x-ai/grok-4.7", "x-ai/grok-4.6"],
  default: "x-ai/grok-4.7",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function routes(feed: ReturnType<typeof sseFeed>) {
  return {
    "GET /api/models": ok(MODELS),
    "GET /api/worlds": ok([]),
    "GET /api/worlds/salzmark/entries": ok([ENTRY]),
    [`GET ${BASE}/chapters`]: ok([CHAPTER]),
    [`POST ${BASE}/chapters/1/write`]: () => ({
      status: 200,
      stream: feed.stream,
    }),
  };
}

async function modelSelect(expected: string): Promise<HTMLElement> {
  const select = await screen.findByLabelText("Modell");
  await waitFor(() => {
    expect(select).toHaveProperty("value", expected);
  });
  return select;
}

describe("model per story (step 3.9, FR-018)", () => {
  it("preselects the story's model and keeps a new choice", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi({
      ...routes(feed),
      [`PATCH ${BASE}`]: (body) => ({
        status: 200,
        body: { ...STORY, ...(body as object) },
      }),
    });
    const user = userEvent.setup();
    render(<StoryPage story={{ ...STORY, model: "x-ai/grok-4.6" }} />);
    const select = await modelSelect("x-ai/grok-4.6");
    expect(screen.getByText("Anbieter: OpenRouter")).toBeDefined();

    await user.selectOptions(select, "x-ai/grok-4.7");
    await waitFor(() => {
      expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({
        model: "x-ai/grok-4.7",
      });
    });
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    await waitFor(() => {
      expect(calls.find((c) => c.path.endsWith("/write"))?.body).toMatchObject({
        model: "x-ai/grok-4.7",
      });
    });
    feed.close();
  });

  it("falls back to the preset when the story's model is no longer offered", async () => {
    fakeApi(routes(sseFeed()));
    render(<StoryPage story={{ ...STORY, model: "alt/modell" }} />);
    await modelSelect("x-ai/grok-4.7");
  });

  it("reports a model that could not be kept", async () => {
    fakeApi({
      ...routes(sseFeed()),
      [`PATCH ${BASE}`]: fail(422, "Unbekanntes Modell: x-ai/grok-4.6"),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await user.selectOptions(
      await modelSelect("x-ai/grok-4.7"),
      "x-ai/grok-4.6",
    );
    expect(
      await screen.findByText("Unbekanntes Modell: x-ai/grok-4.6"),
    ).toBeDefined();
  });

  it("shows tokens and cost of a proposal", async () => {
    const feed = sseFeed();
    fakeApi(routes(feed));
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await modelSelect("x-ai/grok-4.7");
    await user.click(screen.getByRole("button", { name: "Weiterschreiben" }));
    feed.send("text", { text: "Nebel." });
    feed.send("done", {
      input_tokens: 12000,
      output_tokens: 40,
      cost_usd: 0.0021,
      finish_reason: "stop",
    });
    feed.close();
    expect(
      await screen.findByText(
        "Verbrauch: 12.000 Token ein, 40 aus · Kosten 0,0021 $",
      ),
    ).toBeDefined();
  });
});

describe("describeUsage", () => {
  it("names missing values", () => {
    expect(
      describeUsage({
        type: "done",
        input_tokens: null,
        output_tokens: 7,
        cost_usd: null,
        finish_reason: null,
      }),
    ).toBe("Verbrauch: ? Token ein, 7 aus · Kosten nicht gemeldet");
  });
});

describe("costs of this month (ADR-023)", () => {
  it("shows the sum and requests without cost", async () => {
    fakeApi({
      "GET /api/auth/sessions": ok([]),
      "GET /api/usage": ok({
        month: "2026-09",
        requests: 2,
        input_tokens: 1200,
        output_tokens: 40,
        cost_usd: 0.0021,
        without_cost: 1,
      }),
    });
    render(<Account />);
    expect(
      await screen.findByText(
        "0,0021 $ für 2 Anfragen (1.200 Token ein, 40 aus)",
      ),
    ).toBeDefined();
    expect(
      screen.getByText(/1 abgebrochene oder gescheiterte Anfrage ohne/),
    ).toBeDefined();
  });

  it("uses the singular and hides the note without such requests", async () => {
    fakeApi({
      "GET /api/auth/sessions": ok([]),
      "GET /api/usage": ok({
        month: "2026-09",
        requests: 1,
        input_tokens: 5,
        output_tokens: 1,
        cost_usd: 0,
        without_cost: 0,
      }),
    });
    render(<Account />);
    expect(
      await screen.findByText("0 $ für 1 Anfrage (5 Token ein, 1 aus)"),
    ).toBeDefined();
    expect(screen.queryByText(/abgebrochene/)).toBeNull();
  });

  it("shows several requests without cost in the plural", async () => {
    fakeApi({
      "GET /api/auth/sessions": ok([]),
      "GET /api/usage": ok({
        month: "2026-09",
        requests: 3,
        input_tokens: 0,
        output_tokens: 0,
        cost_usd: 0,
        without_cost: 3,
      }),
    });
    render(<Account />);
    expect(
      await screen.findByText(/3 abgebrochene oder gescheiterte Anfragen ohne/),
    ).toBeDefined();
  });
});
