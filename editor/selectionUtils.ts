import { EditorState } from 'prosemirror-state';
import { Node } from 'prosemirror-model';

export interface SelectionInfo {
  isValid: boolean;
  nodeType?: string;
  textContent?: string;
  reason?: string;
  from?: number;
  to?: number;
}

/**
 * Checks if the current selection is valid for an AI rewrite.
 * 
 * Rules:
 * 1. Selection must not be empty.
 * 2. Selection must be within a single block node (no cross-block selection).
 * 3. Parent node must be a textblock (p, h1, etc).
 */
export function getSelectionInfo(state: EditorState): SelectionInfo {
  const { selection, doc } = state;
  const { from, to, empty } = selection;

  if (empty) {
    return { isValid: false, reason: "Selection is empty." };
  }

  // Check if selection crosses block boundaries
  // $from and $to are ResolvedPos
  const $from = selection.$from;
  const $to = selection.$to;

  if (!$from.sameParent($to)) {
    return { isValid: false, reason: "Selection must be within a single block." };
  }

  const parentNode = $from.parent;

  if (!parentNode.isTextblock) {
    return { isValid: false, reason: "Selection must be text." };
  }

  // Extract pure text
  const textContent = doc.textBetween(from, to, ' ');

  if (!textContent.trim()) {
      return { isValid: false, reason: "Selected text is empty whitespace." };
  }

  return {
    isValid: true,
    nodeType: parentNode.type.name,
    textContent,
    from,
    to
  };
}