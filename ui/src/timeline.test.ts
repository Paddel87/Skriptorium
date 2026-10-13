import { describe, expect, it } from "vitest";
import {
  compareTime,
  entryEvent,
  eventEntryName,
  groupByTime,
  parseTime,
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
    const events = timelineEvents(SALZMARK);
    expect(events.map((event) => [event.date, event.text])).toEqual([
      ["0", "Die Große Flut."],
      ["395–398", "Salzkrieg."],
      ["401", "Hedda Varn wird ertränkt."],
      ["399", "Anselm Drach wird Vogt."],
      ["412, Spätherbst", "Handlung von „Das Salz der Toten“."],
      [null, "Irgendwann: Das Leuchtfeuer erlischt."],
      ["Vor der Flut", "Das Festland."],
    ]);
    expect(events.map((event) => event.time.year)).toEqual([
      0,
      395,
      401,
      399,
      412,
      null,
      null,
    ]);
    expect(events[4]?.time.rest).toBe("Spätherbst");
    expect(events[6]?.time.rest).toBe("Vor der Flut");
    expect(timelineEvents("* **12**: Turm.")[0]).toMatchObject({
      date: "12",
      text: "Turm.",
      time: { year: 12 },
    });
  });

  it("recognises years, dates and times of day in any combination (step 8.10)", () => {
    const parts = (text: string) => {
      const t = parseTime(text);
      return [
        t.year,
        t.month,
        t.day,
        t.minutes,
        t.dateMark,
        t.timeMark,
        t.rest,
      ];
    };
    // year only, negative, spans
    expect(parts("412")).toEqual([412, null, null, null, null, null, null]);
    expect(parts("-40")[0]).toBe(-40);
    expect(parts("−40")[0]).toBe(-40);
    expect(parts("395–398")).toEqual([
      395,
      null,
      null,
      null,
      null,
      null,
      "bis 398",
    ]);
    expect(parts("12-14")[0]).toBe(12);
    expect(parts("3. Zeitalter")).toEqual([
      3,
      null,
      null,
      null,
      null,
      null,
      "Zeitalter",
    ]);
    // time of day
    expect(parts("14:30 Uhr")).toEqual([
      null,
      null,
      null,
      870,
      null,
      "14:30 Uhr",
      null,
    ]);
    expect(parts("14:30")[3]).toBe(870);
    expect(parts("9:05")[3]).toBe(545);
    expect(parts("0:00")[3]).toBe(0);
    expect(parts("23:59")[3]).toBe(1439);
    expect(parts("14 Uhr")).toEqual([
      null,
      null,
      null,
      840,
      null,
      "14 Uhr",
      null,
    ]);
    expect(parts("7 Uhr")[3]).toBe(420);
    // dates
    expect(parts("3.5.412")).toEqual([412, 5, 3, null, "3.5.", null, null]);
    expect(parts("3.5.-40")[0]).toBe(-40);
    expect(parts("03.05.")).toEqual([null, 5, 3, null, "3.5.", null, null]);
    expect(parts("3. Mai")).toEqual([null, 5, 3, null, "3. Mai", null, null]);
    expect(parts("1. Jänner")[1]).toBe(1);
    expect(parts("24. dez.")).toEqual([
      null,
      12,
      24,
      null,
      "24. dez",
      null,
      null,
    ]);
    expect(parts("5. März")[1]).toBe(3);
    expect(parts("5. Sept.")[1]).toBe(9);
    // combinations and orders
    expect(parts("412, 3.5., 14:30 Uhr")).toEqual([
      412,
      5,
      3,
      870,
      "3.5.",
      "14:30 Uhr",
      null,
    ]);
    expect(parts("14:30 Uhr 3. Mai 412")).toEqual([
      412,
      5,
      3,
      870,
      "3. Mai",
      "14:30 Uhr",
      null,
    ]);
    expect(parts("3. Mai 412 14 Uhr")).toEqual([
      412,
      5,
      3,
      840,
      "3. Mai",
      "14 Uhr",
      null,
    ]);
    expect(parts("412, Spätherbst")).toEqual([
      412,
      null,
      null,
      null,
      null,
      null,
      "Spätherbst",
    ]);
    // invalid parts stay text and give no year
    expect(parts("25:00")).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "25:00",
    ]);
    expect(parts("14:60")[3]).toBeNull();
    expect(parts("25 Uhr")[0]).toBeNull();
    expect(parts("32.5.412")[0]).toBeNull();
    expect(parts("3.13.412")[1]).toBeNull();
    expect(parts("0. Mai")[1]).toBeNull();
    expect(parts("32. Mai")[1]).toBeNull();
    // the world's own month names are not dates
    expect(parts("3. Nebelmond")).toEqual([
      3,
      null,
      null,
      null,
      null,
      null,
      "Nebelmond",
    ]);
    expect(parts("Vor der Flut")).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "Vor der Flut",
    ]);
  });

  it("orders by year, month, day and time of day, missing parts first", () => {
    const order = (statements: string[]) =>
      sortedEvents(
        statements.map((date) => ({ date, text: "", time: parseTime(date) })),
      ).map((event) => event.date);
    expect(
      order([
        "3.5.412",
        "412",
        "412, 14:30",
        "412, 9:00",
        "1.5.412",
        "3.4.412",
      ]),
    ).toEqual([
      "412",
      "412, 9:00",
      "412, 14:30",
      "3.4.412",
      "1.5.412",
      "3.5.412",
    ]);
    expect(compareTime(parseTime("412"), parseTime("3.5.412"))).toBe(-1);
    expect(compareTime(parseTime("3.5.412"), parseTime("3.5.412"))).toBe(0);
    expect(compareTime(parseTime("Vor"), parseTime("Nach"))).toBe(0);
    expect(compareTime(parseTime("x"), parseTime("1"))).toBe(1);
  });

  it("groups by year, then without a year, then without a time statement", () => {
    const events = [
      "Vor der Flut",
      "14:30 Uhr",
      "412",
      "3.5.",
      "-40",
      "9:00 Uhr",
      "412, 8 Uhr",
      "3.4.",
    ].map((date) => ({ date, time: parseTime(date) }));
    const groups = groupByTime(events);
    expect(
      groups.years.map((g) => [g.year, g.events.map((e) => e.date)]),
    ).toEqual([
      [-40, ["-40"]],
      [412, ["412", "412, 8 Uhr"]],
    ]);
    // Without a year: by month, day, time of day (no month first).
    expect(groups.noYear.map((e) => e.date)).toEqual([
      "9:00 Uhr",
      "14:30 Uhr",
      "3.4.",
      "3.5.",
    ]);
    expect(groups.undated.map((e) => e.date)).toEqual(["Vor der Flut"]);
  });

  it("sorts by number, keeps the file order for equal numbers, loose ones last", () => {
    const sorted = sortedEvents([
      ...timelineEvents(SALZMARK),
      { date: "399", text: "Zweites im Jahr 399.", time: parseTime("399") },
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

  it("places a new event by month, day and time of day, too (step 8.10)", () => {
    const body =
      "- **412:** A.\n- **412, 14:30:** C.\n- **3.5.412:** B.\n- **413:** D.\n";
    const at = (date: string) =>
      withEvent(body, date, "Neu.").split("\n").indexOf(`- **${date}:** Neu.`);
    expect(at("4.5.412")).toBe(3);
    expect(at("412, 9:00")).toBe(1);
    expect(at("412, 15:00")).toBe(2);
    expect(at("2.5.412")).toBe(2);
    expect(at("9:00")).toBe(4);
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
      time: expect.objectContaining({ year: 1999 }) as unknown,
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
    expect(
      entryEvent({ id: "c", name: "Jahr 7: Krönung", body: "" }).time.year,
    ).toBe(7);
    expect(
      entryEvent({ id: "t", name: "14:30 Uhr – Der Alarm", body: "" }),
    ).toMatchObject({
      date: "14:30 Uhr",
      title: "Der Alarm",
      time: { year: null, minutes: 870 },
    });
    expect(
      entryEvent({ id: "u", name: "3. Mai 412 – Aufbruch", body: "" }),
    ).toMatchObject({ date: "3. Mai 412", title: "Aufbruch" });
    expect(
      entryEvent({ id: "d", name: "Die Gründung", body: "" }),
    ).toMatchObject({
      date: null,
      title: "Die Gründung",
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
      { id: "n", name: "14:30 Uhr – Ohne Jahr", body: "" },
      { id: "a", name: "1987 – Gründung", body: "" },
      { id: "b", name: "1999 – Brand", body: "" },
    ]);
    expect(events.map((event) => event.id)).toEqual(["a", "b", "c", "n", "x"]);
    expect(eventEntryName(" 2015 ", "  Neues \n Jahr ")).toBe(
      "2015 – Neues Jahr",
    );
  });
});
