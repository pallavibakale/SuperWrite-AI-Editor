import { RewriteRequest, RewriteResponse, RewriteIntent } from '../types';

/**
 * SIMULATED BACKEND API
 * 
 * In a real environment, this would be an Express server running on Node.js.
 * To adhere to the constraints of a client-side demo while maintaining
 * the requested file structure, we simulate the network latency and logic here.
 */

const LATENCY_MS = 800;

export const mockRewriteApi = async (payload: RewriteRequest): Promise<RewriteResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = deterministicMockAI(payload);
      resolve(result);
    }, LATENCY_MS);
  });
};

/**
 * Deterministic "Mock AI" logic.
 * Simple string manipulations to demonstrate text replacement without
 * breaking document structure.
 */
function deterministicMockAI(payload: RewriteRequest): RewriteResponse {
  const { text, intent } = payload;
  let rewritten = text;

  switch (intent) {
    case RewriteIntent.CLARIFY:
      rewritten = `(Clarified) ${text.replace(/\bvery\b/g, '').replace(/\bkind of\b/g, '')}`;
      break;
    case RewriteIntent.SHORTEN:
       // Mock shortening: Remove every 4th word or truncation for demo
       const words = text.split(' ');
       rewritten = words.length > 5 
        ? words.slice(0, Math.ceil(words.length * 0.7)).join(' ') + '.' 
        : text;
      break;
    case RewriteIntent.FORMALIZE:
      rewritten = text
        .replace(/\bcan't\b/g, 'cannot')
        .replace(/\bwon't\b/g, 'will not')
        .replace(/\bgonna\b/g, 'going to') + " Furthermore, we concur.";
      break;
  }

  return {
    originalText: text,
    rewrittenText: rewritten
  };
}