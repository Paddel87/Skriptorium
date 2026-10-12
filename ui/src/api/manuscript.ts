/** Stories, chapters, summaries and instruction notes of a world. */

import { request, requestFile } from "./core";
import { enc, storyPath, worldPath } from "./paths";
import { describeWriteError } from "./writing";
import type { WriteErrorKind } from "./writing";

export type Form = "roman" | "kurzgeschichte" | "fragment";
export type SummaryStatus = "fehlt" | "erzeugt" | "geprüft";

export const FORMS: readonly { id: Form; label: string }[] = [
  { id: "roman", label: "Roman" },
  { id: "kurzgeschichte", label: "Kurzgeschichte" },
  { id: "fragment", label: "Fragment" },
];

/** A canon entry of another world, bound into one story only (FR-017). */
export interface GuestLink {
  world: string;
  entry: string;
}

/** A fact about a canon entry that holds only in one story (FR-024). */
export interface StoryFact {
  entry: string;
  fact: string;
}

/** Atmospheric writing style (step 5.6); the empty style has nothing set. */
export interface WritingStyle {
  tone: string[];
  atmosphere: string[];
  style: string[];
  tempo: string | null;
  explicitness: string | null;
  free: string;
}

export interface Story {
  world: string;
  id: string;
  title: string;
  form: Form;
  perspective: string | null;
  controlled_characters: string[];
  guest_links: GuestLink[];
  facts: StoryFact[];
  summary: string;
  /** Model chosen for this story (step 3.9); `null` means the preset model. */
  model: string | null;
  /** Genres and the default writing style that new chapters copy (step 5.6). */
  genres: string[];
  writing_style: WritingStyle;
  /** File name of the cover (step 7.11); `null` without one. */
  cover: string | null;
}

export interface Chapter {
  world: string;
  story: string;
  number: number;
  title: string;
  status: "in-arbeit" | "abgeschlossen";
  summary: string;
  summary_status: SummaryStatus;
  text: string;
  /** `null`: no style of its own, the default of the story applies (step 5.6). */
  writing_style: WritingStyle | null;
}

/** A taken-over exchange (step 5.13, ADR-056); never sent to the AI. */
export interface InstructionNote {
  /** Time of taking over, ISO 8601 in UTC. */
  at: string;
  /** The author's instruction, "Weiter" or "Neue Szene" without one. */
  instruction: string;
  /** The AI's text as it went into the manuscript. */
  text: string;
  model: string | null;
}

/** Result of creating the summaries (step 3.6); `failure` names the step that failed. */
export interface SummaryResult {
  chapter: Chapter;
  story: Story;
  failure: {
    stage: "kapitel" | "gesamt";
    kind: Exclude<WriteErrorKind, "verbindung"> | "leer" | "zu_gross";
  } | null;
}

/** User-facing text for a failed summary step, in German. */
export function describeSummaryFailure(
  failure: NonNullable<SummaryResult["failure"]>,
): string {
  const reason =
    failure.kind === "leer"
      ? "Das Modell hat keinen Text geliefert."
      : failure.kind === "zu_gross"
        ? "Der Text ist zu lang für eine Anfrage."
        : describeWriteError(failure.kind);
  return failure.stage === "kapitel"
    ? `Kurzfassung nicht erstellt. ${reason} Bis dahin nutzt die KI den Kapitelanfang.`
    : `Kurzfassung erstellt, Gesamtzusammenfassung nicht fortgeschrieben. ${reason}`;
}

