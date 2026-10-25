import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  CHAPTER,
  ENTRY,
  fail,
  fakeApi,
  modelList,
  NO_TASK_MODELS,
  ok,
  sseFeed,
  STORY,
  WORLD,
} from "../../fake-api";
import { renderShell } from "../../render-shell";
import type { CanonEntry, ModelList } from "../api";
import { taskModel } from "../models";
import { AppearanceExtract } from "./AppearanceExtract";
import { ImageDescription } from "./ImageDescription";
import { ImageGenerate } from "./ImageGenerate";
import { Settings } from "./Settings";
import { StoryPage } from "./StoryPage";

const CATALOG = [
  catalogModel("x-ai/grok-4.6", {
    name: "SpaceXAI: Grok 4.6",
    reads_images: true,
  }),
  catalogModel("deepseek/deepseek-v3.2", { name: "DeepSeek: V3.2" }),
  catalogModel("google/gemini-flash", {
    name: "Google: Flash",
    reads_images: true,
  }),
  catalogModel("openai/gpt-5", { name: "OpenAI: GPT-5", reads_images: true }),
];
const IMAGE_MODELS = {
  default: "black-forest-labs/flux.2-pro",
  models: [
    { id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro" },
    { id: "bytedance-seed/seedream-4.5", name: "Seedream 4.5" },
  ],
  available: true,
  ready: true,
};

afterEach(() => {
  vi.restoreAllMocks();
});

function list(tasks: Partial<ModelList["tasks"]> = {}): ModelList {
  return modelList(["x-ai/grok-4.6", "openai/gpt-5"], CATALOG, tasks);
}

function settingsApi(
  start: ModelList,
  extra: Record<string, Parameters<typeof fakeApi>[0][string]> = {},
) {
  return fakeApi({
    "GET /api/models": ok(start),
    "GET /api/images/models": ok(IMAGE_MODELS),
    "PUT /api/models/aufgaben": (body) => ({
      status: 200,
      body: {
        ...start,
        tasks: (body as { tasks: ModelList["tasks"] }).tasks,
      },
    }),
    ...extra,
  });
}

function row(name: string): HTMLSelectElement {
  return screen.getByRole("combobox", { name: new RegExp(`^${name}`) });
}

function optionTexts(select: HTMLSelectElement): string[] {
  return [...select.options].map((option) => option.text);
}

describe("settings: model per task (step 9.7, ADR-096)", () => {
  it("lists the seven tasks with the preset and saves a choice at once", async () => {
    const { calls } = settingsApi(list());
    const user = userEvent.setup();
    render(<Settings />);

    await screen.findByRole("combobox", { name: /^Weltenbauer/ });
    expect(screen.getAllByRole("combobox")).toHaveLength(7);
    for (const name of [
      "Schreiben",
      "Weltenbauer",
      "Kapitel-Kurzfassung",
      "Gesamtzusammenfassung",
      "Aussehen herauslösen",
    ]) {
      expect(row(name).value).toBe("");
      expect(row(name).options[0]?.text).toBe("Voreinstellung (Grok 4.6)");
    }
    expect(optionTexts(row("Weltenbauer"))).toEqual([
      "Voreinstellung (Grok 4.6)",
      "★ Grok 4.6 · 6,3 ct",
      "★ GPT-5 · 6,3 ct",
    ]);

    await user.selectOptions(row("Weltenbauer"), "openai/gpt-5");

    await waitFor(() => {
      expect(row("Weltenbauer").value).toBe("openai/gpt-5");
    });
    expect(calls.at(-1)).toMatchObject({
      method: "PUT",
      path: "/api/models/aufgaben",
      body: { tasks: { ...NO_TASK_MODELS, weltenbau: "openai/gpt-5" } },
    });

    await user.selectOptions(row("Weltenbauer"), "");
    await waitFor(() => {
      expect(calls.at(-1)?.body).toEqual({ tasks: NO_TASK_MODELS });
    });
  });

  it("offers only image-reading models for describing, favorites first", async () => {
    settingsApi(list());
    render(<Settings />);

    await screen.findByRole("combobox", { name: /^Bild beschreiben/ });
    const select = row("Bild beschreiben");

    expect([...select.options].map((option) => option.value)).toEqual([
      "",
      "x-ai/grok-4.6",
      "openai/gpt-5",
      "google/gemini-flash",
    ]);
    expect(select.options[0]?.text).toBe("Voreinstellung (Grok 4.6)");
  });

  it("offers the image models for generating images", async () => {
    const { calls } = settingsApi(list());
    const user = userEvent.setup();
    render(<Settings />);
    await waitFor(() => {
      expect(optionTexts(row("Bilder erzeugen"))).toEqual([
        "Voreinstellung (FLUX.2 Pro)",
        "FLUX.2 Pro",
        "Seedream 4.5",
      ]);
    });

    await user.selectOptions(
      row("Bilder erzeugen"),
      "bytedance-seed/seedream-4.5",
    );

    await waitFor(() => {
      expect(calls.at(-1)?.body).toEqual({
        tasks: {
          ...NO_TASK_MODELS,
          bilderzeugung: "bytedance-seed/seedream-4.5",
        },
      });
    });
  });

  it("keeps a saved model outside the favorites and warns when it is gone", async () => {
    settingsApi(
      list({
        schreiben: "deepseek/deepseek-v3.2",
        aussehen: "weg/modell",
        bilderzeugung: "weg/bild",
      }),
    );
    render(<Settings />);

    await waitFor(() => {
      expect(row("Schreiben").value).toBe("deepseek/deepseek-v3.2");
    });
    expect(optionTexts(row("Schreiben"))).toContain("V3.2 · 6,3 ct");
    expect(row("Aussehen herauslösen").value).toBe("weg/modell");
    await waitFor(() => {
      expect(row("Bilder erzeugen").value).toBe("weg/bild");
    });
    expect(
      screen.getAllByText(
        "Nicht mehr im Angebot – es gilt die Voreinstellung.",
      ),
    ).toHaveLength(2);
    // With a saved image model the list names that one as preset, not the program's own.
    expect(row("Bilder erzeugen").options[0]?.text).toBe(
      "Voreinstellung des Programms",
    );
  });

  it("warns about nothing while the lists cannot be loaded", async () => {
    settingsApi(
      {
        ...modelList(["x-ai/grok-4.6"], [], { weltenbau: "a/b" }),
        catalog_available: false,
      },
      {
        "GET /api/images/models": ok({
          ...IMAGE_MODELS,
          models: [],
          available: false,
        }),
      },
    );
    render(<Settings />);

    await waitFor(() => {
      expect(row("Weltenbauer").value).toBe("a/b");
    });
    expect(optionTexts(row("Bild beschreiben"))).toEqual([
      "Voreinstellung (erstes Modell, das Bilder liest)",
      "★ x-ai/grok-4.6",
    ]);
    expect(screen.queryByText(/Nicht mehr im Angebot/)).toBeNull();
  });

  it("shows why saving failed and keeps the old choice", async () => {
    settingsApi(list(), {
      "PUT /api/models/aufgaben": fail(422, "Modell passt nicht zur Aufgabe"),
    });
    const user = userEvent.setup();
    render(<Settings />);
    await screen.findByRole("combobox", { name: /^Weltenbauer/ });

    await user.selectOptions(row("Weltenbauer"), "openai/gpt-5");

    expect(
      await screen.findByText("Modell passt nicht zur Aufgabe"),
    ).toBeDefined();
    expect(row("Weltenbauer").value).toBe("");
  });

  it("shows why the models could not be loaded", async () => {
    fakeApi({
      "GET /api/models": fail(500, "Modelle nicht erreichbar"),
      "GET /api/images/models": ok(IMAGE_MODELS),
    });
    render(<Settings />);

    expect(await screen.findByText("Modelle nicht erreichbar")).toBeDefined();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
  });

  it("opens the model management and takes over the saved favorites", async () => {
    settingsApi(list(), {
      "PUT /api/models/favoriten": ok({
        ...list(),
        favorites: ["openai/gpt-5"],
        models: ["openai/gpt-5"],
      }),
    });
    const user = userEvent.setup();
    render(<Settings />);
    await user.click(
      await screen.findByRole("button", { name: "Modelle verwalten …" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Modelle verwalten" });

    await user.click(
      within(dialog).getByRole("button", { name: "Grok 4.6 als Favorit" }),
    );
    await waitFor(() => {
      expect(optionTexts(row("Weltenbauer"))).toEqual([
        "Voreinstellung (Grok 4.6)",
        "★ GPT-5 · 6,3 ct",
      ]);
    });
    await user.click(within(dialog).getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is reached from the bar on the left", async () => {
    settingsApi(list(), { "GET /api/worlds": ok([WORLD]) });
    const user = userEvent.setup();
    renderShell("/");

    await user.click(screen.getByRole("button", { name: "Einstellungen" }));

    expect(screen.getByLabelText("Adresse").textContent).toBe("/einstellungen");
    expect(
      await screen.findByRole("heading", { name: "Modell je Aufgabe" }),
    ).toBeDefined();
  });
});

describe("tasks start with their saved model (step 9.7)", () => {
  it("the saved model counts only while the loaded catalog offers it", () => {
    expect(taskModel(list({ aussehen: "openai/gpt-5" }), "aussehen")).toBe(
      "openai/gpt-5",
    );
    expect(taskModel(list({ aussehen: "weg/modell" }), "aussehen")).toBeNull();
    expect(taskModel(list(), "aussehen")).toBeNull();
    expect(
      taskModel(
        { ...modelList([], [], { aussehen: "a/b" }), catalog_available: false },
        "aussehen",
      ),
    ).toBe("a/b");
  });

  it("writing preselects the task model for a story without one", async () => {
    fakeApi({
      "GET /api/models": ok(list({ schreiben: "openai/gpt-5" })),
      "GET /api/worlds": ok([WORLD]),
      "GET /api/worlds/salzmark/entries": ok([ENTRY]),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
    });
    render(<StoryPage story={{ ...STORY, model: null }} />);

    const select = await screen.findByLabelText("Modell");
    await waitFor(() => {
      expect(select).toHaveProperty("value", "openai/gpt-5");
    });
  });

  it("the story's own model comes first", async () => {
    fakeApi({
      "GET /api/models": ok(list({ schreiben: "openai/gpt-5" })),
      "GET /api/worlds": ok([WORLD]),
      "GET /api/worlds/salzmark/entries": ok([ENTRY]),
      "GET /api/worlds/salzmark/stories/ueberfahrt/chapters": ok([CHAPTER]),
    });
    render(<StoryPage story={{ ...STORY, model: "x-ai/grok-4.6" }} />);

    const select = await screen.findByLabelText("Modell");
    await waitFor(() => {
      expect(
        [...(select as HTMLSelectElement).options].map((o) => o.text),
      ).toContain("Modelle verwalten …");
    });
    expect(select).toHaveProperty("value", "x-ai/grok-4.6");
  });

  it("describing an image preselects its task model", async () => {
    fakeApi({
      "GET /api/models": ok(list({ bildbeschreibung: "google/gemini-flash" })),
    });
    render(
      <ImageDescription
        title="Aussehen von Kael"
        path="/x/describe"
        takeOverLabel="Übernehmen"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const select = await screen.findByLabelText("Modell (liest Bilder)");
    await waitFor(() => {
      expect(select).toHaveProperty("value", "google/gemini-flash");
    });
  });

  it("taking out the looks preselects its task model, even outside the favorites", async () => {
    fakeApi({
      "GET /api/models": ok(list({ aussehen: "deepseek/deepseek-v3.2" })),
      "POST /api/worlds/salzmark/entries/kael/appearance": () => ({
        status: 200,
        stream: sseFeed().stream,
      }),
    });
    const figure: CanonEntry = { ...ENTRY, body: "- **Bart:** grau" };
    render(
      <AppearanceExtract
        entry={figure}
        onChanged={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const select = await screen.findByLabelText(
      "Modell (liest nur diesen Eintrag)",
    );
    await waitFor(() => {
      expect(select).toHaveProperty("value", "deepseek/deepseek-v3.2");
    });
    expect(optionTexts(select as HTMLSelectElement)).toEqual([
      "DeepSeek: V3.2",
      "SpaceXAI: Grok 4.6",
      "OpenAI: GPT-5",
    ]);
  });

  it("generating an image says where its model comes from", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        ...IMAGE_MODELS,
        default: "bytedance-seed/seedream-4.5",
      }),
      "GET /api/images/price": ok({ cost_usd: 0.04, unit: "image" }),
    });
    const { unmount } = render(
      <ImageGenerate
        title="Bild erzeugen"
        initialPrompt="Kael"
        initialFormat="1:1"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const select = await screen.findByLabelText("Modell");
    await waitFor(() => {
      expect(select).toHaveProperty("value", "bytedance-seed/seedream-4.5");
    });
    expect(
      screen.getByText(
        "Aus den Einstellungen. Eine andere Wahl gilt nur für dieses Bild.",
      ),
    ).toBeDefined();
    unmount();

    render(
      <ImageGenerate
        title="Bild erzeugen"
        initialPrompt="Kael"
        initialFormat="1:1"
        initialModel="black-forest-labs/flux.2-pro"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Modell")).toHaveProperty(
        "value",
        "black-forest-labs/flux.2-pro",
      );
    });
    expect(screen.queryByText(/Aus den Einstellungen/)).toBeNull();
  });
});
