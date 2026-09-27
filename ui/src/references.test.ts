import { describe, expect, it } from "vitest";
import type { CanonEntry } from "./api";
import { menuItems, referencedEntries } from "./references";

function entry(id: string, name: string, aliases: string[] = []): CanonEntry {
  return {
    world: "salzmark",
    id,
    category: "figur",
    name,
    aliases,
    status: null,
    body: "",
  };
}

const KAEL = entry("kael", "Kael", ["der Fährmann"]);
const OLD = entry("kael-der-alte", "Kael der Alte");
const BLADE = entry("runenklinge", "Runenklinge", [""]);
const ENTRIES = [KAEL, OLD, BLADE];

describe("referencedEntries", () => {
  it("finds names and aliases after @, case-insensitive, in order, once", () => {
    expect(
      referencedEntries(
        "@RUNENKLINGE trifft @der fährmann; wieder @Kael.",
        ENTRIES,
      ).map((e) => e.id),
    ).toEqual(["runenklinge", "kael"]);
  });

  it("prefers the longest name", () => {
    expect(
      referencedEntries("@Kael der Alte schweigt", ENTRIES).map((e) => e.id),
    ).toEqual(["kael-der-alte"]);
  });

  it("ignores @ inside a word, longer words and unknown names", () => {
    expect(referencedEntries("mail@Kael @Kaela @Mira @ Kael", ENTRIES)).toEqual(
      [],
    );
  });

  it("accepts a name at the very end and after punctuation", () => {
    expect(referencedEntries("(@Kael)", ENTRIES).map((e) => e.id)).toEqual([
      "kael",
    ]);
    expect(referencedEntries("@Kael", ENTRIES).map((e) => e.id)).toEqual([
      "kael",
    ]);
  });
});

describe("menuItems", () => {
  it("offers every entry by name for a bare @", () => {
    expect(menuItems("", ENTRIES).map((item) => item.label)).toEqual([
      "Kael",
      "Kael der Alte",
      "Runenklinge",
    ]);
  });

  it("matches the start of names and aliases, case-insensitive", () => {
    expect(
      menuItems("KA", ENTRIES).map((item) => [item.label, item.entry.id]),
    ).toEqual([
      ["Kael", "kael"],
      ["Kael der Alte", "kael-der-alte"],
    ]);
    expect(menuItems("der", ENTRIES).map((item) => item.entry.id)).toEqual([
      "kael",
    ]);
    expect(menuItems("Fährmann", ENTRIES)).toEqual([]);
  });
});
