import { describe, expect, it } from "vitest";
import {
  entryEvent,
  eventEntryName,
  sortedEvents,
  sortKey,
  timelineEvents,
  withEvent,
  withoutEvents,
  worldEvents,
} from "./timeline";

const SALZMARK = `# Zeitlinie (n. d. F. = nach der Flut)

- **0:** Die Große Flut.
- **395–398:** Salzkrieg.
- **401:** Hedda Varn wird ertränkt.
- **399:** Anselm Drach wird Vogt.
- **412, Spätherbst:** Handlung von „Das Salz der Toten“.
- Irgendwann: Das Leuchtfeuer erlischt.
- **Vor der Flut:** Das Festland.

Nachsatz.
`;

describe("timeline (step 7.2)", () => {
  it("takes the first whole number of a date as its sort key", () => {
    expect(sortKey("395–398")).toBe(395);
    expect(sortKey("412, Spätherbst")).toBe(412);
    expect(sortKey("-40")).toBe(-40);
    expect(sortKey("−40")).toBe(-40);
    expect(sortKey("Jahr 7 der Krone")).toBe(7);
    expect(sortKey("Vor der Flut")).toBeNull();
  });

  it("reads the list lines as events, dated or not", () => {
    expect(timelineEvents(SALZMARK)).toEqual([
      { date: "0", text: "Die Große Flut.", key: 0 },
      { date: "395–398", text: "Salzkrieg.", key: 395 },
      { date: "401", text: "Hedda Varn wird ertränkt.", key: 401 },
      { date: "399", text: "Anselm Drach wird Vogt.", key: 399 },
      {
        date: "412, Spätherbst",
        text: "Handlung von „Das Salz der Toten“.",
        key: 412,
      },
      { date: null, text: "Irgendwann: Das Leuchtfeuer erlischt.", key: null },
      { date: "Vor der Flut", text: "Das Festland.", key: null },
    ]);
    expect(timelineEvents("* **12**: Turm.")).toEqual([
      { date: "12", text: "Turm.", key: 12 },
    ]);
  });

  it("sorts by number, keeps the file order for equal numbers, loose ones last", () => {
    const sorted = sortedEvents([
      ...timelineEvents(SALZMARK),
      { date: "399", text: "Zweites im Jahr 399.", key: 399 },
    ]);
    expect(sorted.map((event) => event.date)).toEqual([
      "0",
      "395–398",
      "399",
      "399",
      "401",
      "412, Spätherbst",
      null,
      "Vor der Flut",
    ]);
    expect(sorted[3]?.text).toBe("Zweites im Jahr 399.");
  });

  it("keeps headings and paragraphs without the list", () => {
    expect(withoutEvents(SALZMARK)).toBe(
      "# Zeitlinie (n. d. F. = nach der Flut)\n\n\nNachsatz.\n",
    );
  });

  it("writes a new event before the first later one of the file", () => {
    const body = withEvent(SALZMARK, "400", "Ein Sturm.");
    const lines = body.split("\n");
    // Before "401" – the file's later "399" stays where it is.
    expect(lines.indexOf("- **400:** Ein Sturm.")).toBe(
      lines.indexOf("- **401:** Hedda Varn wird ertränkt.") - 1,
    );
    expect(body.endsWith("Nachsatz.\n")).toBe(true);
  });

  it("writes a later or undated event after the last event", () => {
    for (const date of ["500", "Später"]) {
      const lines = withEvent(SALZMARK, date, "Ende.").split("\n");
      expect(lines.indexOf(`- **${date}:** Ende.`)).toBe(
        lines.indexOf("- **Vor der Flut:** Das Festland.") + 1,
      );
    }
  });

  it("starts the list in an entry without events and keeps the line one event", () => {
    expect(withEvent("", "1", "Anfang.")).toBe("- **1:** Anfang.\n");
    expect(withEvent("# Zeitlinie\n\n", " **3** ", "Zwei\nZeilen  hier ")).toBe(
      "# Zeitlinie\n\n- **3:** Zwei Zeilen hier\n",
    );
  });

  it("reads date and title from the name of one event per entry (the owner's form)", () => {
    expect(
      entryEvent({
        id: "a",
        name: "1999 – Der große Brand",
        body: "Feuer.\n\nWest.",
      }),
    ).toEqual({
      id: "a",
      date: "1999",
      title: "Der große Brand",
      text: "Feuer. West.",
      key: 1999,
    });
    expect(entryEvent({ id: "b", name: "1999 - Brand", body: "" }).title).toBe(
      "Brand",
    );
    expect(
      entryEvent({
        id: "l",
        name: "Chronik",
        body: "# Zeit\n\n- **1:** A.\n- **2:** B.\n- C.\n",
      }).text,
    ).toBe("2 Ereignisse als Liste");
    const long = entryEvent({
      id: "m",
      name: "5 – Lang",
      body: `## Kopf\n**Fett** ${"wort ".repeat(60)}`,
    });
    expect(long.text.startsWith("Kopf Fett wort")).toBe(true);
    expect(long.text.endsWith(" …")).toBe(true);
    expect(long.text.length).toBeLessThanOrEqual(202);
    expect(entryEvent({ id: "c", name: "Jahr 7: Krönung", body: "" }).key).toBe(
      7,
    );
    expect(
      entryEvent({ id: "d", name: "Die Gründung", body: "" }),
    ).toMatchObject({
      date: null,
      title: "Die Gründung",
      key: null,
    });
    expect(
      entryEvent({ id: "e", name: "Vor der Flut – Festland", body: "" }),
    ).toMatchObject({
      date: null,
      title: "Vor der Flut – Festland",
    });
  });

  it("sorts the world's events and names a new one", () => {
    const events = worldEvents([
      { id: "c", name: "2011 – Wiedereröffnung", body: "" },
      { id: "x", name: "Irgendwann", body: "" },
      { id: "a", name: "1987 – Gründung", body: "" },
      { id: "b", name: "1999 – Brand", body: "" },
    ]);
    expect(events.map((event) => event.id)).toEqual(["a", "b", "c", "x"]);
    expect(eventEntryName(" 2015 ", "  Neues \n Jahr ")).toBe(
      "2015 – Neues Jahr",
    );
  });
});
