import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  modelList,
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
import { describeUsage, offeredModels } from "./WritingPanel";
import {
  formatCents,
  formatContext,
  formatPrice,
  optionLabel,
  shortName,
} from "../models";

const BASE = "/api/worlds/salzmark/stories/ueberfahrt";
const MODELS = modelList(["x-ai/grok-4.7", "x-ai/grok-4.6"]);

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

  it("keeps the story's model outside the favorites (ADR-055)", async () => {
    fakeApi(routes(sseFeed()));
    render(<StoryPage story={{ ...STORY, model: "alt/modell" }} />);
    const select = await modelSelect("alt/modell");
    // The story's model is shown before the favorites have loaded; wait for the whole list.
    await waitFor(() => {
      const options = [...(select as HTMLSelectElement).options].map(
        (option) => option.text,
      );
      expect(options).toEqual([
        "★ x-ai/grok-4.7",
        "★ x-ai/grok-4.6",
        "alt/modell",
        "──────────",
        "Modelle verwalten …",
      ]);
    });
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

const CATALOG = [
  catalogModel("x-ai/grok-4.7", {
    name: "SpaceXAI: Grok 4.7",
    thinking: "lange",
  }),
  catalogModel("x-ai/grok-4.6", {
    name: "SpaceXAI: Grok 4.6",
    thinking: "vor",
    checked: true,
  }),
  catalogModel("deepseek/deepseek-v3.2", {
    name: "DeepSeek: DeepSeek V3.2",
    input_price: 0.259,
    output_price: 0.8,
    estimated_cost: 0.0082,
    context_length: 163_840,
  }),
  catalogModel("openai/gpt-5", {
    name: "OpenAI: GPT-5",
    estimated_cost: 0.0425,
    moderated: true,
    context_length: 400_000,
  }),
  catalogModel("mistralai/klein", {
    name: "Mistral: Klein",
    estimated_cost: 0.0032,
    context_length: 16_000,
  }),
];
const WITH_CATALOG = modelList(["x-ai/grok-4.7", "x-ai/grok-4.6"], CATALOG);

function catalogRoutes(feed: ReturnType<typeof sseFeed>) {
  return { ...routes(feed), "GET /api/models": ok(WITH_CATALOG) };
}

async function openManager(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(
    await modelSelect("x-ai/grok-4.7"),
    "Modelle verwalten …",
  );
  return screen.findByRole("dialog", { name: "Modelle verwalten" });
}

function rows(dialog: HTMLElement): string[] {
  return within(dialog)
    .getAllByRole("listitem")
    .map((item) => item.querySelector("small")?.textContent ?? "");
}

describe("model catalog and favorites (step 5.12, ADR-055)", () => {
  it("shows favorites with short name and cost per proposal", async () => {
    fakeApi(catalogRoutes(sseFeed()));
    render(<StoryPage story={STORY} />);
    const select = await modelSelect("x-ai/grok-4.7");
    expect(
      [...(select as HTMLSelectElement).options].map((option) => option.text),
    ).toEqual([
      "★ Grok 4.7 · 6,3 ct",
      "★ Grok 4.6 · 6,3 ct",
      "──────────",
      "Modelle verwalten …",
    ]);
  });

  it("opens the catalog without changing the model", async () => {
    const { calls } = fakeApi(catalogRoutes(sseFeed()));
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const dialog = await openManager(user);

    expect(screen.getByLabelText("Modell")).toHaveProperty(
      "value",
      "x-ai/grok-4.7",
    );
    expect(calls.some((call) => call.method === "PATCH")).toBe(false);
    // Favorites first, then by cost; moderated and small-context models are filtered out.
    expect(rows(dialog)).toEqual([
      "x-ai/grok-4.7",
      "x-ai/grok-4.6",
      "deepseek/deepseek-v3.2",
    ]);
    expect(within(dialog).getByText("denkt lange")).toBeDefined();
    expect(within(dialog).getByText("denkt vor")).toBeDefined();
    expect(within(dialog).getByText("geprüft")).toBeDefined();
    expect(within(dialog).getByText("0,8 ct")).toBeDefined();
    expect(
      within(dialog).getByText(
        "deepseek · Kontext 164 Tsd. · 0,26 $ / 0,80 $ je 1 Mio. Token",
      ),
    ).toBeDefined();
    expect(
      within(dialog).getByText(
        "3 von 5 Modellen von OpenRouter · ★ = im Auswahlfeld",
      ),
    ).toBeDefined();
  });

  it("filters by search, provider, price and the chips", async () => {
    fakeApi(catalogRoutes(sseFeed()));
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const dialog = await openManager(user);

    await user.click(
      within(dialog).getByRole("button", {
        name: "ohne OpenRouter-Moderation",
      }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "mind. 30 Tsd. Kontext" }),
    );
    expect(rows(dialog)).toHaveLength(5);
    expect(within(dialog).getByText("moderiert")).toBeDefined();

    await user.selectOptions(
      within(dialog).getByLabelText("Anbieter:"),
      "x-ai",
    );
    expect(rows(dialog)).toEqual(["x-ai/grok-4.7", "x-ai/grok-4.6"]);
    await user.selectOptions(within(dialog).getByLabelText("Anbieter:"), "");

    await user.selectOptions(
      within(dialog).getByLabelText("Preis je Vorschlag bis"),
      "1,0 ct",
    );
    expect(rows(dialog)).toEqual(["mistralai/klein", "deepseek/deepseek-v3.2"]);
    await user.selectOptions(
      within(dialog).getByLabelText("Preis je Vorschlag bis"),
      "beliebig",
    );

    await user.type(within(dialog).getByLabelText("Modelle suchen"), "GPT");
    expect(rows(dialog)).toEqual(["openai/gpt-5"]);
    await user.clear(within(dialog).getByLabelText("Modelle suchen"));

    await user.click(
      within(dialog).getByRole("button", { name: "nur Favoriten" }),
    );
    expect(rows(dialog)).toEqual(["x-ai/grok-4.7", "x-ai/grok-4.6"]);
  });

  it("saves a star on the server and updates the selection field", async () => {
    const { calls } = fakeApi({
      ...catalogRoutes(sseFeed()),
      "PUT /api/models/favoriten": (body) => ({
        status: 200,
        body: modelList((body as { favorites: string[] }).favorites, CATALOG),
      }),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const dialog = await openManager(user);

    await user.click(
      within(dialog).getByRole("button", { name: "DeepSeek V3.2 als Favorit" }),
    );
    await waitFor(() => {
      expect(calls.find((call) => call.method === "PUT")?.body).toEqual({
        favorites: ["x-ai/grok-4.7", "x-ai/grok-4.6", "deepseek/deepseek-v3.2"],
      });
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Grok 4.6 als Favorit" }),
    );
    await waitFor(() => {
      expect(
        calls.filter((call) => call.method === "PUT").at(-1)?.body,
      ).toEqual({
        favorites: ["x-ai/grok-4.7", "deepseek/deepseek-v3.2"],
      });
    });
    await user.click(within(dialog).getByRole("button", { name: "Fertig" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    const select: HTMLSelectElement = screen.getByLabelText("Modell");
    expect([...select.options].map((option) => option.text)).toEqual([
      "★ Grok 4.7 · 6,3 ct",
      "★ DeepSeek V3.2 · 0,8 ct",
      "──────────",
      "Modelle verwalten …",
    ]);
  });

  it("reports a star that could not be saved", async () => {
    fakeApi({
      ...catalogRoutes(sseFeed()),
      "PUT /api/models/favoriten": fail(422, "Unbekanntes Modell: x"),
    });
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const dialog = await openManager(user);

    await user.click(
      within(dialog).getByRole("button", { name: "DeepSeek V3.2 als Favorit" }),
    );

    expect(
      await within(dialog).findByText("Unbekanntes Modell: x"),
    ).toBeDefined();
  });

  it("explains a catalog that cannot be loaded and closes with Escape", async () => {
    fakeApi(routes(sseFeed()));
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    const dialog = await openManager(user);

    expect(
      within(dialog).getByText(/OpenRouter ist gerade nicht erreichbar/),
    ).toBeDefined();
    expect(within(dialog).queryAllByRole("listitem")).toEqual([]);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes with the button and a click beside the dialog", async () => {
    fakeApi(catalogRoutes(sseFeed()));
    const user = userEvent.setup();
    render(<StoryPage story={STORY} />);
    await user.click(
      within(await openManager(user)).getByRole("button", {
        name: "Schließen",
      }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();

    const dialog = await openManager(user);
    await user.click(dialog);
    expect(screen.getByRole("dialog")).toBeDefined();
    const overlay = dialog.parentElement;
    if (overlay === null) {
      throw new Error("Dialog ohne Hintergrund");
    }
    await user.click(overlay);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("offeredModels", () => {
  it("offers the preset model when there are no favorites", () => {
    expect(offeredModels(modelList([]), "")).toEqual([]);
    expect(
      offeredModels({ ...modelList([]), default: "x-ai/grok-4.6" }, ""),
    ).toEqual(["x-ai/grok-4.6"]);
    expect(offeredModels(undefined, "alt/modell")).toEqual(["alt/modell"]);
    expect(offeredModels(undefined, "")).toEqual([]);
  });
});

describe("display of catalog values", () => {
  it("names unknown values", () => {
    expect(shortName(undefined, "a/b")).toBe("a/b");
    expect(shortName(catalogModel("a/b", { name: "Ohne Präfix" }), "a/b")).toBe(
      "Ohne Präfix",
    );
    expect(formatCents(null)).toBeNull();
    expect(formatContext(null)).toBe("?");
    expect(formatContext(1_048_576)).toBe("1 Mio.");
    expect(formatPrice(null)).toBe("?");
    expect(optionLabel(undefined, "a/b", false)).toBe("a/b");
  });
});
