import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ENTRY, fakeApi, ok, STORY, WORLD } from "../../fake-api";
import type { CanonEntry, StoredImageOrigin, World } from "../api";
import { EntryImages } from "./EntryImages";
import {
  describeBasisPrice,
  ImageGenerate,
  nearestFormat,
  shortLabel,
} from "./ImageGenerate";
import { ImageOriginPanel } from "./ImageOriginPanel";
import { StoryCover } from "./StoryCover";
import { WorldMaps } from "./WorldMaps";

vi.mock("../files", () => ({
  IMAGE_SIDE: 2000,
  MAP_SIDE: 6000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const MODELS = ok({
  default: "bytedance-seed/seedream-4.5",
  models: [
    { id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro", references: 8 },
    { id: "bytedance-seed/seedream-4.5", name: "Seedream 4.5", references: 0 },
    { id: "qwen/qwen-image", name: "Qwen Image", references: 4 },
  ],
  available: true,
  ready: true,
});
const PRICE = ok({
  cost_usd: 0.03,
  unit: "megapixel",
  input_cost_usd: 0.06,
  input_unit: "megapixel",
});
const IMAGE = ok({
  content: "iVBORw0KGgo=",
  media_type: "image/png",
  cost_usd: 0.05,
  model: "black-forest-labs/flux.2-pro",
});
const BASIS = {
  reference: { world: "salzmark", entry: "kael", image: "kael-a.webp" },
  label: "Bild 1 von Kael",
  src: "/bild.webp",
};

afterEach(() => {
  vi.restoreAllMocks();
});

function generate(onTakeOver = vi.fn(() => Promise.resolve())) {
  render(
    <ImageGenerate
      title="Neues Bild aus Bild 1 von Kael"
      initialPrompt=""
      initialFormat="3:2"
      basis={BASIS}
      onTakeOver={onTakeOver}
      onClose={vi.fn()}
    />,
  );
  return onTakeOver;
}

/** Let the thumbnail of the basis report its size, as a browser does once it has loaded. */
function loadBasis(width: number, height: number) {
  const thumbnail = document.querySelector<HTMLImageElement>(
    ".image-generate-basis img",
  );
  if (thumbnail === null) {
    throw new Error("no thumbnail");
  }
  Object.defineProperty(thumbnail, "naturalWidth", {
    value: width,
    configurable: true,
  });
  Object.defineProperty(thumbnail, "naturalHeight", {
    value: height,
    configurable: true,
  });
  fireEvent.load(thumbnail);
}

describe("an image as the basis of a new one (step 9.8, ADR-097)", () => {
  it("offers only models that take a basis and sends the basis along", async () => {
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": PRICE,
      "POST /api/images/generate": IMAGE,
    });
    const user = userEvent.setup();
    const taken = generate();

    expect(screen.getByText("Grundlage")).toBeDefined();
    expect(
      screen.getByText("Bild 1 von Kael · geht mit an das Bildmodell"),
    ).toBeDefined();
    const select = await screen.findByLabelText("Modell");
    expect(
      [...(select as HTMLSelectElement).options].map((o) => o.value),
    ).toEqual(["black-forest-labs/flux.2-pro", "qwen/qwen-image"]);
    // The preset (Seedream) takes no basis, so the first fitting model is chosen.
    expect(select).toHaveProperty("value", "black-forest-labs/flux.2-pro");
    expect(
      await screen.findByText(
        "ca. 0,03 $ je Bild (1 Megapixel) · Grundlage 0,06 $ je Megapixel",
      ),
    ).toBeDefined();
    const field = screen.getByLabelText("Was soll sich ändern?");
    expect(field).toHaveProperty(
      "placeholder",
      "z. B. derselbe Mann im Winter, mit schwerem Wollmantel",
    );
    expect(screen.getByRole("button", { name: "✨ Erzeugen" })).toHaveProperty(
      "disabled",
      true,
    );

    await user.type(field, "Im Winter");
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));

    const sent = calls.find((c) => c.path === "/api/images/generate");
    expect(sent?.body).toEqual({
      model: "black-forest-labs/flux.2-pro",
      prompt: "Im Winter",
      aspect_ratio: "3:2",
      reference: BASIS.reference,
    });
    await waitFor(() => {
      expect(taken).toHaveBeenCalledWith(expect.any(Blob), {
        model: "black-forest-labs/flux.2-pro",
        prompt: "Im Winter",
        aspect_ratio: "3:2",
        cost_usd: 0.05,
        basis: "Bild 1 von Kael",
      });
    });
  });

  it("picks the format of the basis until the author picks one", async () => {
    fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": PRICE,
    });
    const user = userEvent.setup();
    generate();
    const portrait = screen.getByRole("radio", { name: "Hochformat" });

    loadBasis(1000, 1500);
    expect(portrait).toHaveProperty("ariaChecked", "true");

    await user.click(screen.getByRole("radio", { name: "Quadrat" }));
    loadBasis(1600, 900);
    expect(screen.getByRole("radio", { name: "Quadrat" })).toHaveProperty(
      "ariaChecked",
      "true",
    );
    await screen.findByLabelText("Modell");
  });

  it("ignores a thumbnail without size", async () => {
    fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": PRICE,
    });
    generate();

    loadBasis(0, 0);

    expect(screen.getByRole("radio", { name: "Quer" })).toHaveProperty(
      "ariaChecked",
      "true",
    );
    await screen.findByLabelText("Modell");
  });

  it("says so when no model takes a basis", async () => {
    fakeApi({
      "GET /api/images/models": ok({
        default: "a/b",
        models: [{ id: "a/b", name: "B", references: 0 }],
        available: true,
        ready: true,
      }),
    });
    generate();

    expect(
      await screen.findByText(
        "Gerade nimmt kein Bildmodell ein Ausgangsbild an.",
      ),
    ).toBeDefined();
  });

  it("names the price of the basis in every form the providers use", () => {
    const base = { cost_usd: 0.04, unit: "image" };
    expect(describeBasisPrice(base)).toBe(
      "Grundlage: Preis vom Anbieter nicht ausgewiesen",
    );
    expect(
      describeBasisPrice({ ...base, input_cost_usd: 0, input_unit: "image" }),
    ).toBe("Grundlage ohne Aufpreis");
    expect(
      describeBasisPrice({
        ...base,
        input_cost_usd: 0.01,
        input_unit: "image",
      }),
    ).toBe("Grundlage 0,01 $");
    expect(
      describeBasisPrice({
        ...base,
        input_cost_usd: 0.000008,
        input_unit: "token",
      }),
    ).toBe("Grundlage nach Verbrauch");
    expect(
      describeBasisPrice({ ...base, input_cost_usd: 0.01, input_unit: null }),
    ).toBe("Grundlage: Preis vom Anbieter nicht ausgewiesen");
  });

  it("cuts a long description of the basis to what the server keeps", () => {
    expect(shortLabel("Bild 1 von Kael")).toBe("Bild 1 von Kael");
    const long = `Bild 1 von ${"K".repeat(300)}`;
    expect(shortLabel(long)).toHaveLength(200);
    expect(shortLabel(long).endsWith("…")).toBe(true);
    expect(shortLabel("x".repeat(200))).toBe("x".repeat(200));
  });

  it("finds the nearest offered format", () => {
    expect(nearestFormat(1)).toBe("1:1");
    expect(nearestFormat(0.6)).toBe("2:3");
    expect(nearestFormat(16 / 9)).toBe("3:2");
    expect(nearestFormat(1.1)).toBe("1:1");
  });
});

