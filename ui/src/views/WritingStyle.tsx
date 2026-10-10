import { useEffect, useId, useRef, useState, type SyntheticEvent } from "react";
import {
  api,
  describeError,
  type Chapter,
  type Story,
  type WritingStyle,
} from "../api";
import { ErrorText, Field } from "./Common";

// The fixed lists of the atmospheric writing style (step 5.6, ADR-053). They must match the
// lists in `src/skriptorium/manuscript/service.py`; the server refuses other values.
const GENRES = [
  "Dark Romance",
  "Dark Erotic",
  "CNC",
  "Thriller",
  "Psychothriller",
  "düstere Geschichte",
  "Horror",
  "Dark Fantasy",
  "Krimi",
];
const TONES = [
  "düster",
  "bedrückend",
  "kalt",
  "roh",
  "sinnlich",
  "zärtlich",
  "leidenschaftlich",
  "melancholisch",
  "bedrohlich",
  "nüchtern",
  "ironisch",
];
const ATMOSPHERES = [
  "beklemmend",
  "angespannt",
  "unheimlich",
  "gefährlich",
  "schwül",
  "intim",
  "eisig",
  "hoffnungslos",
  "still",
  "fiebrig",
];
const TEMPOS = ["langsam", "gemessen", "zügig", "atemlos"];
const STYLES = [
  "knapp",
  "schlicht",
  "bildhaft",
  "poetisch",
  "ausführlich",
  "dialogreich",
];
const EXPLICITNESSES = ["angedeutet", "sinnlich", "explizit"];
const FREE_MAX = 1000;

/** The values of a style in the order of the form, one text per group; empty groups left out. */
export function styleParts(style: WritingStyle): string[] {
  return [
    style.tone.join(", "),
    style.atmosphere.join(", "),
    style.tempo ?? "",
    style.style.join(", "),
    style.explicitness ?? "",
    style.free.trim() === "" ? "" : "weitere Angaben",
  ].filter((part) => part !== "");
}

/** The style that applies to a chapter: its own, else the default of the story. */
export function effectiveStyle(story: Story, chapter: Chapter): WritingStyle {
  return chapter.writing_style ?? story.writing_style;
}

/**
 * The style of the open chapter as a short line below the Figuren-Schreibweise (step 5.6);
 * "ändern" opens the editor of the chapter in the bar on the right.
 */
export function StyleLine({
  story,
  chapter,
  onChange,
}: {
  story: Story;
  chapter: Chapter;
  onChange: () => void;
}) {
  const parts = styleParts(effectiveStyle(story, chapter));
  return (
    <p className="mode-line">
      <span className="note">Schreibweise Kapitel {chapter.number}:</span>{" "}
      <span className="note">
        {parts.length === 0 ? "keine" : parts.join(" · ")}
      </span>
      {" · "}
      <button
        type="button"
        className="link"
        aria-label={`Schreibweise Kapitel ${String(chapter.number)} ändern`}
        onClick={onChange}
      >
        ändern
      </button>
    </p>
  );
}

