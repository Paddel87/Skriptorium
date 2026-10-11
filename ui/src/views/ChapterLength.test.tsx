import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, ok } from "../../fake-api";
import { ChapterLength, countWords, wordLimit } from "./ChapterLength";

const ROOM =
  "GET /api/worlds/salzmark/stories/ueberfahrt/chapters/2/summary-room";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function show(text: string, summary = "") {
  return render(
    <ChapterLength
      world="salzmark"
      story="ueberfahrt"
      chapter={2}
      text={text}
      summary={summary}
    />,
  );
}

/** `words` words of 5 letters each: 6 characters per word with the space. */
function words(count: number): string {
  return Array.from({ length: count }, () => "Wort.").join(" ");
}

describe("countWords and wordLimit (step 6.1)", () => {
  it("counts words separated by any whitespace", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("  \n ")).toBe(0);
    expect(countWords("Ein  Wort\nund\tnoch eins")).toBe(5);
  });

  it("turns the room in characters into words, rounded to 500", () => {
    expect(wordLimit(words(1000), 72_000)).toBe("12.000");
    expect(wordLimit(words(1000), 70_600)).toBe("12.000");
  });
});

describe("ChapterLength (step 6.1, FR-033)", () => {
  it("shows the word count while there is room", async () => {
    fakeApi({ [ROOM]: ok({ max_chars: 72_000 }) });
    show(words(1000));

    expect(await screen.findByText("1.000 Wörter")).toBeDefined();
    expect(screen.getByText("1.000 Wörter").closest("p")?.className).toBe(
      "chapter-length normal",
    );
  });

  it("uses the singular and shows a count before the limit is known", () => {
    fakeApi({ [ROOM]: () => ({ status: 500, body: { detail: "kaputt" } }) });
    show("Wort");

    expect(screen.getByText("1 Wort")).toBeDefined();
  });

  it("advises to complete the chapter from 85 % of the room", async () => {
    fakeApi({ [ROOM]: ok({ max_chars: 7_000 }) });
    show(words(1000));

    expect(
      await screen.findByText(
        "1.000 Wörter · Kurzfassung passt bis ca. 1.000 – bald abschließen",
      ),
    ).toBeDefined();
  });

  it("marks a chapter that no longer fits", async () => {
    fakeApi({ [ROOM]: ok({ max_chars: 5_000 }) });
    show(words(1000));

    const line = await screen.findByText(
      "1.000 Wörter · zu lang für die Kurzfassung – Kapitel abschließen oder teilen",
    );
    expect(line.closest("p")?.className).toBe("chapter-length over");
  });

  it("loads the limit again when the overall summary changed", async () => {
    const { calls } = fakeApi({ [ROOM]: ok({ max_chars: 72_000 }) });
    const view = show(words(10), "alt");
    await waitFor(() => {
      expect(calls).toHaveLength(1);
    });

    view.rerender(
      <ChapterLength
        world="salzmark"
        story="ueberfahrt"
        chapter={2}
        text={words(11)}
        summary="neu"
      />,
    );
    await waitFor(() => {
      expect(calls).toHaveLength(2);
    });
    view.rerender(
      <ChapterLength
        world="salzmark"
        story="ueberfahrt"
        chapter={2}
        text={words(12)}
        summary="neu"
      />,
    );
    expect(calls).toHaveLength(2);
  });
});
