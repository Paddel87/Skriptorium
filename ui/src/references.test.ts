import { describe, expect, it } from "vitest";
import type { CanonEntry } from "./api";
import {
  acceptSuggestion,
  mentionRanges,
  menuItems,
  referencedEntries,
  suggestions,
} from "./references";

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

describe("referencedEntries with a genitive s (step 5.23)", () => {
  const TOWER = entry("aschturm", "Aschturm", ["Turm"]);
  const KAELS = entry("kaels", "Kaels");
  const MARKUS = entry("markus", "Markus");

  it("accepts a name or alias followed by a genitive s", () => {
    expect(
      referencedEntries(
        "@Kaels Hammer liegt vor @Aschturms Tor; @der Fährmanns Boot, @Turms.",
        [KAEL, TOWER],
      ).map((e) => e.id),
    ).toEqual(["kael", "aschturm"]);
  });

  it("does not accept other endings or a longer word", () => {
    expect(
      referencedEntries("@Kaela @Kaelsa @Kaelen @KaelS", [KAEL]).map(
        (e) => e.id,
      ),
    ).toEqual([]);
  });

  it("prefers an entry whose name itself ends in s", () => {
    expect(
      referencedEntries("@Kaels kommt", [KAEL, KAELS]).map((e) => e.id),
    ).toEqual(["kaels"]);
    expect(
      referencedEntries("@Markus geht", [MARKUS]).map((e) => e.id),
    ).toEqual(["markus"]);
  });

  it("marks the s as part of the mention", () => {
    const text = "Vor @Aschturms Tor.";
    expect(
      mentionRanges(text, [TOWER]).map((m) => text.slice(m.from, m.to)),
    ).toEqual(["@Aschturms"]);
  });
});

describe("mentionRanges", () => {
  it("gives every recognised mention with its place, repeats included (step 5.18)", () => {
    const text = "@Kael der Alte ruft @kael; mail@Kael @Mira, wieder @Kael.";
    expect(
      mentionRanges(text, ENTRIES).map((m) => [
        text.slice(m.from, m.to),
        m.entry.id,
      ]),
    ).toEqual([
      ["@Kael der Alte", "kael-der-alte"],
      ["@kael", "kael"],
      ["@Kael", "kael"],
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

describe("suggestions (step 5.1, FR-014)", () => {
  const TOMAS = entry("tomas-rehl", "Tomas Rehl", ["Tomas", "Rehl"]);
  const ALL = [...ENTRIES, TOMAS];
  const found = (text: string) =>
    suggestions(text, ALL).map((s) => [s.word, s.entry.id, s.from]);

  it("finds names and aliases without @ as whole words, longest first, once each", () => {
    expect(
      found("tomas sieht Kael der Alte und den Fährmann; Kael nickt."),
    ).toEqual([
      ["tomas", "tomas-rehl", 0],
      ["Kael der Alte", "kael-der-alte", 12],
      // „den Fährmann“ is not the alias „der Fährmann“; the later „Kael“ is.
      ["Kael", "kael", 44],
    ]);
    expect(found("Der Fährmann wartet.")).toEqual([
      ["Der Fährmann", "kael", 0],
    ]);
  });

  it("takes a genitive s, but no longer words or names inside other words", () => {
    expect(found("Kaels Boot")).toEqual([["Kaels", "kael", 0]]);
    expect(found("Kaelin und Rehlinger, xTomas")).toEqual([]);
  });

  it("leaves out entries named with @ and words inside an @ mention", () => {
    expect(found("@Tomas Rehl grüßt Tomas und Kael.")).toEqual([
      ["Kael", "kael", 28],
    ]);
    expect(found("@Kael und Kael")).toEqual([]);
  });

  it("turns the first mention of the chosen entry into an @ mention", () => {
    const text = "Tomas, Kael und noch einmal Tomas.";
    expect(acceptSuggestion(text, ALL, TOMAS)).toBe(
      "@Tomas, Kael und noch einmal Tomas.",
    );
    expect(acceptSuggestion("Kael allein.", ALL, TOMAS)).toBe("Kael allein.");
    expect(
      referencedEntries(acceptSuggestion(text, ALL, KAEL), ALL).map(
        (e) => e.id,
      ),
    ).toEqual(["kael"]);
  });
});
