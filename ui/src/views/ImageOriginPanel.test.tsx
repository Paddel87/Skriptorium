import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ENTRY,
  fakeApi,
  ok,
  STORY,
  WORLD,
  withoutOrigins,
} from "../../fake-api";
import {
  formatCost,
  type CanonEntry,
  type Story,
  type StoredImageOrigin,
  type World,
} from "../api";
import { EntryImages } from "./EntryImages";
import { ImageOriginPanel, seedOf } from "./ImageOriginPanel";
import { StoryCover } from "./StoryCover";
import { WorldMaps } from "./WorldMaps";

vi.mock("../files", () => ({
  IMAGE_SIDE: 2000,
  MAP_SIDE: 6000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const ORIGIN: StoredImageOrigin = {
  model: "x/zwei",
  prompt: "Kael am Salzhafen, Abendlicht",
  aspect_ratio: "3:2",
  cost_usd: 0.04,
  date: "2026-10-25T18:00:00+00:00",
};
const IMAGE_ROUTES = {
  "GET /api/images/models": ok({
    default: "x/eins",
    models: [
      { id: "x/eins", name: "Eins" },
      { id: "x/zwei", name: "Zwei" },
    ],
    available: true,
    ready: true,
  }),
  "GET /api/images/price": ok({ cost_usd: 0.04, unit: "image" }),
  "POST /api/images/generate": ok({
    content: "iVBORw0KGgo=",
    media_type: "image/png",
    cost_usd: 0.05,
    model: "x/zwei",
  }),
};

beforeEach(() => {
  HTMLElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("origin of a generated image (step 9.6, ADR-095)", () => {
  it("shows model, date, cost and description folded away", async () => {
    const regenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <ImageOriginPanel
        load={() => Promise.resolve(ORIGIN)}
        onRegenerate={regenerate}
      />,
    );
    await user.click(await screen.findByText("Herkunft"));
    expect(screen.getByText("x/zwei")).toBeDefined();
    expect(screen.getByText(formatCost(0.04))).toBeDefined();
    expect(screen.getByText(ORIGIN.prompt)).toBeDefined();
    expect(screen.getByText(/2026/)).toBeDefined();
    await user.click(
      screen.getByRole("button", {
        name: "✨ Mit dieser Anweisung neu erzeugen",
      }),
    );
    expect(regenerate).toHaveBeenCalledWith(ORIGIN);
  });

  it("shows nothing for an uploaded image", async () => {
    const load = vi.fn(() => Promise.resolve(null));
    const { container } = render(<ImageOriginPanel load={load} />);
    await waitFor(() => {
      expect(load).toHaveBeenCalledOnce();
    });
    expect(container.innerHTML).toBe("");
  });

  it("names a missing cost and an unreadable date, without the button when not offered", async () => {
    render(
      <ImageOriginPanel
        load={() =>
          Promise.resolve({ ...ORIGIN, cost_usd: null, date: "gestern" })
        }
      />,
    );
    expect(await screen.findByText("nicht gemeldet")).toBeDefined();
    expect(screen.getByText("gestern")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("says when the origin could not be read", async () => {
    render(
      <ImageOriginPanel load={() => Promise.reject(new Error("kaputt"))} />,
    );
    expect(await screen.findByText(/Herkunft nicht lesbar/)).toBeDefined();
  });

  it("starts anew with the stored format, or the usual one if not offered", () => {
    expect(seedOf(ORIGIN, "2:3")).toEqual({
      prompt: ORIGIN.prompt,
      format: "3:2",
      model: "x/zwei",
    });
    expect(seedOf({ ...ORIGIN, aspect_ratio: "16:9" }, "2:3").format).toBe(
      "2:3",
    );
  });

  it("generates an entry image anew from the origin of another", async () => {
    const entry: CanonEntry = { ...ENTRY, images: ["kael-a.webp"] };
    const images = `/api/worlds/${ENTRY.world}/entries/${ENTRY.id}/images`;
    const after = { ...entry, images: ["kael-a.webp", "kael-b.webp"] };
    const { calls } = fakeApi({
      ...IMAGE_ROUTES,
      [`GET ${images}/kael-a.webp/origin`]: ok(ORIGIN),
      [`POST ${images}`]: ok(after),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(<EntryImages entry={entry} editable onChanged={changed} />);
    await user.click(screen.getByRole("button", { name: "Kael, Hauptbild" }));
    await user.click(await screen.findByText("Herkunft"));
    await user.click(
      screen.getByRole("button", {
        name: "✨ Mit dieser Anweisung neu erzeugen",
      }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByLabelText("Bildbeschreibung (änderbar)")).toHaveProperty(
      "value",
      ORIGIN.prompt,
    );
    expect(
      screen.getByRole("radio", { name: "Quer" }).getAttribute("aria-checked"),
    ).toBe("true");
    await waitFor(() => {
      expect(screen.getByLabelText("Modell")).toHaveProperty("value", "x/zwei");
    });
    await user.click(screen.getByRole("button", { name: "✨ Erzeugen" }));
    await user.click(await screen.findByRole("button", { name: "Übernehmen" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(withoutOrigins(calls).at(-1)?.body).toEqual({
      content: "a2xlaW4=",
      herkunft: {
        model: "x/zwei",
        prompt: ORIGIN.prompt,
        aspect_ratio: "3:2",
        cost_usd: 0.05,
      },
    });
  });

  it("stores a generated map with its origin and generates one anew from it", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ width: 200, height: 100 }),
    );
    const file = "karte-aaaaaaaaaaaa.webp";
    const maps = `/api/worlds/${WORLD.id}/maps`;
    const world: World = {
      ...WORLD,
      maps: [{ name: "Festland", file, markers: [] }],
    };
    const { calls } = fakeApi({
      ...IMAGE_ROUTES,
      [`GET /api/worlds/${WORLD.id}/entries`]: ok([]),
      [`GET ${maps}/${file}/origin`]: ok(ORIGIN),
      [`POST ${maps}`]: ok(world),
    });
    const user = userEvent.setup();
    render(
      <WorldMaps world={world} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Festland" }));
    await user.click(await screen.findByText("Herkunft"));
    await user.click(
      screen.getByRole("button", {
        name: "✨ Mit dieser Anweisung neu erzeugen",
      }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("group", { name: "Karte erzeugen" })).toBeDefined();
    expect(screen.getByLabelText("Bildbeschreibung (änderbar)")).toHaveProperty(
      "value",
      ORIGIN.prompt,
    );
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Für diese Karte verwenden" }),
    );
    expect(screen.getByText("Erzeugte Karte ist bereit.")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(withoutOrigins(calls).at(-1)?.method).toBe("POST");
    });
    expect(withoutOrigins(calls).at(-1)?.body).toMatchObject({
      herkunft: { model: "x/zwei", prompt: ORIGIN.prompt, cost_usd: 0.05 },
    });
  });

  it("shows the origin of a cover and generates one anew from it", async () => {
    const story: Story = { ...STORY, cover: "titelbild-aaaaaaaaaaaa.jpg" };
    fakeApi({
      ...IMAGE_ROUTES,
      [`GET /api/worlds/${STORY.world}/stories/${STORY.id}/cover/origin`]: ok({
        ...ORIGIN,
        aspect_ratio: "2:3",
      }),
    });
    const user = userEvent.setup();
    render(<StoryCover story={story} onSaved={vi.fn()} />);
    await user.click(await screen.findByText("Herkunft"));
    await user.click(
      screen.getByRole("button", {
        name: "✨ Mit dieser Anweisung neu erzeugen",
      }),
    );
    expect(
      screen.getByRole("group", { name: "Titelbild erzeugen" }),
    ).toBeDefined();
    expect(screen.getByLabelText("Bildbeschreibung (änderbar)")).toHaveProperty(
      "value",
      ORIGIN.prompt,
    );
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(
      screen.queryByRole("group", { name: "Titelbild erzeugen" }),
    ).toBeNull();
  });
});
