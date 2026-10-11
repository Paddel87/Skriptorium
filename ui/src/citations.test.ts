import { describe, expect, it } from "vitest";
import { sourceLabel, withoutLinks, withoutMarks } from "./citations";

const ANSWER =
  "Die Sole wurde gesotten.[[1]](https://www.mittelalter-lexikon.de/wiki/Salzsieder)[[2]](https://museum.example/saline/) Mehr [3](http://x.example/a).";

describe("withoutLinks", () => {
  it("turns the marks into plain numbers", () => {
    expect(withoutLinks(ANSWER)).toBe(
      "Die Sole wurde gesotten.[1][2] Mehr [3].",
    );
  });

  it("leaves ordinary text and named links alone", () => {
    const text = "Siehe [Karte](https://x.example) und [12] Fuder.";
    expect(withoutLinks(text)).toBe(text);
  });
});

describe("withoutMarks", () => {
  it("removes the marks for the canon", () => {
    expect(withoutMarks(ANSWER)).toBe("Die Sole wurde gesotten. Mehr.");
  });
});

describe("sourceLabel", () => {
  it("keeps a real title", () => {
    expect(
      sourceLabel({ url: "https://a.example/x", title: "Salzsieder" }),
    ).toBe("Salzsieder");
  });

  it("shows number and host when the title is only the number", () => {
    expect(
      sourceLabel({
        url: "https://www.mittelalter-lexikon.de/wiki/Salzsieder",
        title: "1",
      }),
    ).toBe("[1] mittelalter-lexikon.de");
  });

  it("shows the host without a title and the address if it is no URL", () => {
    expect(
      sourceLabel({ url: "https://de.wikipedia.org/wiki/Saline", title: " " }),
    ).toBe("de.wikipedia.org");
    expect(sourceLabel({ url: "kaputt", title: "" })).toBe("kaputt");
  });
});
