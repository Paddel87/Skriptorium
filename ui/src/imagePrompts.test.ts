import { describe, expect, it } from "vitest";
import { ENTRY, STORY, WORLD } from "../fake-api";
import { coverPrompt, entryPrompt, mapPrompt } from "./imagePrompts";

describe("starting texts for generated images (step 7.12)", () => {
  it("takes a figure's section Aussehen, else the start of the entry", () => {
    const figure = {
      ...ENTRY,
      name: "Gunda",
      body: "Wirtin.\n\n## Aussehen\n\n- **Kräftig**, ergrautes Haar.\n\n## Geheimnis\n\nSchmuggelt.",
    };
    expect(entryPrompt(figure)).toBe("Gunda: Kräftig, ergrautes Haar.");
    expect(
      entryPrompt({ ...ENTRY, body: "# Kael\n\nFährt über den *See*." }),
    ).toBe("Kael: Fährt über den See.");
    expect(entryPrompt({ ...ENTRY, body: "" })).toBe("Kael");
    const listed = {
      ...ENTRY,
      name: "Tomas",
      body: "# Tomas\n\n- **Alter:** 41\n- **Aussehen:** breit, **braune Augen**.\n- **Beruf:** Zöllner",
    };
    expect(entryPrompt(listed)).toBe("Tomas: breit, braune Augen.");
  });

  it("cuts long texts at a sentence", () => {
    const long = "Ein Satz über den Hafen. ".repeat(60);
    const prompt = entryPrompt({ ...ENTRY, body: long });
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
