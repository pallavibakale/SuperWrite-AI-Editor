import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { getSelectionInfo } from './selectionUtils';
import { mockRewriteApi } from '../server/index';
import { RewriteIntent } from '../types';
import { schema } from './schema';

/**
 * Orchestrates the AI Rewrite Flow.
 * 
 * 1. Validates selection.
 * 2. Calls backend.
 * 3. Applies Transaction.
 */
export async function performRewrite(
  view: EditorView, 
  intent: RewriteIntent
): Promise<void> {
  const state = view.state;
  const info = getSelectionInfo(state);

  if (!info.isValid || !info.textContent || !info.nodeType || info.from === undefined || info.to === undefined) {
    console.warn("Invalid selection for rewrite:", info.reason);
    return;
  }

  // Visual feedback: user could implement a loading mark here if desired,
  // for now we handle loading state in React.

  try {
    // 1. Backend Call
    const response = await mockRewriteApi({
      text: info.textContent,
      nodeType: info.nodeType,
      intent
    });

    // 2. Create Transaction
    // We strictly use replaceWith to insert a text node. 
    // This preserves the parent block node (e.g., if it was an H1, it stays an H1).
    // It also keeps surrounding structure intact.
    const tr: Transaction = view.state.tr;
    
    // Create a text node with the new content
    const newTextNode = schema.text(response.rewrittenText);

    // Replace the specific range. 
    // Note: This replaces text AND marks inside the selection.
    // If we wanted to preserve internal marks (bold/italic) inside the new text,
    // the AI logic would need to return structured data or we'd need a mapping heuristic.
    // For this Lite version, we treat the rewrite as plain text replacement as per reqs.
    tr.replaceWith(info.from, info.to, newTextNode);

    // Optional: Add a comment mark to indicate AI touched this
    // tr.addMark(info.from, info.from + newTextNode.nodeSize, schema.marks.insert.create());

    // Dispatch
    view.dispatch(tr);
    view.focus();

  } catch (e) {
    console.error("Rewrite failed:", e);
    // Handle error (toast notification, etc)
  }
}