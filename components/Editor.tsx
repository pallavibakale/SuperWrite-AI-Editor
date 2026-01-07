import React, { useEffect, useRef, useState } from "react";
import { EditorView } from "prosemirror-view";
import { createEditorState } from "../editor/editorSetup";
import {
  DOMParser as PMDOMParser,
  DOMSerializer,
  Fragment,
  Node as PMNode,
} from "prosemirror-model";
import { schema } from "../editor/schema";
import { Toolbar } from "./Toolbar";
import { TextSelection } from "prosemirror-state";
import { FileUp, FileText, FileDown } from "lucide-react";
import * as mammoth from "mammoth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const Editor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [viewReady, setViewReady] = useState<EditorView | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We use a counter to force React to re-render the toolbar
  // whenever the ProseMirror state changes (cursor moved, selection made).
  const [editorStateHash, setEditorStateHash] = useState(0);

  // Helper to get sample content HTML
  const getSampleContent = () => `
    <h1>SuperWrite Lite Demo</h1>
    <p>Welcome to this schema-aware editor. Try selecting this paragraph and hitting the AI Rewrite button.</p>
    <h2>Why Schema Matters</h2>
    <p>In a typical WYSIWYG editor, AI might accidentally inject HTML or break the document structure. Here, we use strict <strong>ProseMirror transactions</strong> to ensure that never happens.</p>
    <p>Try selecting just a few words here to test valid selections.</p>
  `;

  // Helper to set document content using ProseMirror transaction
  const setDocumentContent = (htmlContent: string) => {
    if (!viewRef.current) return;

    const contentElement = document.createElement("div");
    contentElement.innerHTML = htmlContent;
    const newDoc = PMDOMParser.fromSchema(schema).parse(contentElement);

    // Create a transaction that replaces the entire document
    const tr = viewRef.current.state.tr.replaceWith(
      0,
      viewRef.current.state.doc.content.size,
      newDoc.content
    );

    // Set selection to the start of the document
    tr.setSelection(TextSelection.create(tr.doc, 0));

    viewRef.current.dispatch(tr);
    viewRef.current.focus();
  };

  // Create a clean ProseMirror doc by removing delete marks and unwrapping insert marks
  const cleanNode = (node: PMNode): PMNode | null => {
    // Drop entire node if it carries a delete mark
    if (node.marks.some((m) => m.type.name === "delete")) {
      return null;
    }

    // Filter out change-tracking marks on this node
    const keptMarks = node.marks.filter(
      (m) => m.type.name !== "delete" && m.type.name !== "insert"
    );

    if (node.isText) {
      // If text had delete mark, it was removed above; otherwise return text without insert/delete marks
      return node.type.schema.text(node.text || "", keptMarks);
    }

    const cleanedChildren: PMNode[] = [];
    node.content.forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) cleanedChildren.push(cleaned);
    });

    return node.type.create(
      node.attrs,
      Fragment.fromArray(cleanedChildren),
      keptMarks
    );
  };

  const getCleanDoc = (doc: PMNode): PMNode => {
    const cleaned = cleanNode(doc);
    return cleaned ?? schema.topNodeType.createAndFill()!;
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.toLowerCase();

    try {
      if (fileType.endsWith(".txt")) {
        // Handle plain text files
        const text = await file.text();
        const htmlContent = `<p>${text
          .split("\n")
          .filter((line) => line.trim())
          .join("</p><p>")}</p>`;
        setDocumentContent(htmlContent);
      } else if (fileType.endsWith(".docx") || fileType.endsWith(".doc")) {
        // Handle Word files using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocumentContent(result.value);
      } else if (fileType.endsWith(".pdf")) {
        // For PDF files, show a message (proper parsing requires pdf.js)
        alert(
          "PDF file detected. For this demo, please copy and paste your content directly into the editor.\n\nTo enable PDF parsing, install pdfjs-dist library."
        );
      } else {
        alert(
          "Unsupported file type. Please use .txt, .doc, .docx, or .pdf files."
        );
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load sample template
  const handleLoadSample = () => {
    setDocumentContent(getSampleContent());
  };

  // Download current document as HTML after confirmation
  const handleDownload = () => {
    if (!viewRef.current) return;
    const confirmed = window.confirm(
      "Download the document with all current changes?"
    );
    if (!confirmed) return;

    const serializer = DOMSerializer.fromSchema(schema);
    const cleanDoc = getCleanDoc(viewRef.current.state.doc);
    const fragment = serializer.serializeFragment(cleanDoc.content);
    const container = document.createElement("div");
    container.appendChild(fragment);
    const bodyContent = container.innerHTML;

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Document</title></head><body>${bodyContent}</body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Download current document as PDF preserving formatting
  const handleDownloadPdf = async () => {
    if (!viewRef.current) return;
    const confirmed = window.confirm(
      "Download the document as PDF with all current changes?"
    );
    if (!confirmed) return;

    const serializer = DOMSerializer.fromSchema(schema);
    const cleanDoc = getCleanDoc(viewRef.current.state.doc);
    const fragment = serializer.serializeFragment(cleanDoc.content);
    const containerForHtml = document.createElement("div");
    containerForHtml.appendChild(fragment);
    const cleanHtml = containerForHtml.innerHTML;

    // Prepare offscreen container for accurate rendering
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px"; // ~A4 width at 96dpi
    container.style.padding = "32px";
    container.style.background = "white";
    container.style.color = "black";
    container.style.fontFamily = "Inter, system-ui, -apple-system, sans-serif";
    container.style.lineHeight = "1.6";
    container.style.fontSize = "14px";
    // Basic heading spacing to mirror editor look
    container.innerHTML = "";
    const styles = document.createElement("style");
    styles.textContent = `
      h1 { font-size: 28px; margin: 0 0 12px 0; font-weight: 700; }
      h2 { font-size: 22px; margin: 16px 0 8px 0; font-weight: 600; }
      p { margin: 0 0 10px 0; }
      strong { font-weight: 700; }
      em { font-style: italic; }
    `;
    container.appendChild(styles);
    container.insertAdjacentHTML("beforeend", cleanHtml);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
        "",
        "FAST"
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight,
          "",
          "FAST"
        );
        heightLeft -= pageHeight;
      }

      pdf.save("document.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      container.remove();
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Start with empty content
    const contentElement = document.createElement("div");
    contentElement.innerHTML = "<p></p>";

    const doc = PMDOMParser.fromSchema(schema).parse(contentElement);
    const state = createEditorState(doc);

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction: (transaction) => {
        // Apply the transaction to the state
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        // Notify React to re-render toolbar if selection/doc changed
        setEditorStateHash((prev) => prev + 1);
      },
    });

    viewRef.current = view;
    setViewReady(view);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl my-8 rounded-lg overflow-hidden border border-gray-200">
      {/* File Upload and Template Buttons */}
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
        >
          <FileUp size={16} />
          Upload File
        </button>
        <button
          onClick={handleLoadSample}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <FileText size={16} />
          Load Sample Template
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
        >
          <FileDown size={16} />
          Download HTML
        </button>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
        >
          <FileDown size={16} />
          Download PDF
        </button>
        <span className="text-xs text-gray-600 ml-2">
          Supports .txt, .doc, .docx, .pdf files
        </span>
      </div>

      <Toolbar view={viewReady} editorStateHash={editorStateHash} />

      {/* Editor Surface */}
      <div
        ref={editorRef}
        className="flex-1 overflow-y-auto p-8 cursor-text"
        onClick={() => viewRef.current?.focus()}
      />

      <div className="bg-gray-50 border-t border-gray-100 p-2 text-xs text-gray-500 text-center">
        ProseMirror v1.33.0 &bull; React 18
      </div>
    </div>
  );
};