/** A group of buttons to tap; a single-value group lets go of its value when tapped again. */
function Choice({
  legend,
  values,
  chosen,
  single = false,
  onChange,
}: {
  legend: string;
  values: readonly string[];
  chosen: readonly string[];
  single?: boolean;
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="style-group">
      <legend>
        {legend}
        {single && (
          <>
            {" "}
            <small>(ein Wert)</small>
          </>
        )}
      </legend>
      <div className="chips">
        {values.map((value) => {
          const on = chosen.includes(value);
          return (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={on}
              onClick={() => {
                if (single) {
                  onChange(on ? [] : [value]);
                } else {
                  onChange(
                    on
                      ? chosen.filter((item) => item !== value)
                      : [...chosen, value],
                  );
                }
              }}
            >
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The groups of a style without the genre, and the free text. */
function StyleFields({
  value,
  onChange,
}: {
  value: WritingStyle;
  onChange: (next: WritingStyle) => void;
}) {
  return (
    <>
      <Choice
        legend="Tonalität"
        values={TONES}
        chosen={value.tone}
        onChange={(tone) => {
          onChange({ ...value, tone });
        }}
      />
      <Choice
        legend="Atmosphäre"
        values={ATMOSPHERES}
        chosen={value.atmosphere}
        onChange={(atmosphere) => {
          onChange({ ...value, atmosphere });
        }}
      />
      <Choice
        legend="Tempo"
        values={TEMPOS}
        chosen={value.tempo === null ? [] : [value.tempo]}
        single
        onChange={(next) => {
          onChange({ ...value, tempo: next[0] ?? null });
        }}
      />
      <Choice
        legend="Stil"
        values={STYLES}
        chosen={value.style}
        onChange={(style) => {
          onChange({ ...value, style });
        }}
      />
      <Choice
        legend="Deutlichkeit"
        values={EXPLICITNESSES}
        chosen={value.explicitness === null ? [] : [value.explicitness]}
        single
        onChange={(next) => {
          onChange({ ...value, explicitness: next[0] ?? null });
        }}
      />
      <Field label="Weitere Angaben (frei)">
        <textarea
          rows={2}
          maxLength={FREE_MAX}
          value={value.free}
          onChange={(event) => {
            onChange({ ...value, free: event.target.value });
          }}
        />
      </Field>
    </>
  );
}

/**
 * Genre and default style of the story (step 5.6, ADR-053): the default is copied into each
 * chapter created afterwards; chapters that exist keep their own.
 */
export function StoryStyle({
  story,
  onSaved,
}: {
  story: Story;
  onSaved: (story: Story) => void;
}) {
  const heading = useId();
  const [genres, setGenres] = useState(story.genres);
  const [style, setStyle] = useState(story.writing_style);
  const [state, setState] = useState<"clean" | "dirty" | "saved">("clean");
  const [error, setError] = useState<string | null>(null);

  // A story changed elsewhere (e.g. by the server's answer) replaces the form.
  const source = JSON.stringify([story.genres, story.writing_style]);
  const [seen, setSeen] = useState(source);
  if (seen !== source) {
    setSeen(source);
    setGenres(story.genres);
    setStyle(story.writing_style);
  }

  async function save(event: SyntheticEvent) {
    event.preventDefault();
    setError(null);
    try {
      onSaved(
        await api.updateStory(story.world, story.id, {
          genres,
          writing_style: style,
        }),
      );
      setState("saved");
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <section className="style-section" aria-labelledby={heading}>
      <h3 id={heading}>Genre und Schreibweise der Geschichte</h3>
      <p className="note">
        Vorgabe für neue Kapitel; schon angelegte Kapitel behalten ihre eigene
        Schreibweise.
      </p>
      <form className="stack" onSubmit={(event) => void save(event)}>
        <Choice
          legend="Genre"
          values={GENRES}
          chosen={genres}
          onChange={(next) => {
            setGenres(next);
            setState("dirty");
          }}
        />
        <StyleFields
          value={style}
          onChange={(next) => {
            setStyle(next);
            setState("dirty");
          }}
        />
        <ErrorText message={error} />
        <div className="row">
          <button type="submit" disabled={state !== "dirty"}>
            Speichern
          </button>
          {state === "saved" && <span className="ok">Gespeichert.</span>}
        </div>
      </form>
    </section>
  );
}

/**
 * The style of one chapter (step 5.6): set for this chapter only, or take the default of the
 * story back. `round` counts "ändern" in the short line, which brings the section into view.
 */
export function ChapterStyle({
  story,
  chapter,
  onSaved,
  round = 0,
}: {
  story: Story;
  chapter: Chapter;
  onSaved: () => void;
  round?: number;
}) {
  const heading = useId();
  const top = useRef<HTMLHeadingElement>(null);
  const applying = effectiveStyle(story, chapter);
  const [style, setStyle] = useState(applying);
  const [state, setState] = useState<"clean" | "dirty" | "saved" | "reset">(
    "clean",
  );
  const [error, setError] = useState<string | null>(null);

  // Another chapter, or a style saved or taken back, replaces the form.
  const source = JSON.stringify([chapter.number, applying]);
  const [seen, setSeen] = useState(source);
  if (seen !== source) {
    setSeen(source);
    setStyle(applying);
  }

  useEffect(() => {
    if (round > 0) {
      top.current?.scrollIntoView({ block: "start" });
      top.current?.focus();
    }
  }, [round]);

  async function change(next: WritingStyle | null, done: "saved" | "reset") {
    setError(null);
    try {
      await api.saveChapter(chapter.world, chapter.story, chapter.number, {
        writing_style: next,
      });
      setState(done);
      onSaved();
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  }

  return (
    <section className="style-section" aria-labelledby={heading}>
      <h3 id={heading} ref={top} tabIndex={-1}>
        Schreibweise dieses Kapitels (Kapitel {chapter.number})
      </h3>
      <p className="note">
        Beim Anlegen aus der Vorgabe der Geschichte übernommen; hier nur für
        dieses Kapitel geändert.
      </p>
      {chapter.writing_style === null && (
        <p className="note">
          Dieses Kapitel hat keine eigene Schreibweise; es gilt die Vorgabe der
          Geschichte.
        </p>
      )}
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void change(style, "saved");
        }}
      >
        <StyleFields
          value={style}
          onChange={(next) => {
            setStyle(next);
            setState("dirty");
          }}
        />
        <ErrorText message={error} />
        <div className="row">
          <button type="submit" disabled={state !== "dirty"}>
            Speichern
          </button>
          <button
            type="button"
            disabled={chapter.writing_style === null}
            onClick={() => {
              void change(null, "reset");
            }}
          >
            Vorgabe der Geschichte übernehmen
          </button>
          {state === "saved" && <span className="ok">Gespeichert.</span>}
          {state === "reset" && <span className="ok">Übernommen.</span>}
        </div>
      </form>
    </section>
  );
}
