import { describe, expect, it } from "vitest";
import { ENTRY } from "../fake-api";
import type { CanonEntry } from "./api";
import { incomingOf, relationsOf } from "./relations";

const KAEL: CanonEntry = { ...ENTRY };
const MIRA: CanonEntry = { ...ENTRY, id: "mira", name: "Mira", aliases: [] };
const ILKA: CanonEntry = { ...ENTRY, id: "ilka", name: "Ilka", aliases: [] };
const TOMAS: CanonEntry = {
  ...ENTRY,
  id: "tomas-rehl",
  name: "Tomas Rehl",
  aliases: ["Tomas"],
};
const TURM: CanonEntry = {
  ...ENTRY,
  id: "aschturm",
  category: "ort",
  name: "Aschturm",
  aliases: [],
};

function world(...changed: CanonEntry[]): CanonEntry[] {
  return [KAEL, MIRA, ILKA, TOMAS, TURM].map(
    (entry) => changed.find((other) => other.id === entry.id) ?? entry,
  );
}

describe("relations of an entry (step 9.4, ADR-093)", () => {
  it("reads one line with one @Name each from the section „Beziehungen“", () => {
    const body = [
      "Fischerin.",
      "",
      "## Wesen",
      "Kennt @Ilka vom Markt.",
      "",
      "## Beziehungen",
      "- verheiratet mit @Kael",
      "* **ältere Schwester von** @ilka",
      "1. @Tomas Rehl (Gläubiger)",
      "- Kollegin: @Tomas",
      "- @Kaels Mutter, seit Jahren tot.",
      "- @Aschturm",
    ].join("\n");

    expect(relationsOf(body, world()).map((r) => [r.kind, r.entry.id])).toEqual(
      [
        ["verheiratet mit", "kael"],
        ["ältere Schwester von", "ilka"],
        ["Gläubiger", "tomas-rehl"],
        ["Kollegin", "tomas-rehl"],
        ["Mutter, seit Jahren tot", "kael"],
        ["", "aschturm"],
      ],
    );
  });

  it("leaves lines without, with several or unknown names and other sections out", () => {
    const body = [
      "## Beziehungen",
      "Steht allen nahe.",
      "- befreundet mit Kael",
      "- Eltern von @Ilka und @Mira",
      "- verlobt mit @Unbekannt",
      "- Schützling von @der Fährmann",
      "",
      "## Geschichte",
      "- verheiratet mit @Tomas",
    ].join("\n");

    expect(relationsOf(body, world()).map((r) => [r.kind, r.entry.id])).toEqual(
      [["Schützling von", "kael"]],
    );
    expect(relationsOf("Ohne Abschnitte, aber @Kael.", world())).toEqual([]);
  });

  it("keeps brackets inside the kind", () => {
    const body = "### Beziehungen\n- Bruder (verstorben) von @Kael (?)";

    expect(relationsOf(body, world())[0]?.kind).toBe(
      "Bruder (verstorben) von (?)",
    );
  });
});

describe("who refers to an entry (step 9.4, ADR-093)", () => {
  it("lists relations with their kind and other entries naming it", () => {
    const mira = {
      ...MIRA,
      body: "## Beziehungen\n- verheiratet mit @Kael\n- Freundin von @Kael",
    };
    const ilka = { ...ILKA, body: "Fährt mit @Kael. \n\n## Beziehungen\n" };
    const tomas = { ...TOMAS, body: "## Beziehungen\n- Gläubiger von @Mira" };
    const turm = { ...TURM, body: "Hier wohnt @der Fährmann." };
    const kael = { ...KAEL, body: "## Beziehungen\n- Selbst: @Kael" };
    const entries = world(mira, ilka, tomas, turm, kael);

    const incoming = incomingOf(kael, entries);

    expect(incoming.relations.map((r) => [r.from.id, r.kind])).toEqual([
      ["mira", "verheiratet mit"],
      ["mira", "Freundin von"],
    ]);
    expect(incoming.mentions.map((entry) => entry.id)).toEqual([
      "ilka",
      "aschturm",
    ]);
  });

  it("is empty without any", () => {
    expect(incomingOf(KAEL, world())).toEqual({ relations: [], mentions: [] });
  });
});
