export const NodeType = {
  PARAGRAPH: "paragraph",
  HEADING: "heading",
  TEXT: "text",
};

export const RewriteIntent = {
  CLARIFY: "clarify",
  SHORTEN: "shorten",
  FORMALIZE: "formalize",
};

// Optional: JSDoc typedefs for clarity in JS consumers
/**
 * @typedef {Object} RewriteRequest
 * @property {string} text
 * @property {string} nodeType
 * @property {keyof typeof RewriteIntent} intent
 */

/**
 * @typedef {Object} RewriteResponse
 * @property {string} rewrittenText
 * @property {string} originalText
 * @property {string} [diff]
 */
