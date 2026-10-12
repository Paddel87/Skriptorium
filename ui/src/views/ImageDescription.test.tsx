import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogModel,
  ENTRY,
  fakeApi,
  modelList,
  ok,
  sseFeed,
  WORLD,
} from "../../fake-api";
import type { CanonEntry } from "../api";
import { EntryImages } from "./EntryImages";
import { ImageDescription, withSection } from "./ImageDescription";
import { WorldMaps } from "./WorldMaps";

const PATH = "/api/worlds/salzmark/entries/kael/images/kael-a.webp/describe";
const CATALOG = [
  catalogModel("deepseek/deepseek-v3.2"),
  catalogModel("x-ai/grok-4.6", { reads_images: true }),
  catalogModel("google/gemini-flash", { reads_images: true }),
];
const MODELS = ok(modelList(["x-ai/grok-4.6"], CATALOG));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("describing an image once (step 7.13)", () => {
  it("offers only models that read images, streams, lets change and take over", async () => {
    const feed = sseFeed();
    const { calls } = fakeApi({
      "GET /api/models": MODELS,
      [`POST ${PATH}`]: () => ({ status: 200, stream: feed.stream }),
    });
    const taken = vi.fn(() => Promise.resolve());
    const closed = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageDescription
        title="Aussehen von Kael"
        path={PATH}
        takeOverLabel="Übernehmen als „Aussehen“"
        onTakeOver={taken}
        onClose={closed}
      />,
    );
    const select = await screen.findByLabelText("Modell (liest Bilder)");
    expect(
      [...(select as HTMLSelectElement).options].map((o) => o.value),
    ).toEqual(["x-ai/grok-4.6", "google/gemini-flash"]);
    await user.click(
      screen.getByRole("button", { name: "Beschreiben lassen" }),
    );
    expect(calls.at(-1)?.body).toEqual({ model: "x-ai/grok-4.6" });
    feed.send("start", { model: "x-ai/grok-4.6", estimated_tokens: 90 });
    feed.send("text", { text: "Ein hagerer Mann " });
    feed.send("text", { text: "mit grauem Bart." });
    feed.send("done", {
      input_tokens: 1840,
      output_tokens: 160,
      cost_usd: 0.006,
      finish_reason: "stop",
    });
    feed.close();
    const field = await screen.findByLabelText("Beschreibung");
    await waitFor(() => {
      expect(field).toHaveProperty(
        "value",
        "Ein hagerer Mann mit grauem Bart.",
      );
    });
    expect(screen.getByText(/1\.840 Token ein, 160 aus/)).toBeDefined();
    await user.type(field, " Narbe am Kinn.");
    await user.click(
      screen.getByRole("button", { name: "Übernehmen als „Aussehen“" }),
    );
    expect(taken).toHaveBeenCalledWith(
      "Ein hagerer Mann mit grauem Bart. Narbe am Kinn.",
    );
    expect(closed).toHaveBeenCalled();
  });

  it("shows a refusal of the model", async () => {
    const feed = sseFeed();
    fakeApi({
      "GET /api/models": MODELS,
      [`POST ${PATH}`]: () => ({ status: 200, stream: feed.stream }),
    });
    const user = userEvent.setup();
    render(
      <ImageDescription
        title="Aussehen"
        path={PATH}
        takeOverLabel="Übernehmen"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.click(
      await screen.findByRole("button", { name: "Beschreiben lassen" }),
    );
    feed.send("error", { kind: "abgelehnt" });
    feed.close();
    expect(
      await screen.findByText("Das Modell hat die Anfrage abgelehnt."),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Übernehmen" })).toBeNull();
  });

  it("says so when no model reads images", async () => {
    fakeApi({
      "GET /api/models": ok(modelList(["a/b"], [catalogModel("a/b")])),
    });
    render(
      <ImageDescription
        title="Aussehen"
        path={PATH}
        takeOverLabel="Übernehmen"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(
      await screen.findByText(
        "Gerade ist kein Modell verfügbar, das Bilder lesen kann.",
      ),
    ).toBeDefined();
  });

  it("adds the text as a section at the end", () => {
    expect(withSection("", "Aussehen", " Groß. ")).toBe(
      "## Aussehen\n\nGroß.\n",
    );
    expect(withSection("Wirtin.\n\n", "Aussehen", "Groß.")).toBe(
      "Wirtin.\n\n## Aussehen\n\nGroß.\n",
    );
  });

  it("takes a figure's looks over into its entry", async () => {
    const entry: CanonEntry = { ...ENTRY, images: ["kael-a.webp"] };
    const feed = sseFeed();
    const { calls } = fakeApi({
      "GET /api/models": MODELS,
      [`POST ${PATH}`]: () => ({ status: 200, stream: feed.stream }),
      "GET /api/worlds/salzmark/entries/kael": ok({
        ...entry,
        body: "Anderswo geändert.",
      }),
      "PATCH /api/worlds/salzmark/entries/kael": ok({ ...entry, body: "neu" }),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={entry} editable onChanged={changed} />);
    await user.click(
      screen.getByRole("button", { name: "Bild 1 groß zeigen" }),
    );
    await user.click(
      screen.getByRole("button", { name: "✨ Von der KI beschreiben lassen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Beschreiben lassen" }),
    );
    feed.send("text", { text: "Wettergegerbt." });
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: null,
      finish_reason: "stop",
    });
    feed.close();
    await user.click(
      await screen.findByRole("button", { name: "Übernehmen als „Aussehen“" }),
    );
    await waitFor(() => {
      expect(changed).toHaveBeenCalled();
    });
    expect(calls.at(-1)?.body).toEqual({
      body: "Anderswo geändert.\n\n## Aussehen\n\nWettergegerbt.\n",
    });
  });

  it("takes a map's geography over into the world description", async () => {
    const world = {
      ...WORLD,
      maps: [{ name: "Seekarte", file: "karte-aaaaaaaaaaaa.webp" }],
    };
    const feed = sseFeed();
    const { calls } = fakeApi({
      "GET /api/models": MODELS,
      "POST /api/worlds/salzmark/maps/karte-aaaaaaaaaaaa.webp/describe":
        () => ({
          status: 200,
          stream: feed.stream,
        }),
      "GET /api/worlds": ok([{ ...world, description: "Salz, neu" }]),
      "PATCH /api/worlds/salzmark": ok(world),
    });
    const user = userEvent.setup();
    render(<WorldMaps world={world} onChanged={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Seekarte" }));
    await user.click(
      screen.getByRole("button", { name: "✨ Von der KI beschreiben lassen" }),
    );
    expect(screen.getByText("Geografie – Seekarte")).toBeDefined();
    await user.click(
      await screen.findByRole("button", { name: "Beschreiben lassen" }),
    );
    feed.send("text", { text: "Grauhang liegt im Süden." });
    feed.send("done", {
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: null,
      finish_reason: "stop",
    });
    feed.close();
    await user.click(
      await screen.findByRole("button", {
        name: "In die Weltbeschreibung übernehmen",
      }),
    );
    await waitFor(() => {
      expect(calls.at(-1)?.body).toEqual({
        description:
          "Salz, neu\n\n## Geografie – Seekarte\n\nGrauhang liegt im Süden.\n",
      });
    });
  });
});
