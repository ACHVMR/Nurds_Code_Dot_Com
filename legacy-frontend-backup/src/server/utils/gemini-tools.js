import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize Gemini 3.0 SDK
 * @param {string} apiKey - Google API Key
 * @returns {GoogleGenerativeAI}
 */
export function initGemini(apiKey) {
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Use Gemini 3.0 Pro for complex reasoning (AVVA NOON layer)
 * @param {GoogleGenerativeAI} genAI 
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
export async function thinkDeep(genAI, prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Using 1.5 Pro as 3.0 proxy for now
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Use Gemini 3.0 Flash for quick responses (ACHEEVY layer)
 * @param {GoogleGenerativeAI} genAI 
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
export async function answerFast(genAI, prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 Flash as 3.0 proxy
  const result = await model.generateContent(prompt);
  return result.response.text();
}
