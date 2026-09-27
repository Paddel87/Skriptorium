import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ENTRY } from "../../fake-api";
import { InstructionEditor, mentions } from "./InstructionEditor";

function menu(doc: string) {
  const state = EditorState.create({ doc });
  return mentions(new CompletionContext(state, doc.length, false), [ENTRY]);
}

describe("mentions", () => {
  it("offers names with their category and aliases with their entry", () => {
    expect(menu("Dann @")).toMatchObject({
      from: 6,
      options: [{ label: "Kael", detail: "Figur" }],
    });
    expect(menu("@der F")?.options).toEqual([
      { label: "der Fährmann", detail: "→ Kael" },
    ]);
  });

  it("stays closed without @, inside a word and without a match", () => {
    expect(menu("Kael")).toBeNull();
    expect(menu("mail@K")).toBeNull();
    expect(menu("@Mira")).toBeNull();
  });
});

describe("InstructionEditor", () => {
  it("follows new values and locks input while disabled", () => {
    const props = {
      onChange: vi.fn(),
      entries: [ENTRY],
      labelledBy: "anweisung",
    };
    const { container, rerender } = render(
      <InstructionEditor {...props} value="@Kael" disabled={false} />,
    );
    const content = container.querySelector(".cm-content");
    expect(content?.getAttribute("contenteditable")).toBe("true");
    expect(content?.getAttribute("aria-labelledby")).toBe("anweisung");
    rerender(<InstructionEditor {...props} value="" disabled />);
    expect(content?.textContent).toBe("");
    expect(content?.getAttribute("contenteditable")).toBe("false");
    const view = EditorView.findFromDOM(content as HTMLElement);
    view?.dispatch({ changes: { from: 0, insert: "@" } });
    expect(props.onChange).toHaveBeenCalledWith("@");
  });
});
