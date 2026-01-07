import { Schema, DOMOutputSpec } from "prosemirror-model";

// 1. Nodes
// doc: root
// paragraph: block containing inline
// heading: block containing inline, has level
// text: inline text

const nodes = {
  doc: {
    content: "block+",
  },
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM: (): DOMOutputSpec => ["p", 0],
  },
  heading: {
    attrs: { level: { default: 1 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
    ],
    toDOM: (node: any): DOMOutputSpec => ["h" + node.attrs.level, 0],
  },
  text: {
    group: "inline",
  },
};

// 2. Marks
// comment: wraps text
// strong/em/underline/link: rich text formatting
// insert/delete: for future diffing features (track changes)

const marks = {
  comment: {
    parseDOM: [{ tag: "span.comment" }],
    toDOM: (): DOMOutputSpec => ["span", { class: "comment" }, 0],
  },
  strong: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node) =>
          (node as HTMLElement).style.fontWeight !== "normal" && null,
      },
      { style: "font-weight=bold" },
    ],
    toDOM: (): DOMOutputSpec => ["strong", 0],
  },
  em: {
    parseDOM: [{ tag: "em" }, { tag: "i" }, { style: "font-style=italic" }],
    toDOM: (): DOMOutputSpec => ["em", 0],
  },
  underline: {
    parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
    toDOM: (): DOMOutputSpec => ["u", 0],
  },
  link: {
    attrs: { href: {} },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom) => ({
          href: (dom as HTMLElement).getAttribute("href"),
        }),
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      "a",
      {
        href: node.attrs.href,
        style: "color:#2563eb;text-decoration:underline;",
      },
      0,
    ],
  },
  insert: {
    parseDOM: [{ tag: "span.insert" }],
    toDOM: (): DOMOutputSpec => ["span", { class: "insert" }, 0],
  },
  delete: {
    parseDOM: [{ tag: "span.delete" }],
    toDOM: (): DOMOutputSpec => ["span", { class: "delete" }, 0],
  },
};

export const schema = new Schema({
  nodes,
  marks,
});
