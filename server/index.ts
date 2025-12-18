import { RewriteRequest, RewriteResponse, RewriteIntent } from '../types';
import { GoogleGenAI } from "@google/genai";

/**
 * SIMULATED BACKEND API
 * 
 * In a real environment, this would be an Express server running on Node.js.
 * To adhere to the constraints of a client-side demo while maintaining
 * the requested file structure, we perform the API call here.
 */

export const mockRewriteApi = async (payload: RewriteRequest): Promise<RewriteResponse> => {
  const { text, intent, nodeType } = payload;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a specific system instruction based on the intent
    const systemPrompt = `You are a professional editor. Your task is to rewrite text inside a ${nodeType} to match the intent: "${intent}".
    - Return ONLY the rewritten text.
    - Do not include explanations, quotes, or markdown.
    - Maintain the original meaning but apply the requested style transformation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const rewrittenText = response.text?.trim() || text;

    return {
      originalText: text,
      rewrittenText: rewrittenText
    };

  } catch (error) {
    console.error("AI API Error:", error);
    // Fallback to original text if API fails
    return {
      originalText: text,
      rewrittenText: text // No change on error
    };
  }
};
