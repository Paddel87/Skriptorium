import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ENTRY, fail, fakeApi, ok } from "../../fake-api";
import type { CanonEntry } from "../api";
import { EntryImages } from "./EntryImages";
import { describePrice, ImageGenerate } from "./ImageGenerate";

vi.mock("../files", () => ({
  IMAGE_SIDE: 2000,
  MAP_SIDE: 6000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const MODELS = ok({
  default: "black-forest-labs/flux.2-pro",
  models: [
    { id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro" },
    { id: "bytedance-seed/seedream-4.5", name: "Seedream 4.5" },
  ],
  available: true,
  ready: true,
});
const PRICE = "GET /api/images/price";
const IMAGE = ok({
  content: "iVBORw0KGgo=",
  media_type: "image/png",
  cost_usd: 0.031,
  model: "black-forest-labs/flux.2-pro",
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generating an image (step 7.12)", () => {
  it("shows the price, generates a preview and hands the image over", async () => {
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.03, unit: "megapixel" }),
      "POST /api/images/generate": IMAGE,
    });
    const taken = vi.fn(() => Promise.resolve());
    const closed = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageGenerate
        title="Bild erzeugen – Gunda"
        initialPrompt="Gunda: kräftig"
        initialFormat="2:3"
        onTakeOver={taken}
        onClose={closed}
      />,
    );
    expect(
      await screen.findByText("ca. 0,03 $ je Bild (1 Megapixel)"),
    ).toBeDefined();
    expect(screen.getByRole("radio", { name: "Hochformat" })).toHaveProperty(
      "ariaChecked",
      "true",
    );
    await user.type(
      screen.getByLabelText("Bildbeschreibung (änderbar)"),
      ", Schürze",
    );
    await user.click(screen.getByRole("radio", { name: "Quadrat" }));
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    expect(
      await screen.findByAltText("Vorschau des erzeugten Bildes"),
    ).toBeDefined();
    expect(calls.find((c) => c.method === "POST")?.body).toEqual({
      model: "black-forest-labs/flux.2-pro",
      prompt: "Gunda: kräftig, Schürze",
      aspect_ratio: "1:1",
    });
    expect(screen.getByText("FLUX.2 Pro · Kosten 0,031 $")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(taken).toHaveBeenCalled();
    });
    const blob = (taken.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("image/png");
    expect(closed).toHaveBeenCalled();
  });

  it("shows a refusal and lets the author try again", async () => {
    fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.04, unit: "image" }),
      "POST /api/images/generate": fail(
        422,
        "Das Modell hat das Bild abgelehnt.",
      ),
    });
    const user = userEvent.setup();
    render(
      <ImageGenerate
        title="Bild"
        initialPrompt="x"
        initialFormat="1:1"
        onTakeOver={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    expect(
      await screen.findByText("Das Modell hat das Bild abgelehnt."),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "✨ Erzeugen" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("names prices by their unit", () => {
    expect(describePrice(null)).toBe("Preis wird geladen …");
    expect(describePrice({ cost_usd: 0.04, unit: "image" })).toBe(
      "ca. 0,04 $ je Bild",
    );
    expect(describePrice({ cost_usd: 8e-6, unit: "token" })).toMatch(
      /nach Verbrauch/,
    );
    expect(describePrice({ cost_usd: null, unit: null })).toBe(
      "Preis unbekannt",
    );
  });

  it("is offered next to uploading in the gallery and stores the image there", async () => {
    const entry: CanonEntry = { ...ENTRY, body: "## Aussehen\n\nHager." };
    const after = { ...entry, images: ["kael-a.webp"] };
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      [PRICE]: ok({ cost_usd: 0.03, unit: "megapixel" }),
      "POST /api/images/generate": IMAGE,
      "POST /api/worlds/salzmark/entries/kael/images": ok(after),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={entry} editable onChanged={changed} />);
    await user.click(screen.getByRole("button", { name: "Bild hinzufügen" }));
    await user.click(
      screen.getByRole("menuitem", { name: "✨ Bild erzeugen" }),
    );
    expect(screen.getByLabelText("Bildbeschreibung (änderbar)")).toHaveProperty(
      "value",
      "Kael: Hager.",
    );
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(calls.at(-1)?.body).toEqual({ content: "a2xlaW4=" });
  });
});
