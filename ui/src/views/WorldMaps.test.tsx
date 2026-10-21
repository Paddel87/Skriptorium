import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { created, fakeApi, fail, ok, WORLD } from "../../fake-api";
import type { World } from "../api";
import { shrinkImage } from "../files";
import { WorldMaps } from "./WorldMaps";

vi.mock("../files", () => ({
  MAP_SIDE: 6000,
  shrinkImage: vi.fn(() => Promise.resolve(new Blob(["klein"]))),
  base64: vi.fn(() => Promise.resolve("a2xlaW4=")),
}));

const BASE = `/api/worlds/${WORLD.id}/maps`;
const WITH_MAPS: World = {
  ...WORLD,
  maps: [
    { name: "Die Salzmark", file: "karte-aaaaaaaaaaaa.webp", markers: [] },
    { name: "Hafenviertel", file: "karte-bbbbbbbbbbbb.jpg", markers: [] },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("maps of a world (step 7.10)", () => {
  it("invites to add the first map", () => {
    render(
      <WorldMaps world={WORLD} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    expect(
      screen.getByText(
        "Noch keine Karte – „＋ Karte hinzufügen“ legt die erste an.",
      ),
    ).toBeDefined();
  });

  it("shows the maps as tiles with their names", () => {
    render(
      <WorldMaps world={WITH_MAPS} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    const tile = screen.getByRole("button", { name: "Hafenviertel" });
    expect(tile.querySelector("img")?.getAttribute("src")).toBe(
      `${BASE}/karte-bbbbbbbbbbbb.jpg`,
    );
  });

  it("adds a map: file, name from the file, shrunk to the map size", async () => {
    const after = {
      ...WORLD,
      maps: [
        { name: "Seekarte", file: "karte-cccccccccccc.webp", markers: [] },
      ],
    };
    const { calls } = fakeApi({ [`POST ${BASE}`]: created(after) });
    const changed = vi.fn();
    const user = userEvent.setup();
    render(
      <WorldMaps world={WORLD} onChanged={changed} onOpenEntry={vi.fn()} />,
    );
    await user.click(
      screen.getByRole("button", { name: "＋ Karte hinzufügen" }),
    );
    const save = screen.getByRole("button", { name: "Speichern" });
    expect(save).toHaveProperty("disabled", true);
    await user.upload(
      screen.getByLabelText("Datei"),
      new File(["karte"], "Seekarte.png", { type: "image/png" }),
    );
    expect(screen.getByLabelText("Name")).toHaveProperty("value", "Seekarte");
    await user.click(save);
    await waitFor(() => {
      expect(changed).toHaveBeenCalledWith(after);
    });
    expect(vi.mocked(shrinkImage).mock.calls.at(-1)?.[1]).toBe(6000);
    expect(calls.at(-1)).toEqual({
      method: "POST",
      path: BASE,
      body: { name: "Seekarte", content: "a2xlaW4=" },
    });
  });

  it("shows why a map was refused", async () => {
    fakeApi({ [`POST ${BASE}`]: fail(422, "Bildgröße nicht erlaubt") });
    const user = userEvent.setup();
    render(
      <WorldMaps world={WORLD} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    await user.click(
      screen.getByRole("button", { name: "＋ Karte hinzufügen" }),
    );
    await user.upload(
      screen.getByLabelText("Datei"),
      new File(["x"], "x.png", { type: "image/png" }),
    );
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    expect(await screen.findByText("Bildgröße nicht erlaubt")).toBeDefined();
  });

  it("draws a generated map from the places ticked (step 9.5, ADR-094)", async () => {
    const place = (id: string, name: string, body: string) => ({
      world: WORLD.id,
      id,
      name,
      aliases: [],
      category: "ort" as const,
      status: null,
      body,
      images: [],
    });
    fakeApi({
      [`GET /api/worlds/${WORLD.id}/entries`]: ok([
        place("kerrow", "Kerrow", "## Lage\n\nIm Nordwesten.\n"),
        place("tolm", "Tolm", "Größte Insel."),
        { ...place("kael", "Kael", "Fährmann."), category: "figur" },
      ]),
      "GET /api/images/models": ok({
        default: "x/y",
        models: [{ id: "x/y", name: "Y" }],
        available: true,
        ready: true,
      }),
      "GET /api/images/price": ok({ cost_usd: 0.04, unit: "image" }),
    });
    const user = userEvent.setup();
    render(
      <WorldMaps world={WORLD} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    await user.click(
      screen.getByRole("button", { name: "＋ Karte hinzufügen" }),
    );
    await user.type(screen.getByLabelText("Name"), "Seekarte");
    await user.click(screen.getByRole("button", { name: "✨ Karte erzeugen" }));
    const kerrow = await screen.findByRole("checkbox", { name: "Kerrow" });
    expect(kerrow).toHaveProperty("checked", true);
    expect(screen.queryByRole("checkbox", { name: "Kael" })).toBeNull();
    const description = screen.getByLabelText("Bildbeschreibung (änderbar)");
    expect(description).toHaveProperty(
      "value",
      "Landkarte von Seekarte (Die Salzmark), gezeichnet im Stil einer Fantasy-Karte: Orte – Kerrow: Im Nordwesten. Tolm: Größte Insel.",
    );
    await user.click(kerrow);
    expect(description).toHaveProperty(
      "value",
      "Landkarte von Seekarte (Die Salzmark), gezeichnet im Stil einer Fantasy-Karte: Orte – Tolm: Größte Insel.",
    );
    await user.click(screen.getByRole("button", { name: "keine" }));
    expect(description).toHaveProperty(
      "value",
      "Landkarte von Seekarte (Die Salzmark), gezeichnet im Stil einer Fantasy-Karte",
    );
    await user.click(screen.getByRole("checkbox", { name: "Tolm" }));
    expect(screen.getByRole("checkbox", { name: "Kerrow" })).toHaveProperty(
      "checked",
      false,
    );
    await user.click(screen.getByRole("button", { name: "alle" }));
    expect(screen.getByRole("checkbox", { name: "Kerrow" })).toHaveProperty(
      "checked",
      true,
    );
  });

  it("opens a map large with zoom, renames and removes it", async () => {
    const file = "karte-bbbbbbbbbbbb.jpg";
    const { calls } = fakeApi({
      [`PATCH ${BASE}/${file}`]: ok({
        ...WITH_MAPS,
        maps: [WITH_MAPS.maps[0], { name: "Grauhang", file }],
      }),
      [`DELETE ${BASE}/${file}`]: ok({
        ...WITH_MAPS,
        maps: [WITH_MAPS.maps[0]],
      }),
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const changed = vi.fn();
    const user = userEvent.setup();
    render(
      <WorldMaps world={WITH_MAPS} onChanged={changed} onOpenEntry={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Hafenviertel" }));
    expect(
      screen.getByRole("dialog", { name: "Karte Hafenviertel" }),
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Vergrößern" }));
    await user.click(
      screen.getByRole("button", { name: "Ganze Karte zeigen" }),
    );
    await user.click(screen.getByRole("button", { name: "Umbenennen" }));
    const field = screen.getByLabelText("Name der Karte");
    await user.clear(field);
    await user.type(field, "Grauhang");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    await waitFor(() => {
      expect(calls.at(-1)).toEqual({
        method: "PATCH",
        path: `${BASE}/${file}`,
        body: { name: "Grauhang" },
      });
    });
    await user.click(await screen.findByRole("button", { name: "Entfernen" }));
    await waitFor(() => {
      expect(calls.at(-1)?.method).toBe("DELETE");
    });
    expect(changed).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the large map with Escape", async () => {
    const user = userEvent.setup();
    render(
      <WorldMaps world={WITH_MAPS} onChanged={vi.fn()} onOpenEntry={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Die Salzmark" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
