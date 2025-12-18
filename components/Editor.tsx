import React, { useEffect, useRef, useState } from 'react';
import { EditorView } from 'prosemirror-view';
import { createEditorState } from '../editor/editorSetup';
import { DOMParser as PMDOMParser } from 'prosemirror-model';
import { schema } from '../editor/schema';
import { Toolbar } from './Toolbar';

export const Editor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [viewReady, setViewReady] = useState<EditorView | null>(null);
  
  // We use a counter to force React to re-render the toolbar
  // whenever the ProseMirror state changes (cursor moved, selection made).
  const [editorStateHash, setEditorStateHash] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initial content for the demo
    const contentElement = document.createElement('div');
    contentElement.innerHTML = `
      <h1>SuperWrite Lite Demo</h1>
      <p>Welcome to this schema-aware editor. Try selecting this paragraph and hitting the AI Rewrite button.</p>
      <h2>Why Schema Matters</h2>
      <p>In a typical WYSIWYG editor, AI might accidentally inject HTML or break the document structure. Here, we use strict <strong>ProseMirror transactions</strong> to ensure that never happens.</p>
      <p>Try selecting just a few words here to test valid selections.</p>
    `;

    const doc = PMDOMParser.fromSchema(schema).parse(contentElement);
    const state = createEditorState(doc);

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction: (transaction) => {
        // Apply the transaction to the state
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        // Notify React to re-render toolbar if selection/doc changed
        setEditorStateHash(prev => prev + 1);
      }
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
      <Toolbar view={viewReady} editorStateHash={editorStateHash} />
      
      {/* Editor Surface */}
      <div 
        ref={editorRef} 
        className="flex-1 overflow-y-auto p-8 cursor-text"
        onClick={() => viewRef.current?.focus()}
      />
      
      <div className="bg-gray-50 border-t border-gray-100 p-2 text-xs text-gray-500 text-center">
        ProseMirror v1.33.0 &bull; React 18 &bull; Mock AI Backend
      </div>
    </div>
  );
};