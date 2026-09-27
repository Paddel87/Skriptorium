import { describe, expect, it } from "vitest";
import { ENTRY } from "../fake-api";
import {
  appendParagraph,
  mentionedEntry,
  oneLine,
  suggestFact,
} from "./canonFact";

const KAEL = ENTRY;
const KAEL_OLD = {
  ...ENTRY,
  id: "kael-der-alte",
  name: "Kael der Alte",
  aliases: [],
};
const BLADE = {
  ...ENTRY,
  id: "runenklinge",
  category: "gegenstand" as const,
  name: "Runenklinge",
  aliases: ["Klinge"],
};

describe("suggestFact (step 3.8)", () => {
  it("suggests the entry named in a sentence, the passage as text", () => {
    expect(
      suggestFact(" Die Runenklinge glüht, wenn Kael lügt. ", [KAEL, BLADE]),
    ).toEqual({
      entry: BLADE,
      name: "",
      body: "Die Runenklinge glüht, wenn Kael lügt.",
    });
  });

  it("takes a short passage as the name of a new entry", () => {
    expect(suggestFact("„Salzturm von Ivra“,", [KAEL])).toEqual({
      entry: null,
      name: "Salzturm von Ivra",
      body: "",
    });
  });

  it("keeps a passage over several lines as text", () => {
    expect(suggestFact("Der Hafen\nliegt im Norden", [])).toEqual({
      entry: null,
      name: "",
      body: "Der Hafen\nliegt im Norden",
    });
  });

  it("does not name an entry after punctuation only", () => {
    expect(suggestFact(" … ", [])).toEqual({
      entry: null,
      name: "",
      body: "…",
    });
  });
});

describe("mentionedEntry", () => {
  it("finds names and aliases as whole words, case-insensitive", () => {
    expect(mentionedEntry("Er zog die KLINGE.", [KAEL, BLADE])).toBe(BLADE);
    expect(mentionedEntry("der fährmann schwieg", [KAEL])).toBe(KAEL);
    expect(mentionedEntry("Kaelion kam", [KAEL])).toBeNull();
    expect(mentionedEntry("Sie rief Kael2", [KAEL])).toBeNull();
  });

  it("prefers the first mention, then the longest name", () => {
    expect(mentionedEntry("Kael zog die Runenklinge", [BLADE, KAEL])).toBe(
      KAEL,
    );
    expect(mentionedEntry("Kael der Alte schwieg", [KAEL, KAEL_OLD])).toBe(
      KAEL_OLD,
    );
    expect(
      mentionedEntry("Kael schwieg, Kaelion nicht", [KAEL_OLD, KAEL]),
    ).toBe(KAEL);
  });

  it("finds a later whole-word mention after a partial one", () => {
    expect(mentionedEntry("Kaelion rief Kael", [KAEL])).toBe(KAEL);
  });

  it("ignores empty aliases", () => {
    expect(mentionedEntry("irgendwas", [{ ...KAEL, aliases: [""] }])).toBe(
      null,
    );
  });
});

describe("appendParagraph and oneLine", () => {
  it("appends a paragraph at the end", () => {
    expect(appendParagraph("Fährt über den See.\n", " Hat Angst. ")).toBe(
      "Fährt über den See.\n\nHat Angst.",
    );
    expect(appendParagraph("  ", "Hat Angst.")).toBe("Hat Angst.");
  });

  it("puts a story fact on one line", () => {
    expect(oneLine("  Hat\n\nAngst  vor Wasser ")).toBe("Hat Angst vor Wasser");
  });
});
