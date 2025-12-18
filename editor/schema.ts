import { Schema, DOMOutputSpec } from 'prosemirror-model';

// 1. Nodes
// doc: root
// paragraph: block containing inline
// heading: block containing inline, has level
// text: inline text

const nodes = {
  doc: {
    content: "block+"
  },
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM: (): DOMOutputSpec => ["p", 0]
  },
  heading: {
    attrs: { level: { default: 1 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } }
    ],
    toDOM: (node: any): DOMOutputSpec => ["h" + node.attrs.level, 0]
  },
  text: {
    group: "inline"
  }
};

// 2. Marks
// comment: wraps text
// insert/delete: for future diffing features

const marks = {
  comment: {
    parseDOM: [{ tag: "span.comment" }],
    toDOM: (): DOMOutputSpec => ["span", { class: "comment" }, 0]
  },
  insert: {
    parseDOM: [{ tag: "span.insert" }],
    toDOM: (): DOMOutputSpec => ["span", { class: "insert" }, 0]
  },
  delete: {
    parseDOM: [{ tag: "span.delete" }],
    toDOM: (): DOMOutputSpec => ["span", { class: "delete" }, 0]
  }
};

export const schema = new Schema({
  nodes,
  marks
});