export const manuscriptApi = {
  /** The story as an EPUB file (step 7.4); the author is only written into the file. */
  /** Address of the story's cover; the file name in the query makes a new cover load anew. */
  coverPath: (story: Story) =>
    `${storyPath(story.world, story.id)}/cover?v=${encodeURIComponent(story.cover ?? "")}`,
  setCover: (world: string, story: string, content: string) =>
    request("POST", `${storyPath(world, story)}/cover`, {
      content,
    }) as Promise<Story>,
  removeCover: (world: string, story: string) =>
    request("DELETE", `${storyPath(world, story)}/cover`) as Promise<Story>,
  exportEpub: (
    world: string,
    story: string,
    order: { author: string | null; only_completed: boolean },
  ) => requestFile("POST", `${storyPath(world, story)}/export/epub`, order),
  stories: (world: string) =>
    request("GET", `${worldPath(world)}/stories`) as Promise<Story[]>,
  createStory: (
    world: string,
    title: string,
    form: Form,
    perspective: string | null,
  ) =>
    request("POST", `${worldPath(world)}/stories`, {
      title,
      form,
      perspective,
    }) as Promise<Story>,
  updateStory: (
    world: string,
    story: string,
    change: {
      perspective?: string | null;
      controlled_characters?: string[];
      model?: string | null;
      genres?: string[];
      writing_style?: WritingStyle;
    },
  ) => request("PATCH", storyPath(world, story), change) as Promise<Story>,
  addGuest: (world: string, story: string, guest: GuestLink) =>
    request(
      "POST",
      `${storyPath(world, story)}/guests`,
      guest,
    ) as Promise<Story>,
  removeGuest: (world: string, story: string, guest: GuestLink) =>
    request(
      "DELETE",
      `${storyPath(world, story)}/guests/${enc(guest.world)}/${enc(guest.entry)}`,
    ) as Promise<Story>,
  addFact: (world: string, story: string, fact: StoryFact) =>
    request("POST", `${storyPath(world, story)}/facts`, fact) as Promise<Story>,
  removeFact: (world: string, story: string, fact: StoryFact) =>
    request(
      "DELETE",
      `${storyPath(world, story)}/facts`,
      fact,
    ) as Promise<Story>,
  chapters: (world: string, story: string) =>
    request("GET", `${storyPath(world, story)}/chapters`) as Promise<Chapter[]>,
  saveChapter: (
    world: string,
    story: string,
    number: number,
    change: {
      title?: string;
      text?: string;
      /** `null` takes the chapter back to the default of the story. */
      writing_style?: WritingStyle | null;
    },
  ) =>
    request(
      "PUT",
      `${storyPath(world, story)}/chapters/${String(number)}`,
      change,
    ) as Promise<Chapter>,
  completeChapter: (world: string, story: string, number: number) =>
    request(
      "POST",
      `${storyPath(world, story)}/chapters/${String(number)}/complete`,
    ) as Promise<Chapter>,
  /** Longest chapter text in characters whose short summary still fits (step 6.1). */
  summaryRoom: (world: string, story: string, number: number) =>
    request(
      "GET",
      `${storyPath(world, story)}/chapters/${String(number)}/summary-room`,
    ) as Promise<{ max_chars: number }>,
  summarizeChapter: (world: string, story: string, number: number) =>
    request(
      "POST",
      `${storyPath(world, story)}/chapters/${String(number)}/summarize`,
    ) as Promise<SummaryResult>,
  setChapterSummary: (
    world: string,
    story: string,
    number: number,
    summary: string,
    status: SummaryStatus,
  ) =>
    request(
      "PUT",
      `${storyPath(world, story)}/chapters/${String(number)}/summary`,
      { summary, status },
    ) as Promise<Chapter>,
  instructions: (world: string, story: string, number: number) =>
    request(
      "GET",
      `${storyPath(world, story)}/chapters/${String(number)}/instructions`,
    ) as Promise<InstructionNote[]>,
  addInstruction: (
    world: string,
    story: string,
    number: number,
    note: Omit<InstructionNote, "at">,
  ) =>
    request(
      "POST",
      `${storyPath(world, story)}/chapters/${String(number)}/instructions`,
      note,
    ) as Promise<InstructionNote[]>,
  setStorySummary: (world: string, story: string, summary: string) =>
    request("PUT", `${storyPath(world, story)}/summary`, {
      summary,
    }) as Promise<Story>,
};
