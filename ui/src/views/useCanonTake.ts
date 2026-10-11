import { useEffect, useRef, useState } from "react";

/**
 * Taking a marked passage into the canon (step 3.8): the marked text, the passage being taken
 * over, the note afterwards and the revision counter that makes the `@` menu load again.
 */
export function useCanonTake(onCanonChanged?: () => void) {
  const [marked, setMarked] = useState("");
  const [taking, setTaking] = useState<string | null>(null);
  const [canonNote, setCanonNote] = useState<string | null>(null);
  // Counts canon changes, so the writing panel offers new entries in its `@` menu.
  const [canonRevision, setCanonRevision] = useState(0);
  const factForm = useRef<HTMLDivElement>(null);

  // The form for "In den Kanon" opens below the text; bring its top into view, so it can grow
  // downwards while it loads the entries (step 5.2).
  useEffect(() => {
    if (taking !== null) {
      factForm.current?.scrollIntoView({ block: "start" });
    }
  }, [taking]);

  function start() {
    setCanonNote(null);
    setTaking(marked);
  }

  function done(note: string) {
    setTaking(null);
    setCanonNote(note);
    setCanonRevision((value) => value + 1);
    onCanonChanged?.();
  }

  function cancel() {
    setTaking(null);
  }

  return {
    marked,
    setMarked,
    taking,
    canonNote,
    canonRevision,
    factForm,
    start,
    done,
    cancel,
  };
}