describe("where an image becomes the basis (step 9.8)", () => {
  it("an entry image: from its large view, the result is added as a new image", async () => {
    const entry: CanonEntry = {
      ...ENTRY,
      images: ["kael-a.webp", "kael-b.webp"],
    };
    const after = { ...entry, images: [...entry.images, "kael-c.webp"] };
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": PRICE,
      "POST /api/images/generate": IMAGE,
      "POST /api/worlds/salzmark/entries/kael/images": ok(after),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={entry} editable onChanged={changed} />);

    await user.click(
      screen.getByRole("button", { name: "Bild 2 groß zeigen" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "✨ Als Grundlage für ein neues Bild",
      }),
    );

    expect(
      screen.getByRole("group", { name: "Neues Bild aus Bild 2 von Kael" }),
    ).toBeDefined();
    await user.type(screen.getByLabelText("Was soll sich ändern?"), "Nebel");
    await screen.findByLabelText("Modell");
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(
      calls.find((c) => c.path === "/api/images/generate")?.body,
    ).toMatchObject({
      reference: { world: "salzmark", entry: "kael", image: "kael-b.webp" },
    });
    expect(calls.at(-1)?.body).toMatchObject({
      herkunft: { basis: "Bild 2 von Kael", prompt: "Nebel" },
    });
  });

  it("a map: from its large view, into a new map", async () => {
    const world: World = {
      ...WORLD,
      maps: [
        { name: "Hafenviertel", file: "karte-bbbbbbbbbbbb.jpg", markers: [] },
      ],
    };
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": PRICE,
      "POST /api/images/generate": IMAGE,
    });
    const user = userEvent.setup();
    render(
      <WorldMaps world={world} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Hafenviertel" }));
    await user.click(
      screen.getByRole("button", {
        name: "✨ Als Grundlage für eine neue Karte",
      }),
    );

    expect(
      screen.getByRole("group", {
        name: "Neue Karte aus Karte „Hafenviertel“",
      }),
    ).toBeDefined();
    await user.type(screen.getByLabelText("Was soll sich ändern?"), "Alt");
    await screen.findByLabelText("Modell");
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    await screen.findByRole("button", { name: "Für diese Karte verwenden" });
    expect(
      calls.find((c) => c.path === "/api/images/generate")?.body,
    ).toMatchObject({
      reference: { world: WORLD.id, map_file: "karte-bbbbbbbbbbbb.jpg" },
    });
  });

  it("a cover: the new one replaces it", async () => {
    const story = { ...STORY, cover: "titelbild-aaaaaaaaaaaa.jpg" };
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": PRICE,
      "POST /api/images/generate": IMAGE,
      [`POST /api/worlds/${STORY.world}/stories/${STORY.id}/cover`]: ok(story),
    });
    const saved = vi.fn();
    const user = userEvent.setup();
    render(<StoryCover story={story} onSaved={saved} />);

    await user.click(
      screen.getByRole("button", {
        name: "✨ Als Grundlage für ein neues Titelbild",
      }),
    );
    await user.type(screen.getByLabelText("Was soll sich ändern?"), "Herbst");
    await screen.findByLabelText("Modell");
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    await user.click(
      await screen.findByRole("button", { name: "Als Titelbild übernehmen" }),
    );

    await waitFor(() => {
      expect(saved).toHaveBeenCalledWith(story);
    });
    expect(
      calls.find((c) => c.path === "/api/images/generate")?.body,
    ).toMatchObject({ reference: { world: STORY.world, story: STORY.id } });
    expect(calls.at(-1)?.body).toMatchObject({
      herkunft: { basis: "bisheriges Titelbild" },
    });
  });

  it("the origin names the basis", async () => {
    const origin: StoredImageOrigin = {
      model: "black-forest-labs/flux.2-pro",
      prompt: "Im Winter",
      aspect_ratio: "2:3",
      cost_usd: 0.05,
      date: "2026-10-26T10:00:00+00:00",
      basis: "Bild 1 von Kael",
    };
    const user = userEvent.setup();
    render(<ImageOriginPanel load={() => Promise.resolve(origin)} />);

    await user.click(await screen.findByText("Herkunft"));

    expect(screen.getByText("Grundlage")).toBeDefined();
    expect(screen.getByText("Bild 1 von Kael")).toBeDefined();
  });
});
