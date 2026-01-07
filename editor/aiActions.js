import { getSelectionInfo } from "./selectionUtils";
import { mockRewriteApi } from "../server/index.js";
import { RewriteIntent } from "../types.js";
import { schema } from "./schema";

export async function performRewrite(view, intent) {
  const state = view.state;
  const info = getSelectionInfo(state);

  if (
    !info.isValid ||
    !info.textContent ||
    !info.nodeType ||
    info.from === undefined ||
    info.to === undefined
  ) {
    console.warn("Invalid selection for rewrite:", info.reason);
    return;
  }

  try {
    const response = await mockRewriteApi({
      text: info.textContent,
      nodeType: info.nodeType,
      intent,
    });

    if (response.rewrittenText === response.originalText) {
      return;
    }

    const tr = view.state.tr;

    // Mark original text as deleted
    tr.addMark(info.from, info.to, schema.marks.delete.create());

    // Insert rewritten text with insert mark
    const newTextNode = schema.text(response.rewrittenText, [
      schema.marks.insert.create(),
    ]);
    tr.insert(info.to, newTextNode);

    view.dispatch(tr);
    view.focus();
  } catch (e) {
    console.error("Rewrite failed:", e);
  }
}
