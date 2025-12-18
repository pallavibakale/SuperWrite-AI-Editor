# SuperWrite Lite

A minimal, production-grade demonstration of a **schema-aware AI document editor**. 
Built with React, TypeScript, and ProseMirror.

## The Problem

Most basic "AI Writers" treat text as a blob of HTML or Markdown string. When an LLM rewrites content, it often:
1. hallucinates invalid HTML tags (`<div>` inside `<p>`).
2. breaks the document object model (DOM).
3. wipes out metadata or marks (comments, tracking ids) that weren't part of the prompt.

## The Solution: Schema-Aware Rewrites

**SuperWrite Lite** decouples the *intent* from the *execution*.

1. **Strict Schema**: The editor enforces a strict ProseMirror schema (Nodes: Doc, Heading, Paragraph, Text).
2. **Transaction-Based Updates**: The AI does not return HTML. It returns plain text.
3. **Surgical Replacement**: The frontend logic creates a ProseMirror `Transaction` that replaces *only* the content within the text node, preserving the surrounding node type (Heading vs Paragraph) and document identity.

## Architecture

### Frontend (`editor/`)
- **ProseMirror**: Directly manages the `contenteditable` state.
- **Selection Utils**: `editor/selectionUtils.ts` ensures AI actions are only triggered on valid, safe selections (e.g., inside a single block).
- **Transactions**: `editor/aiActions.ts` constructs precise diffs to apply changes.

### Backend Simulation (`server/`)
- Simulates a stateless Node.js/Express API.
- Receives `{ text, intent, nodeType }`.
- Returns deterministic rewrites to demonstrate the pipeline without requiring an OpenAI API key for this demo.

## How it works (DOCX Analogy)

Think of this like a `.docx` file structure. A paragraph is an object container. The AI is only allowed to change the *value* of the text run inside that container, it is strictly forbidden from changing the container itself or inserting new containers unless explicitly handled by a different transaction type.

## Running the Demo

This project is set up as a standard React SPA.

1. `npm install`
2. `npm run dev`
3. Select text in the editor -> Click "AI Clarify".