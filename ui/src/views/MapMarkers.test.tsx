import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENTRY, fakeApi, ok, WORLD } from "../../fake-api";
import type { CanonEntry, World } from "../api";
import { WorldMaps } from "./WorldMaps";

const FILE = "karte-aaaaaaaaaaaa.webp";
const MARKERS = `PUT /api/worlds/${WORLD.id}/maps/${FILE}/markers`;
const ENTRIES = `GET /api/worlds/${WORLD.id}/entries`;

const KARST: CanonEntry = {
  ...ENTRY,
  id: "karst",
  name: "Karst",
  category: "ort",
  aliases: [],
};
const TIEFMOOR: CanonEntry = { ...KARST, id: "tiefmoor", name: "Tiefmoor" };
const KAEL: CanonEntry = { ...ENTRY };

function worldWith(markers: World["maps"][number]["markers"]): World {
  return { ...WORLD, maps: [{ name: "Festland", file: FILE, markers }] };
}

/** A tap (or the start and end of a drag) on screen coordinates of the 200 × 100 map box. */
function tap(target: Element, x: number, y: number, toX = x, toY = y) {
  fireEvent.pointerDown(target, { clientX: x, clientY: y, isPrimary: true });
  if (toX !== x || toY !== y) {
    fireEvent.pointerMove(target, { clientX: toX, clientY: toY });
  }
  fireEvent.pointerUp(target, { clientX: toX, clientY: toY, isPrimary: true });
}

async function open(world: World, onChanged = vi.fn(), onOpenEntry = vi.fn()) {
  const user = userEvent.setup();
  render(
    <WorldMaps world={world} onChanged={onChanged} onOpenEntry={onOpenEntry} />,
  );
  await user.click(screen.getByRole("button", { name: "Festland" }));
  return user;
}

beforeEach(() => {
  // jsdom has no pointer capture; the browser keeps a dragged point with the pointer.
  HTMLElement.prototype.setPointerCapture = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("markers on maps (step 7.14, ADR-079)", () => {
  it("shows points of existing entries; a tap names them, the name opens the entry", async () => {
    fakeApi({ [ENTRIES]: ok([KARST, KAEL]) });
    const opened = vi.fn();
    const user = await open(
      worldWith([
        { entry: "karst", x: 0.2, y: 0.4 },
        { entry: "geloescht", x: 0.5, y: 0.5 },
      ]),
      vi.fn(),
      opened,
    );
    const point = await screen.findByRole("button", { name: "Karst" });
    expect(point.style.left).toBe("20%");
    expect(point.style.top).toBe("40%");
    expect(screen.queryByRole("button", { name: "geloescht" })).toBeNull();
    expect(screen.queryByText("Karst ›")).toBeNull();
    tap(point, 40, 40);
    await user.click(await screen.findByText("Karst ›"));
    expect(opened).toHaveBeenCalledWith("karst");
    expect(
      screen.getByText("Ort / Geografie · antippen öffnet den Eintrag"),
    ).toBeDefined();
    tap(screen.getByTestId("map-content"), 150, 80);
    expect(screen.queryByText("Karst ›")).toBeNull();
  });

  it("a tap outside the mode sets no point", async () => {
    const { calls } = fakeApi({ [ENTRIES]: ok([KARST]) });
    await open(worldWith([]));
    await screen.findByRole("button", { name: "Markieren" });
    tap(screen.getByTestId("map-content"), 100, 50);
    expect(screen.queryByText("Welcher Eintrag liegt hier?")).toBeNull();
    expect(calls.some((call) => call.method === "PUT")).toBe(false);
  });

  it("sets a point in the mode: tap, search, choose; entries on the map are left out", async () => {
    const after = worldWith([
      { entry: "karst", x: 0.2, y: 0.4 },
      { entry: "tiefmoor", x: 0.25, y: 0.75 },
    ]);
    const { calls } = fakeApi({
      [ENTRIES]: ok([KARST, TIEFMOOR, KAEL]),
      [MARKERS]: ok(after),
    });
    const changed = vi.fn();
    const user = await open(
      worldWith([{ entry: "karst", x: 0.2, y: 0.4 }]),
      changed,
    );
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    expect(screen.getByText(/Tippe auf die Karte/)).toBeDefined();
    tap(screen.getByTestId("map-content"), 50, 75);
    expect(screen.getByText("Welcher Eintrag liegt hier?")).toBeDefined();
    expect(screen.queryByRole("button", { name: /^Karst/ })).not.toBeNull();
    const list = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(list).toEqual(["Tiefmoor · Ort / Geografie", "Kael · Figur"]);
    await user.type(screen.getByPlaceholderText("Name suchen"), "fährmann");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    await user.clear(screen.getByPlaceholderText("Name suchen"));
    await user.type(screen.getByPlaceholderText("Name suchen"), "tief");
    const set = screen.getByRole("button", { name: "Setzen" });
    expect(set).toHaveProperty("disabled", true);
    await user.click(screen.getByRole("button", { name: /Tiefmoor/ }));
    await user.click(set);
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(calls.at(-1)).toEqual({
      method: "PUT",
      path: MARKERS.slice(4),
      body: {
        markers: [
          { entry: "karst", x: 0.2, y: 0.4 },
          { entry: "tiefmoor", x: 0.25, y: 0.75 },
        ],
      },
    });
    expect(screen.queryByText("Welcher Eintrag liegt hier?")).toBeNull();
  });

  it("removes a point and gives one another entry", async () => {
    const { calls } = fakeApi({
      [ENTRIES]: ok([KARST, TIEFMOOR]),
      [MARKERS]: (body) => ({
        status: 200,
        body: worldWith((body as { markers: [] }).markers),
      }),
    });
    const user = await open(
      worldWith([
        { entry: "karst", x: 0.2, y: 0.4 },
        { entry: "tiefmoor", x: 0.8, y: 0.8 },
      ]),
    );
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    tap(screen.getByRole("button", { name: "Karst" }), 40, 40);
    await user.click(screen.getByRole("button", { name: "Anderer Eintrag" }));
    expect(screen.getAllByRole("listitem").map((i) => i.textContent)).toEqual([
      "Karst · Ort / Geografie",
    ]);
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    await user.click(screen.getByRole("button", { name: "Punkt entfernen" }));
    await waitFor(() => {
      expect(calls.at(-1)?.body).toEqual({
        markers: [{ entry: "tiefmoor", x: 0.8, y: 0.8 }],
      });
    });
    await user.click(screen.getByRole("button", { name: "Fertig" }));
    expect(screen.queryByText(/Tippe auf die Karte/)).toBeNull();
  });

  it("drags a point to a new place in the mode", async () => {
    const { calls } = fakeApi({
      [ENTRIES]: ok([KARST]),
      [MARKERS]: (body) => ({
        status: 200,
        body: worldWith((body as { markers: [] }).markers),
      }),
    });
    const user = await open(worldWith([{ entry: "karst", x: 0.2, y: 0.4 }]));
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    tap(screen.getByRole("button", { name: "Karst" }), 40, 40, 150, 90);
    await waitFor(() => {
      expect(calls.at(-1)).toEqual({
        method: "PUT",
        path: MARKERS.slice(4),
        body: { markers: [{ entry: "karst", x: 0.75, y: 0.9 }] },
      });
    });
    expect(screen.queryByText("Welcher Eintrag liegt hier?")).toBeNull();
  });

  it("shows why the entries could not be loaded", async () => {
    fakeApi({});
    await open(worldWith([]));
    expect(await screen.findByText(/kein Fake/)).toBeDefined();
  });
});
