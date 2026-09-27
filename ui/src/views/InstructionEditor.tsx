import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { CATEGORIES, type CanonEntry } from "../api";
import { menuItems } from "../references";

/**
 * Instruction field with the `@` menu (step 3.5, FR-013): typing `@` offers the entries of the
 * story's world by name and alias; choosing one writes `@Name` into the instruction. Plain text,
 * nothing is rendered as HTML.
 */
export function InstructionEditor({
  value,
  onChange,
  entries,
  labelledBy,
  disabled,
}: {
  value: string;
  onChange: (text: string) => void;
  /** Canon entries of the story's world; only these are offered. */
  entries: readonly CanonEntry[];
  labelledBy: string;
  disabled: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const entriesRef = useRef(entries);
  const initialValue = useRef(value);
  const initialDisabled = useRef(disabled);
  const editable = useRef(new Compartment());

  useEffect(() => {
    onChangeRef.current = onChange;
    entriesRef.current = entries;
  }, [onChange, entries]);

  useEffect(() => {
    if (host.current === null) {
      return;
    }
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initialValue.current,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          autocompletion({
            override: [(context) => mentions(context, entriesRef.current)],
            icons: false,
          }),
          EditorView.lineWrapping,
          editable.current.of(EditorView.editable.of(!initialDisabled.current)),
          EditorView.contentAttributes.of({
            "aria-labelledby": labelledBy,
            "aria-multiline": "true",
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [labelledBy]);

  useEffect(() => {
    const editor = view.current;
    if (editor !== null && editor.state.doc.toString() !== value) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({
      effects: editable.current.reconfigure(EditorView.editable.of(!disabled)),
    });
  }, [disabled]);

  return <div className="editor instruction" ref={host} />;
}

/** Menu for the text after an `@` that does not stand inside a word. */
export function mentions(
  context: CompletionContext,
  entries: readonly CanonEntry[],
): CompletionResult | null {
  const typed = context.matchBefore(/@[^@\n]*/u);
  if (typed === null) {
    return null;
  }
  const before = context.state.sliceDoc(typed.from - 1, typed.from);
  if (/[\p{L}\p{N}]/u.test(before)) {
    return null;
  }
  const items = menuItems(typed.text.slice(1), entries);
  if (items.length === 0) {
    return null;
  }
  return {
    from: typed.from + 1,
    filter: false,
    options: items.map((item) => ({
      label: item.label,
      detail:
        item.label === item.entry.name
          ? CATEGORIES.find((c) => c.id === item.entry.category)?.label
          : `→ ${item.entry.name}`,
    })),
  };
}
