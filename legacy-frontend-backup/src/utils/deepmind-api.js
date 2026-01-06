/**
 * DeepMind API Client
 * Frontend utility for interacting with Gemini, RAG, Security, and Design endpoints
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * ACHEEVY Chat - Uses Gemini 3.0 Flash with energy-aware responses
 * @param {string} message 
 * @param {string} department - 'home' | 'settings' | 'deploy' | 'testing-lab' | 'vibe'
 * @param {string} energyMode - 'TEACHER' | 'PROFESSIONAL' | 'FOCUSED' | 'JOVIAL'
 * @param {Array} history - Previous messages
 * @returns {Promise<{response: string, model: string, energy: string}>}
 */
export async function sendChat(message, department = 'home', energyMode = 'TEACHER', history = []) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, department, energyMode, history })
  });
  if (!res.ok) throw new Error('Chat request failed');
  return res.json();
}

/**
 * Gemini Deep Think - Uses Gemini 3.0 Pro for complex reasoning
 * @param {string} prompt 
 * @returns {Promise<{reasoning: string, model: string}>}
 */
export async function thinkDeep(prompt) {
  const res = await fetch(`${API_BASE}/api/gemini/think`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error('Think request failed');
  return res.json();
}

/**
 * Gemini Fast Answer - Uses Gemini 3.0 Flash for quick responses
 * @param {string} prompt 
 * @returns {Promise<{response: string, model: string}>}
 */
export async function answerFast(prompt) {
  const res = await fetch(`${API_BASE}/api/gemini/fast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error('Fast answer request failed');
  return res.json();
}

/**
 * RAG Document Search
 * @param {string} query 
 * @param {string} department 
 * @returns {Promise<{answer: string, sources: string[]}>}
 */
export async function searchDocs(query, department = 'general') {
  const res = await fetch(`${API_BASE}/api/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, department })
  });
  if (!res.ok) throw new Error('RAG search failed');
  return res.json();
}

/**
 * RAG Document Upload
 * @param {File} file 
 * @param {string} name 
 * @param {string} department 
 * @returns {Promise<{success: boolean, file_uri: string}>}
 */
export async function uploadDoc(file, name, department = 'general') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('department', department);
  
  const res = await fetch(`${API_BASE}/api/rag/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('RAG upload failed');
  return res.json();
}

/**
 * Security Audit - CodeMender
 * @param {string} code 
 * @returns {Promise<{vulnerabilities: Array, patchedCode: string}>}
 */
export async function auditCode(code) {
  const res = await fetch(`${API_BASE}/api/security/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!res.ok) throw new Error('Security audit failed');
  return res.json();
}

/**
 * Design Generation - Nano Banana Pro
 * @param {string} prompt 
 * @param {string} style - 'ui-mockup' | 'icon' | 'photorealistic' | 'abstract'
 * @returns {Promise<{image_url: string, refined_prompt: string}>}
 */
export async function generateDesign(prompt, style = 'ui-mockup') {
  const res = await fetch(`${API_BASE}/api/design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style })
  });
  if (!res.ok) throw new Error('Design generation failed');
  return res.json();
}

export default {
  sendChat,
  thinkDeep,
  answerFast,
  searchDocs,
  uploadDoc,
  auditCode,
  generateDesign
};
