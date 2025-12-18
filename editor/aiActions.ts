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

  try {
    // 1. Backend Call (Now using real Gemini API)
    const response = await mockRewriteApi({
      text: info.textContent,
      nodeType: info.nodeType,
      intent
    });

    if (response.rewrittenText === response.originalText) {
      // No changes needed or API failed silently
      return;
    }

    // 2. Create Transaction for "Track Changes" visualization
    const tr: Transaction = view.state.tr;

    // Step A: Mark the ORIGINAL selection as "deleted" (Red highlight + Strikethrough)
    // We apply the 'delete' mark to the existing range.
    tr.addMark(info.from, info.to, schema.marks.delete.create());

    // Step B: Insert the NEW text immediately after the original text.
    // We create a text node that already has the 'insert' mark (Green highlight) applied.
    const newTextNode = schema.text(response.rewrittenText, [schema.marks.insert.create()]);
    
    // Insert at the end of the current selection (info.to)
    tr.insert(info.to, newTextNode);

    // Dispatch
    view.dispatch(tr);
    view.focus();

  } catch (e) {
    console.error("Rewrite failed:", e);
  }
}
