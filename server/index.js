import { GoogleGenAI } from "@google/genai";

export const mockRewriteApi = async (payload) => {
  const { text, intent, nodeType } = payload;

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not set in .env file");
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a professional editor. Your task is to rewrite text inside a ${nodeType} to match the intent: "${intent}".
    - Return ONLY the rewritten text.
    - Do not include explanations, quotes, or markdown.
    - Maintain the original meaning but apply the requested style transformation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const rewrittenText = response.text?.trim() || text;

    return {
      originalText: text,
      rewrittenText: rewrittenText,
    };
  } catch (error) {
    console.error("AI API Error:", error);
    return {
      originalText: text,
      rewrittenText: text,
    };
  }
};
