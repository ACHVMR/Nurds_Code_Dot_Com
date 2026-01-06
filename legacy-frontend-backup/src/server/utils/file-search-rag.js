import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * RAG Utility using Gemini's Native File API
 */
export class FileSearchRAG {
  /**
   * @param {string} apiKey - Google API Key
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error("GOOGLE_API_KEY is missing");
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Search documents and answer query using Gemini 3.0 Pro
   * @param {string} query - User question
   * @param {string} fileUri - URI of the file to search (from upload)
   * @returns {Promise<string>} - The answer
   */
  async searchDocs(query, fileUri) {
    // Use Gemini 3.0 Pro (or 1.5 Pro) for deep understanding of the doc
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro" 
    });
    
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "text/plain", // Defaulting to text/plain for simplicity, adjust based on file
          fileUri: fileUri
        }
      },
      {
        text: `Answer this question using only the provided document. If the answer is not in the document, say "I couldn't find that in the documentation."\n\nQuestion: ${query}`
      }
    ]);
    
    return result.response.text();
  }
}
