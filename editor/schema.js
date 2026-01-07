import { Schema } from "prosemirror-model";

const nodes = {
  doc: {
    content: "block+",
  },
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM: () => ["p", 0],
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
    toDOM: (node) => ["h" + node.attrs.level, 0],
  },
  text: {
    group: "inline",
  },
};

const marks = {
  comment: {
    parseDOM: [{ tag: "span.comment" }],
    toDOM: () => ["span", { class: "comment" }, 0],
  },
  strong: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node) => node.style?.fontWeight !== "normal" && null,
      },
      { style: "font-weight=bold" },
    ],
    toDOM: () => ["strong", 0],
  },
  em: {
    parseDOM: [{ tag: "em" }, { tag: "i" }, { style: "font-style=italic" }],
    toDOM: () => ["em", 0],
  },
  underline: {
    parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
    toDOM: () => ["u", 0],
  },
  link: {
    attrs: { href: {} },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom) => ({ href: dom.getAttribute("href") }),
      },
    ],
    toDOM: (node) => [
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
    toDOM: () => ["span", { class: "insert" }, 0],
  },
  delete: {
    parseDOM: [{ tag: "span.delete" }],
    toDOM: () => ["span", { class: "delete" }, 0],
  },
};

export const schema = new Schema({
  nodes,
  marks,
});
