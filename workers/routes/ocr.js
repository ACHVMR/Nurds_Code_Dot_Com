/**
 * ============================================
 * OCR Routes - Code Extraction from Images
 * ============================================
 * 
 * Uses Cloudflare AI Vision for OCR
 * Supports code extraction, language detection
 */

import { Router } from 'itty-router';
import { jsonResponse } from '../utils/responses.js';
import { badRequest, serverError } from '../utils/errors.js';

export const ocrRouter = Router({ base: '/api/ai/ocr' });

// Supported programming languages for detection
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
  'html', 'css', 'sql', 'shell', 'bash', 'powershell',
  'dockerfile', 'yaml', 'json', 'markdown', 'xml'
];

/**
 * POST /api/ai/ocr - Extract text/code from image
 */
ocrRouter.post('/', async (request, env) => {
  try {
    const body = await request.json();
    const { image, mode = 'code', language = 'auto', enhanceQuality = true } = body;

    if (!image) {
      return badRequest('Image is required (base64 or URL)');
    }

    // Prepare image for Cloudflare AI
    let imageData;
    if (image.startsWith('data:')) {
      // Base64 data URL
      const base64 = image.split(',')[1];
      imageData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    } else if (image.startsWith('http')) {
      // URL - fetch the image
      const response = await fetch(image);
      imageData = new Uint8Array(await response.arrayBuffer());
    } else {
      // Assume raw base64
      imageData = Uint8Array.from(atob(image), c => c.charCodeAt(0));
    }

    // Build prompt based on mode
    const prompt = mode === 'code' 
      ? `Extract all code from this image. Return ONLY the code, preserving exact formatting, indentation, and line breaks. Do not add explanations or markdown code blocks.`
      : `Extract all text from this image. Preserve the original formatting and structure.`;

    // Call Cloudflare AI Vision
    const result = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', image: Array.from(imageData) }
          ]
        }
      ],
      max_tokens: 4096,
    });

    const extractedText = result.response || '';

    // Detect language if mode is code
    let detectedLanguage = 'text';
    let confidence = 0.5;

    if (mode === 'code' && extractedText.trim()) {
      const langResult = await detectLanguage(extractedText, env);
      detectedLanguage = langResult.language;
      confidence = langResult.confidence;
    }

    return jsonResponse({
      text: extractedText,
      confidence,
      detectedLanguage,
      metadata: {
        mode,
        model: '@cf/meta/llama-3.2-11b-vision-instruct',
        enhanced: enhanceQuality,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('[OCR] Error:', error);
    return serverError('OCR processing failed: ' + error.message);
  }
});

/**
 * POST /api/ai/ocr/batch - Batch extract from multiple images
 */
ocrRouter.post('/batch', async (request, env) => {
  try {
    const body = await request.json();
    const { images, mode = 'code' } = body;

    if (!images || !Array.isArray(images)) {
      return badRequest('Images array is required');
    }

    if (images.length > 10) {
      return badRequest('Maximum 10 images per batch');
    }

    // Process all images in parallel
    const results = await Promise.all(
      images.map(async (image, index) => {
        try {
          // Reuse single extraction logic
          const response = await ocrRouter.handle(
            new Request('http://localhost/api/ai/ocr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image, mode }),
            }),
            env
          );
          const data = await response.json();
          return { index, success: true, ...data };
        } catch (error) {
          return { index, success: false, error: error.message };
        }
      })
    );

    return jsonResponse({
      results,
      total: images.length,
      successful: results.filter(r => r.success).length,
    });
  } catch (error) {
    console.error('[OCR Batch] Error:', error);
    return serverError('Batch OCR processing failed: ' + error.message);
  }
});

/**
 * POST /api/ai/ocr/project - Clone project from screenshot
 */
ocrRouter.post('/project', async (request, env) => {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return badRequest('Image is required');
    }

    // First extract the code
    const ocrResponse = await ocrRouter.handle(
      new Request('http://localhost/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mode: 'code' }),
      }),
      env
    );
    const ocrResult = await ocrResponse.json();

    if (!ocrResult.text) {
      return badRequest('Could not extract code from image');
    }

    // Generate project structure suggestion
    const projectPrompt = `Based on this code, suggest a project structure:
    
${ocrResult.text}

Return a JSON object with:
- projectName: suggested name
- language: primary language
- suggestedFiles: array of { path, content } for each file
- dependencies: array of package names`;

    const structureResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: projectPrompt }],
      max_tokens: 2048,
    });

    let projectStructure;
    try {
      // Try to parse JSON from response
      const jsonMatch = structureResult.response.match(/\{[\s\S]*\}/);
      projectStructure = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      projectStructure = {
        projectName: 'extracted-project',
        language: ocrResult.detectedLanguage,
        suggestedFiles: [
          { path: `main.${getExtension(ocrResult.detectedLanguage)}`, content: ocrResult.text }
        ],
        dependencies: [],
      };
    }

    return jsonResponse({
      ...projectStructure,
      extractedCode: ocrResult.text,
      confidence: ocrResult.confidence,
    });
  } catch (error) {
    console.error('[OCR Project] Error:', error);
    return serverError('Project extraction failed: ' + error.message);
  }
});

/**
 * Detect programming language from code
 */
async function detectLanguage(code, env) {
  // Pattern-based quick detection
  const patterns = {
    javascript: [/\bfunction\b/, /\bconst\b/, /\blet\b/, /=>/, /\bconsole\.log\b/],
    typescript: [/:\s*(string|number|boolean|any)\b/, /\binterface\b/, /\btype\s+\w+\s*=/],
    python: [/\bdef\b/, /\bimport\b.*\bfrom\b/, /\bclass\b.*:$/, /\bprint\(/],
    java: [/\bpublic\s+class\b/, /\bprivate\b/, /\bstatic\s+void\s+main\b/],
    rust: [/\bfn\b/, /\blet\s+mut\b/, /\bimpl\b/, /\b->\b/],
    go: [/\bfunc\b/, /\bpackage\b/, /\bimport\s*\(/],
    cpp: [/\b#include\b/, /\bstd::/,  /\bint\s+main\b/],
    html: [/<html/i, /<div/i, /<body/i],
    css: [/\{[\s\S]*?:\s*[\s\S]*?\}/],
    sql: [/\bSELECT\b/i, /\bFROM\b/i, /\bWHERE\b/i],
    shell: [/^#!/, /\becho\b/, /\bgrep\b/],
  };

  let maxScore = 0;
  let detected = 'text';

  for (const [lang, langPatterns] of Object.entries(patterns)) {
    const matches = langPatterns.filter(p => p.test(code)).length;
    const score = matches / langPatterns.length;
    if (score > maxScore) {
      maxScore = score;
      detected = lang;
    }
  }

  return {
    language: detected,
    confidence: Math.min(0.95, maxScore + 0.3),
  };
}

/**
 * Get file extension for language
 */
function getExtension(language) {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    rust: 'rs',
    go: 'go',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    ruby: 'rb',
    php: 'php',
    swift: 'swift',
    kotlin: 'kt',
    html: 'html',
    css: 'css',
    sql: 'sql',
    shell: 'sh',
    dockerfile: 'dockerfile',
    yaml: 'yaml',
    json: 'json',
  };
  return extensions[language] || 'txt';
}

export default ocrRouter;
