export enum NodeType {
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  TEXT = 'text'
}

export enum RewriteIntent {
  CLARIFY = 'clarify',
  SHORTEN = 'shorten',
  FORMALIZE = 'formalize'
}

export interface RewriteRequest {
  text: string;
  nodeType: string;
  intent: RewriteIntent;
}

export interface RewriteResponse {
  rewrittenText: string;
  originalText: string;
  diff?: string; // Optional for future diffing visualization
}

// Helper to interact with the simulated backend
export interface ServerResponse<T> {
  data: T;
  status: number;
}