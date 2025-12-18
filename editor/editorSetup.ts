import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { baseKeymap, toggleMark, setBlockType } from 'prosemirror-commands';
import { schema } from './schema';

// Standard Keymap
// Cmd-z / Ctrl-z for undo/redo
// Enter for paragraph break
const editorKeymap = keymap({
  "Mod-z": undo,
  "Mod-y": redo,
  "Mod-Shift-z": redo,
  "Mod-b": toggleMark(schema.marks.comment), // Arbitrary binding for demo
});

export function createEditorState(initialContent?: any): EditorState {
  return EditorState.create({
    schema,
    doc: initialContent, // undefined creates empty doc
    plugins: [
      history(),
      editorKeymap,
      keymap(baseKeymap), // Standard typing behaviors (Backspace, Delete, Enter)
    ]
  });
}

// Command Helpers for Toolbar
export const toggleH1 = setBlockType(schema.nodes.heading, { level: 1 });
export const toggleH2 = setBlockType(schema.nodes.heading, { level: 2 });
export const toggleParagraph = setBlockType(schema.nodes.paragraph);
export const toggleComment = toggleMark(schema.marks.comment);