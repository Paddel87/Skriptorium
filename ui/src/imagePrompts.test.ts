import { describe, expect, it } from "vitest";
import { ENTRY, STORY, WORLD } from "../fake-api";
import { coverPrompt, entryPrompt, mapPrompt } from "./imagePrompts";

describe("starting texts for generated images (step 7.12)", () => {
  it("takes only a figure's looks; other entries by the start of their text (7.16)", () => {
    const figure = {
      ...ENTRY,
      name: "Gunda",
      body: "Wirtin.\n\n## Aussehen\n\n- **Kräftig**, ergrautes Haar.\n\n## Geheimnis\n\nSchmuggelt.",
    };
    expect(entryPrompt(figure)).toBe("Gunda: Kräftig, ergrautes Haar.");
    expect(
      entryPrompt({ ...ENTRY, body: "# Kael\n\nFährt über den *See*." }),
    ).toBe("Kael");
    expect(
      entryPrompt({
        ...ENTRY,
        category: "ort",
        name: "Kai",
        body: "# Kai\n\nNasse *Bohlen*.",
      }),
    ).toBe("Kai: Nasse Bohlen.");
    expect(entryPrompt({ ...ENTRY, body: "" })).toBe("Kael");
    const listed = {
      ...ENTRY,
      name: "Tomas",
      body: "# Tomas\n\n- **Alter:** 41\n- **Aussehen:** breit, **braune Augen**.\n- **Beruf:** Zöllner",
    };
    expect(entryPrompt(listed)).toBe("Tomas: breit, braune Augen.");
  });

  it("skips an empty template section, takes a duplicate and subsections (step 8.4)", () => {
    const figure = { ...ENTRY, name: "Kael" };
    expect(
      entryPrompt({
        ...figure,
        body: "## Aussehen\n\n## Wesen und Geschichte\nKael hasst seinen Bruder.\n",
      }),
    ).toBe("Kael");
    expect(
      entryPrompt({
        ...figure,
        body: "## Aussehen\n\n## Wesen\nSchmied.\n\n## Aussehen\n\nGroß, graue Augen.\n",
      }),
    ).toBe("Kael: Groß, graue Augen.");
    expect(
      entryPrompt({
        ...figure,
        body: "## Aussehen\nGroß.\n### Kleidung\nGrauer Mantel.\n## Wesen\nSchweigsam.",
      }),
    ).toBe("Kael: Groß. Grauer Mantel.");
  });

  it("cuts long texts at a sentence", () => {
    const long = "Ein Satz über den Hafen. ".repeat(60);
    const prompt = entryPrompt({ ...ENTRY, category: "ort", body: long });
    expect(prompt.length).toBeLessThan(720);
    expect(prompt.endsWith(".")).toBe(true);
  });

  it("draws maps from the world and covers from the story", () => {
    expect(
      mapPrompt({ ...WORLD, description: "Sieben Inseln." }, "Seekarte"),
    ).toBe(
      "Landkarte von Seekarte (Die Salzmark), gezeichnet im Stil einer Fantasy-Karte: Sieben Inseln.",
    );
    expect(mapPrompt(WORLD, " ")).toContain("Landkarte von Die Salzmark");
    expect(coverPrompt({ ...STORY, summary: "Eine Überfahrt im Nebel." })).toBe(
      "Buchumschlag zu „Die Überfahrt“, ohne Schrift: Eine Überfahrt im Nebel.",
    );
  });
});
