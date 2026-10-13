import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { created, ENTRY, fail, fakeApi, ok, WORLD } from "../../fake-api";
import type { CanonEntry, World } from "../api";
import { WorldMaps } from "./WorldMaps";

vi.mock("../files", () => ({
  IMAGE_SIDE: 2000,
  MAP_SIDE: 6000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const FILE = "karte-aaaaaaaaaaaa.webp";
const BASE = `/api/worlds/${WORLD.id}/maps`;
const MARKERS = `PUT ${BASE}/${FILE}/markers`;
const ENTRIES = `GET /api/worlds/${WORLD.id}/entries`;
const KARST: CanonEntry = {
  ...ENTRY,
  id: "karst",
  name: "Karst",
  category: "ort",
  aliases: [],
};

function worldWith(markers: World["maps"][number]["markers"]): World {
  return { ...WORLD, maps: [{ name: "Festland", file: FILE, markers }] };
}

function box(width: number, height: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width,
    height,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

async function open(world: World, onChanged = vi.fn()) {
  const user = userEvent.setup();
  const view = render(
    <WorldMaps world={world} onChanged={onChanged} onOpenEntry={vi.fn()} />,
  );
  await user.click(screen.getByRole("button", { name: "Festland" }));
  return { user, view };
}

beforeEach(() => {
  HTMLElement.prototype.setPointerCapture = vi.fn();
  box(200, 100);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("zoom and fit of the open map (step 7.10)", () => {
  function sizes(room: [number, number], image: [number, number]) {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
      room[0],
    );
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
      room[1],
    );
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(
      image[0],
    );
    vi.spyOn(
      HTMLImageElement.prototype,
      "naturalHeight",
      "get",
    ).mockReturnValue(image[1]);
  }

  it("gives the box the shape of a wide and of a tall image", async () => {
    fakeApi({ [ENTRIES]: ok([]) });
    sizes([400, 200], [300, 100]);
    await open(worldWith([]));
    const image = screen.getByAltText("Festland");
    fireEvent.load(image);
    const content = screen.getByTestId("map-content");
    expect(content.style.width).toBe("400px");
    expect(Math.round(parseFloat(content.style.height))).toBe(133);
    sizes([400, 200], [100, 300]);
    fireEvent.load(image);
    expect(Math.round(parseFloat(content.style.width))).toBe(67);
    expect(content.style.height).toBe("200px");
  });

  it("keeps the box while the image or the room has no size", async () => {
    fakeApi({ [ENTRIES]: ok([]) });
    sizes([400, 200], [0, 0]);
    await open(worldWith([]));
    const content = screen.getByTestId("map-content");
    fireEvent.load(screen.getByAltText("Festland"));
    expect(content.style.width).toBe("");
    sizes([0, 0], [300, 100]);
    fireEvent.load(screen.getByAltText("Festland"));
    expect(content.style.width).toBe("");
  });

  it("measures again when the window or the stage changes size", async () => {
    fakeApi({ [ENTRIES]: ok([]) });
    let notify: () => void = () => undefined;
    const disconnect = vi.fn();
    class Watcher {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    }
    vi.stubGlobal("ResizeObserver", Watcher);
    sizes([400, 200], [300, 100]);
    const { view } = await open(worldWith([]));
    const content = screen.getByTestId("map-content");
    expect(content.style.width).toBe("");
    fireEvent(window, new Event("resize"));
    expect(content.style.width).toBe("400px");
    sizes([200, 200], [300, 100]);
    notify();
    await waitFor(() => {
      expect(content.style.width).toBe("200px");
    });
    view.unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it("keeps points at their size while zooming and reacts to the wheel", async () => {
    fakeApi({ [ENTRIES]: ok([]) });
    await open(worldWith([]));
    const content = screen.getByTestId("map-content");
    content.dispatchEvent(
      new CustomEvent("panzoomchange", { detail: { scale: 4 } }),
    );
    expect(content.style.getPropertyValue("--marker-scale")).toBe("0.25");
    fireEvent.wheel(content.parentElement as HTMLElement, { deltaY: -100 });
  });
});

describe("marking and changing a map (steps 7.10, 7.14)", () => {
  function tap(
    target: Element,
    x: number,
    y: number,
    primary = true,
    up = primary,
  ) {
    fireEvent.pointerDown(target, {
      clientX: x,
      clientY: y,
      isPrimary: primary,
    });
    fireEvent.pointerUp(target, { clientX: x, clientY: y, isPrimary: up });
  }

  it("ignores a second finger and a map without a size", async () => {
    fakeApi({ [ENTRIES]: ok([KARST]) });
    const { user } = await open(worldWith([]));
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    const content = screen.getByTestId("map-content");
    tap(content, 50, 50, false);
    expect(screen.queryByText("Welcher Eintrag liegt hier?")).toBeNull();
    box(0, 0);
    tap(content, 50, 50);
    expect(screen.queryByText("Welcher Eintrag liegt hier?")).toBeNull();
  });

  it("selects a point outside the mode and hides its name with a second tap", async () => {
    fakeApi({ [ENTRIES]: ok([KARST]) });
    await open(worldWith([{ entry: "karst", x: 0.2, y: 0.4 }]));
    const point = await screen.findByRole("button", { name: "Karst" });
    tap(point, 40, 40);
    expect(screen.queryByText("Karst ›")).not.toBeNull();
    tap(point, 40, 40);
    expect(screen.queryByText("Karst ›")).toBeNull();
  });

  it("keeps the picker when the point could not be saved", async () => {
    fakeApi({
      [ENTRIES]: ok([KARST]),
      [MARKERS]: fail(422, "Zu viele Punkte"),
    });
    const { user } = await open(worldWith([]));
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    tap(screen.getByTestId("map-content"), 50, 50);
    await user.click(screen.getByRole("button", { name: /Karst/ }));
    await user.click(screen.getByRole("button", { name: "Setzen" }));
    expect(await screen.findByText("Zu viele Punkte")).toBeDefined();
    expect(screen.queryByText("Welcher Eintrag liegt hier?")).not.toBeNull();
  });

  it("gives a point another entry", async () => {
    const after = worldWith([{ entry: "karst", x: 0.2, y: 0.4 }]);
    const { calls } = fakeApi({
      [ENTRIES]: ok([KARST, { ...KARST, id: "tiefmoor", name: "Tiefmoor" }]),
      [MARKERS]: ok(after),
    });
    const changed = vi.fn();
    const { user } = await open(
      worldWith([{ entry: "tiefmoor", x: 0.2, y: 0.4 }]),
      changed,
    );
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    tap(screen.getByRole("button", { name: "Tiefmoor" }), 40, 40);
    await user.click(screen.getByRole("button", { name: "Anderer Eintrag" }));
    await user.click(screen.getByRole("button", { name: /Karst/ }));
    await user.click(screen.getByRole("button", { name: "Setzen" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(calls.at(-1)?.body).toEqual({
      markers: [{ entry: "karst", x: 0.2, y: 0.4 }],
    });
  });

  it("opens the name of a point towards the middle near an edge", async () => {
    fakeApi({
      [ENTRIES]: ok([KARST, { ...KARST, id: "tiefmoor", name: "T" }]),
    });
    await open(
      worldWith([
        { entry: "karst", x: 0.1, y: 0.4 },
        { entry: "tiefmoor", x: 0.9, y: 0.4 },
      ]),
    );
    tap(await screen.findByRole("button", { name: "Karst" }), 20, 40);
    expect(screen.getByText("Karst ›").closest("button")?.className).toContain(
      "start",
    );
    tap(screen.getByRole("button", { name: "T" }), 180, 40);
    expect(screen.getByText("T ›").closest("button")?.className).toContain(
      "end",
    );
  });

  it("treats a small move of a point as a tap and ignores a drag onto a map without size", async () => {
    const { calls } = fakeApi({ [ENTRIES]: ok([KARST]) });
    const { user } = await open(
      worldWith([{ entry: "karst", x: 0.2, y: 0.4 }]),
    );
    await user.click(await screen.findByRole("button", { name: "Markieren" }));
    const point = screen.getByRole("button", { name: "Karst" });
    fireEvent.pointerDown(point, { clientX: 40, clientY: 40, isPrimary: true });
    fireEvent.pointerMove(point, { clientX: 42, clientY: 41 });
    fireEvent.pointerUp(point, { clientX: 42, clientY: 41, isPrimary: true });
    expect(
      screen.queryByRole("button", { name: "Punkt entfernen" }),
    ).not.toBeNull();
    box(0, 0);
    fireEvent.pointerDown(point, { clientX: 40, clientY: 40, isPrimary: true });
    fireEvent.pointerMove(point, { clientX: 90, clientY: 90 });
    fireEvent.pointerUp(point, { clientX: 90, clientY: 90, isPrimary: true });
    expect(calls.some((call) => call.method === "PUT")).toBe(false);
  });

  it("does not set the entries or an error after the map was closed", async () => {
    for (const routes of [{ [ENTRIES]: ok([KARST]) }, {}]) {
      fakeApi(routes);
      const view = render(
        <WorldMaps
          world={worldWith([])}
          onChanged={vi.fn()}
          onOpenEntry={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Festland" }));
      view.unmount();
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  });

  it("keeps the name when renaming is cancelled", async () => {
    fakeApi({ [ENTRIES]: ok([]) });
    const { user } = await open(worldWith([]));
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    const field = screen.getByLabelText("Name der Karte");
    await user.clear(field);
    expect(screen.getByRole("button", { name: "Speichern" })).toHaveProperty(
      "disabled",
      true,
    );
    await user.type(field, "Anders");
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    expect(screen.getByLabelText("Name der Karte")).toHaveProperty(
      "value",
      "Festland",
    );
  });

  it("shows why a rename or a removal failed and keeps the map open", async () => {
    fakeApi({
      [ENTRIES]: ok([]),
      [`PATCH ${BASE}/${FILE}`]: fail(422, "Name schon vergeben"),
      [`DELETE ${BASE}/${FILE}`]: fail(500, "Löschen gescheitert"),
    });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = await open(worldWith([]));
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    expect(screen.queryByText("Löschen gescheitert")).toBeNull();
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Entfernen" }));
    expect(await screen.findByText("Löschen gescheitert")).toBeDefined();
    expect(screen.queryByRole("dialog")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Name schon vergeben")).toBeDefined();
    expect(screen.queryByLabelText("Name der Karte")).not.toBeNull();
  });

  it("closes with the button and leaves a field on Escape without closing", async () => {
    fakeApi({ [ENTRIES]: ok([]) });
    const { user } = await open(worldWith([]));
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    await user.type(screen.getByLabelText("Name der Karte"), "{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    await user.click(screen.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("adding a map by generating it (steps 7.10, 7.12)", () => {
  const MODELS = ok({
    default: "black-forest-labs/flux.2-pro",
    models: [{ id: "black-forest-labs/flux.2-pro", name: "FLUX.2 Pro" }],
    available: true,
    ready: true,
  });

  it("takes a generated map over, names it after the world and saves it", async () => {
    const after = worldWith([]);
    const { calls } = fakeApi({
      "GET /api/images/models": MODELS,
      "GET /api/images/price": ok({ cost_usd: 0.03, unit: "image" }),
      "POST /api/images/generate": ok({
        content: "iVBORw0KGgo=",
        media_type: "image/png",
        cost_usd: 0.03,
        model: "black-forest-labs/flux.2-pro",
      }),
      [`POST ${BASE}`]: created(after),
    });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(
      <WorldMaps world={WORLD} onChanged={changed} onOpenEntry={vi.fn()} />,
    );
    await user.click(
      screen.getByRole("button", { name: "＋ Karte hinzufügen" }),
    );
    await user.click(screen.getByRole("button", { name: "✨ Karte erzeugen" }));
    await user.click(
      await screen.findByRole("button", { name: "✨ Erzeugen" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Für diese Karte verwenden" }),
    );
    expect(await screen.findByText("Erzeugte Karte ist bereit.")).toBeDefined();
    expect(screen.getByLabelText("Name")).toHaveProperty("value", WORLD.name);
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(calls.at(-1)?.method).toBe("POST");
  });

  it("keeps a typed name, drops a cleared file and can be cancelled", async () => {
    fakeApi({});
    const user = userEvent.setup();
    render(
      <WorldMaps world={WORLD} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    await user.click(
      screen.getByRole("button", { name: "＋ Karte hinzufügen" }),
    );
    await user.type(screen.getByLabelText("Name"), "Eigener Name");
    await user.upload(
      screen.getByLabelText("Datei"),
      new File(["x"], "Datei.png", { type: "image/png" }),
    );
    expect(screen.getByLabelText("Name")).toHaveProperty(
      "value",
      "Eigener Name",
    );
    fireEvent.change(screen.getByLabelText("Datei"), {
      target: { files: [] },
    });
    expect(screen.getByRole("button", { name: "Speichern" })).toHaveProperty(
      "disabled",
      true,
    );
    fireEvent.submit(screen.getByLabelText("Name").closest("form") as Element);
    await user.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(screen.queryByLabelText("Name")).toBeNull();
  });
});
