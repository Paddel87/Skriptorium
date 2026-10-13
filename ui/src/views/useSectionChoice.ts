import { useCallback, useState } from "react";
import { putSection, readSection, type SectionMode } from "../sections";

/** The open question "Ersetzen / Darunter ergänzen / Abbrechen" about one section. */
export interface SectionAsk {
  heading: string;
  /** The text the section has now. */
  current: string;
  /** Answers the question; `null` cancels. */
  answer: (mode: SectionMode | null) => void;
}

/**
 * Where a taken-over text goes (step 8.4, ADR-083): a missing section is appended and an empty
 * one filled without asking; a section with text raises the question `asking` (shown by
 * `SectionConflict`). `place` resolves to the new text, or to `null` when the author cancels.
 */
export function useSectionChoice() {
  const [asking, setAsking] = useState<SectionAsk | null>(null);

  const place = useCallback(
    (
      markdown: string,
      heading: string,
      text: string,
    ): Promise<string | null> => {
      const current = readSection(markdown, heading);
      if (current === null) {
        return Promise.resolve(putSection(markdown, heading, text, "replace"));
      }
      return new Promise((resolve) => {
        setAsking({
          heading,
          current,
          answer: (mode) => {
            setAsking(null);
            resolve(
              mode === null ? null : putSection(markdown, heading, text, mode),
            );
          },
        });
      });
    },
    [],
  );

  return { place, asking };
}
