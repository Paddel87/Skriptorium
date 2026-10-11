import { Fragment } from "react";
import type { CanonEntry } from "../api";
import { acceptSuggestion } from "../references";

/**
 * Under the instruction: names typed without "@" that can be taken in as references (step 5.1),
 * and the entries already referenced; with `onLookUp` the latter are links (step 5.16).
 */
export function ReferenceNotes({
  busy,
  suggested,
  referenced,
  instruction,
  storyEntries,
  shown,
  onInstruction,
  onLookUp,
}: {
  busy: boolean;
  suggested: readonly { word: string; entry: CanonEntry }[];
  referenced: readonly CanonEntry[];
  instruction: string;
  storyEntries: readonly CanonEntry[];
  shown: (entry: CanonEntry) => string;
  onInstruction: (text: string) => void;
  onLookUp?: (entry: CanonEntry) => void;
}) {
  return (
    <>
      {!busy && suggested.length > 0 && (
        <p className="note suggest">
          {/* Names without @ are only offered (step 5.1, FR-014). */}
          <span>Meintest du:</span>
          {suggested.map(({ word, entry }) => (
            <button
              type="button"
              key={entry.id}
              aria-label={`@${word} heranziehen`}
              onClick={() => {
                onInstruction(
                  acceptSuggestion(instruction, storyEntries, entry),
                );
              }}
            >
              @{word}
              {word.toLocaleLowerCase("de") !==
                entry.name.toLocaleLowerCase("de") && (
                <small> → {shown(entry)}</small>
              )}
            </button>
          ))}
        </p>
      )}
      {referenced.length > 0 && (
        <p className="note">
          Herangezogen:{" "}
          {onLookUp === undefined
            ? referenced.map(shown).join(", ")
            : referenced.map((entry, index) => (
                <Fragment key={entry.id}>
                  {index > 0 && ", "}
                  <button
                    type="button"
                    className="link"
                    title="Eintrag ansehen"
                    onClick={() => {
                      onLookUp(entry);
                    }}
                  >
                    {shown(entry)}
                  </button>
                </Fragment>
              ))}
        </p>
      )}
    </>
  );
}
