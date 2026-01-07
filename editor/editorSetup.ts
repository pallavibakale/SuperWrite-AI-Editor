import { EditorState } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { history, undo, redo } from "prosemirror-history";
import { baseKeymap, toggleMark, setBlockType } from "prosemirror-commands";
import { schema } from "./schema";

// Standard Keymap
// Cmd-z / Ctrl-z for undo/redo
// Enter for paragraph break
const editorKeymap = keymap({
  "Mod-z": undo,
  "Mod-y": redo,
  "Mod-Shift-z": redo,
  "Mod-b": toggleMark(schema.marks.strong),
  "Mod-i": toggleMark(schema.marks.em),
  "Mod-u": toggleMark(schema.marks.underline),
});

export function createEditorState(initialContent?: any): EditorState {
  return EditorState.create({
    schema,
    doc: initialContent, // undefined creates empty doc
    plugins: [
      history(),
      editorKeymap,
      keymap(baseKeymap), // Standard typing behaviors (Backspace, Delete, Enter)
    ],
  });
}

// Command Helpers for Toolbar
export const toggleH1 = setBlockType(schema.nodes.heading, { level: 1 });
export const toggleH2 = setBlockType(schema.nodes.heading, { level: 2 });
export const toggleParagraph = setBlockType(schema.nodes.paragraph);
export const toggleComment = toggleMark(schema.marks.comment);
export const toggleBold = toggleMark(schema.marks.strong);
export const toggleItalic = toggleMark(schema.marks.em);
export const toggleUnderline = toggleMark(schema.marks.underline);

// Link toggle: when href is provided, apply/update; when href is null, remove.
export const toggleLink = (href: string | null) => {
  return (state: EditorState, dispatch?: any) => {
    const markType = schema.marks.link;
    if (!href) {
      return toggleMark(markType)(state, dispatch);
    }
    return toggleMark(markType, { href })(state, dispatch);
  };
};

export const markActive = (state: EditorState, markName: string) => {
  const { from, $from, to, empty } = state.selection;
  const markType = schema.marks[markName];
  if (!markType) return false;
  if (empty) return !!markType.isInSet(state.storedMarks || $from.marks());
  return state.doc.rangeHasMark(from, to, markType);
};
