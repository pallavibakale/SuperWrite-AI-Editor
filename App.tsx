import React, { useState } from "react";
import { Editor } from "./components/Editor";
import { Homepage } from "./components/Homepage";

function App() {
  const [showEditor, setShowEditor] = useState(false);
  const [initialContent, setInitialContent] = useState<string | null>(null);

  const handleFileUploaded = (htmlContent: string) => {
    setInitialContent(htmlContent);
    setShowEditor(true);
  };

  const handleTemplateSelected = () => {
    setInitialContent(null); // null indicates to use the default sample
    setShowEditor(true);
  };

  if (!showEditor) {
    return (
      <Homepage
        onFileUploaded={handleFileUploaded}
        onTemplateSelected={handleTemplateSelected}
      />
    );
  }

  return (
    <div
      className="min-h-screen py-4 px-4"
      style={{
        background:
          "radial-gradient(circle at -40% -70%, rgb(18, 85, 254), rgb(137, 104, 246), rgb(183, 133, 241), rgba(252, 211, 97, 0.9), rgb(232, 202, 236), rgb(241, 224, 240), rgb(241, 224, 240), rgb(232, 202, 236), rgb(232, 202, 236))",
      }}
    >
      <Editor initialContent={initialContent} />
    </div>
  );
}

export default App;
