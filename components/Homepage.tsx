import React, { useRef } from "react";
import { FileUp, FileText, Sparkles } from "lucide-react";
import * as mammoth from "mammoth";

interface HomepageProps {
  onFileUploaded: (htmlContent: string) => void;
  onTemplateSelected: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onFileUploaded,
  onTemplateSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        onFileUploaded(htmlContent);
      } else if (fileType.endsWith(".docx") || fileType.endsWith(".doc")) {
        // Handle Word files using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        onFileUploaded(result.value);
      } else if (fileType.endsWith(".pdf")) {
        // For PDF files, show a message
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(circle at -40% -70%, rgb(18, 85, 254), rgb(137, 104, 246), rgb(183, 133, 241), rgba(252, 211, 97, 0.9), rgb(232, 202, 236), rgb(241, 224, 240), rgb(241, 224, 240), rgb(232, 202, 236), rgb(232, 202, 236))",
      }}
    >
      <div className="max-w-3xl w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-white/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
              <Sparkles className="text-white w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            SuperWrite AI Editor
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            An intelligent document editor powered by AI. Rewrite, enhance, and
            transform your content with schema-aware editing and real-time AI
            assistance.
          </p>
        </div>

        {/* Features */}
        <div className="mb-10 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ✨ Key Features
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">🤖</span>
              <span>
                <strong>AI-Powered Rewriting:</strong> Select any text and let
                AI rewrite it instantly
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📝</span>
              <span>
                <strong>Schema-Aware Editing:</strong> Ensures document
                structure integrity with ProseMirror
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📄</span>
              <span>
                <strong>Multiple Formats:</strong> Import .txt, .doc, .docx
                files and export as HTML or PDF
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span>
                <strong>Change Tracking:</strong> Visual indicators for
                insertions and deletions
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Get Started
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.doc,.docx,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg font-medium"
          >
            <FileUp size={24} />
            Upload Your Document
            <span className="text-sm font-normal opacity-90">
              (.txt, .doc, .docx, .pdf)
            </span>
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-gray-300 w-full"></div>
            <span className="absolute bg-white px-4 text-gray-500 text-sm">
              or
            </span>
          </div>

          <button
            onClick={onTemplateSelected}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg font-medium"
          >
            <FileText size={24} />
            Start with a Sample Template
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>No account required • Free to use • Privacy-focused</p>
        </div>
      </div>
    </div>
  );
};
