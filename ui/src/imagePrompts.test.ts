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

  it("takes the looks of places and items, else the start of their text (step 8.5)", () => {
    const place = { ...ENTRY, category: "ort" as const, name: "Hafenstadt" };
    expect(
      entryPrompt({
        ...place,
        body: "Gegründet 412 vom Rat.\n\n## Aussehen\n\nWeiße Kalkhäuser am Hang.\n",
      }),
    ).toBe("Hafenstadt: Weiße Kalkhäuser am Hang.");
    expect(
      entryPrompt({
        ...place,
        body: "Gegründet 412 vom Rat.\n\n## Aussehen\n\n## Geschichte\nAlt.",
      }),
    ).toBe("Hafenstadt: Gegründet 412 vom Rat. Alt.");
  });

  it("draws a map only from its own geography, else just the title (step 8.5)", () => {
    const world = {
      ...WORLD,
      description:
        "Magie hängt am Salz.\n\n## Geografie – Bergland\n\nGipfel im Osten.\n\n## Geografie – Seekarte\n\nSieben Inseln.\n",
    };
    expect(mapPrompt(world, "Seekarte")).toBe(
      "Landkarte von Seekarte (Die Salzmark), gezeichnet im Stil einer Fantasy-Karte: Sieben Inseln.",
    );
    expect(mapPrompt(world, "Flusskarte")).toBe(
      "Landkarte von Flusskarte (Die Salzmark), gezeichnet im Stil einer Fantasy-Karte",
    );
    expect(mapPrompt(world, " ")).toBe(
      "Landkarte von Die Salzmark, gezeichnet im Stil einer Fantasy-Karte",
    );
  });

  it("draws a cover from title, genres and atmosphere, never from the plot (step 8.5)", () => {
    const story = { ...STORY, summary: "Kael verrät seinen Bruder." };
    expect(coverPrompt(story)).toBe(
      "Buchumschlag zu „Die Überfahrt“, ohne Schrift",
    );
    expect(
      coverPrompt({
        ...story,
        genres: ["Fantasy", "Abenteuer"],
        writing_style: {
          ...story.writing_style,
          atmosphere: ["neblig", "unheimlich"],
        },
      }),
    ).toBe(
      "Buchumschlag zu „Die Überfahrt“, ohne Schrift: Genre: Fantasy, Abenteuer. Atmosphäre: neblig, unheimlich.",
    );
    expect(
      coverPrompt({
        ...story,
        writing_style: { ...story.writing_style, atmosphere: ["neblig"] },
      }),
    ).toBe(
      "Buchumschlag zu „Die Überfahrt“, ohne Schrift: Atmosphäre: neblig.",
    );
  });
});
