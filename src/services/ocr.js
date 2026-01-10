/**
 * OCR Service - Extract text/code from images
 * Uses Cloudflare AI Vision models for text extraction
 *
 * Use cases:
 * - Extract code from screenshots
 * - Clone projects from images
 * - Read handwritten notes
 * - Extract text from documents
 */

import { useState } from 'react';
import { fetchAuthed } from '../utils/fetchAuthed.js';

/**
 * Extract text from image using Cloudflare AI
 * @param {File|string} imageSource - File object or URL
 * @param {Object} options
 * @param {string} options.mode - 'code' | 'text' | 'handwriting'
 * @param {string} options.language - Language hint (e.g., 'javascript', 'python')
 * @returns {Promise<{text: string, confidence: number, metadata: Object}>}
 */
export async function extractTextFromImage(imageSource, options = {}) {
  const {
    mode = 'code',
    language = 'auto',
    enhanceQuality = true
  } = options;

  try {
    // Convert File to base64 if needed
    let imageData;
    if (imageSource instanceof File) {
      imageData = await fileToBase64(imageSource);
    } else if (typeof imageSource === 'string') {
      // URL - fetch and convert
      imageData = await urlToBase64(imageSource);
    } else {
      throw new Error('Invalid image source');
    }

    // Call Worker OCR endpoint
    const response = await fetchAuthed('/api/ai/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageData,
        mode,
        language,
        enhanceQuality
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OCR failed');
    }

    const result = await response.json();
    return {
      text: result.text,
      confidence: result.confidence || 0.85,
      metadata: result.metadata || {},
      language: result.detectedLanguage || language
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw error;
  }
}

/**
 * Extract code specifically with syntax detection
 * @param {File|string} imageSource
 * @returns {Promise<{code: string, language: string, confidence: number}>}
 */
export async function extractCodeFromImage(imageSource) {
  const result = await extractTextFromImage(imageSource, {
    mode: 'code',
    language: 'auto'
  });

  // Post-process: detect language if auto
  const detectedLanguage = detectProgrammingLanguage(result.text);

  return {
    code: result.text,
    language: detectedLanguage || result.language,
    confidence: result.confidence,
    metadata: result.metadata
  };
}

/**
 * Create a new project from screenshot
 * @param {File} imageFile - Screenshot with code
 * @returns {Promise<{code: string, language: string, projectName: string}>}
 */
export async function cloneProjectFromScreenshot(imageFile) {
  // Extract code
  const extracted = await extractCodeFromImage(imageFile);

  // Generate project name based on detected content
  const projectName = generateProjectName(extracted.code, extracted.language);

  // Create file structure suggestion
  const suggestedFiles = suggestFileStructure(extracted.code, extracted.language);

  return {
    code: extracted.code,
    language: extracted.language,
    projectName,
    suggestedFiles,
    confidence: extracted.confidence
  };
}

/**
 * Batch OCR - process multiple images
 * @param {File[]} imageFiles
 * @returns {Promise<Array>}
 */
export async function batchExtractText(imageFiles, options = {}) {
  const results = await Promise.all(
    imageFiles.map(file => extractTextFromImage(file, options))
  );

  return results.map((result, index) => ({
    fileName: imageFiles[index].name,
    ...result
  }));
}

// ============= Helper Functions =============

/**
 * Convert File to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert URL to base64
 */
async function urlToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return fileToBase64(blob);
}

/**
 * Detect programming language from code text
 */
function detectProgrammingLanguage(code) {
  const signatures = {
    javascript: [/const\s+\w+\s*=/, /function\s+\w+/, /=>\s*{/, /import\s+.*from/, /export\s+(default|const)/],
    typescript: [/interface\s+\w+/, /type\s+\w+\s*=/, /:\s*(string|number|boolean)/, /<.*>/],
    python: [/def\s+\w+/, /import\s+\w+/, /from\s+\w+\s+import/, /if\s+__name__\s*==/, /:\s*$/m],
    java: [/public\s+class/, /private\s+\w+/, /System\.out\.println/, /public\s+static\s+void/],
    cpp: [/#include\s*</, /std::/, /int\s+main\s*\(/, /cout\s*<</],
    rust: [/fn\s+main/, /let\s+mut/, /impl\s+\w+/, /use\s+std::/],
    go: [/package\s+main/, /func\s+main/, /fmt\.Print/, /import\s+\(/],
    ruby: [/def\s+\w+/, /end\s*$/, /puts\s+/, /require\s+/],
    php: [/<\?php/, /\$\w+\s*=/, /function\s+\w+/, /echo\s+/],
    swift: [/func\s+\w+/, /var\s+\w+/, /let\s+\w+/, /import\s+\w+/],
    kotlin: [/fun\s+main/, /val\s+\w+/, /var\s+\w+/, /import\s+/],
    csharp: [/using\s+System/, /namespace\s+/, /public\s+class/, /Console\.Write/],
    html: [/<html/, /<div/, /<body/, /<head/],
    css: [/\.\w+\s*{/, /#\w+\s*{/, /@media/, /:\s*\w+;/],
    sql: [/SELECT\s+.*FROM/, /INSERT\s+INTO/, /CREATE\s+TABLE/, /WHERE\s+/i],
    shell: [/#!/, /\$\(/, /echo\s+/, /export\s+/],
    dockerfile: [/FROM\s+/, /RUN\s+/, /COPY\s+/, /CMD\s+/],
    yaml: [/---/, /:\s*$/, /^\s+-\s+/, /version:\s*/],
    json: [/^\s*{/, /^\s*\[/, /"\w+":\s*/]
  };

  for (const [lang, patterns] of Object.entries(signatures)) {
    const matches = patterns.filter(pattern => pattern.test(code)).length;
    if (matches >= 2) {
      return lang;
    }
  }

  return 'plaintext';
}

/**
 * Generate project name from code content
 */
function generateProjectName(code, language) {
  // Look for common project identifiers
  const packageNameMatch = code.match(/package\.json.*"name":\s*"([^"]+)"/s);
  if (packageNameMatch) return packageNameMatch[1];

  const classNameMatch = code.match(/class\s+(\w+)/);
  if (classNameMatch) return classNameMatch[1].toLowerCase();

  const funcNameMatch = code.match(/function\s+(\w+)/);
  if (funcNameMatch) return funcNameMatch[1];

  // Default
  return `${language}-project-${Date.now()}`;
}

/**
 * Suggest file structure based on code
 */
function suggestFileStructure(code, language) {
  const files = [];

  // Language-specific file suggestions
  const extensions = {
    javascript: '.js',
    typescript: '.ts',
    python: '.py',
    java: '.java',
    cpp: '.cpp',
    rust: '.rs',
    go: '.go',
    ruby: '.rb',
    php: '.php',
    swift: '.swift',
    kotlin: '.kt',
    csharp: '.cs',
    html: '.html',
    css: '.css',
    sql: '.sql',
    shell: '.sh',
    dockerfile: 'Dockerfile',
    yaml: '.yaml',
    json: '.json'
  };

  const ext = extensions[language] || '.txt';

  // Main file
  files.push({
    path: language === 'python' ? 'main.py' : language === 'java' ? 'Main.java' : `index${ext}`,
    content: code,
    type: 'main'
  });

  // Check for package.json content
  if (code.includes('package.json')) {
    files.push({
      path: 'package.json',
      content: extractJsonBlock(code, 'package.json'),
      type: 'config'
    });
  }

  // Check for README content
  if (code.includes('# ') || code.includes('## ')) {
    files.push({
      path: 'README.md',
      content: extractMarkdownBlock(code),
      type: 'docs'
    });
  }

  return files;
}

function extractJsonBlock(code, filename) {
  const regex = new RegExp(`${filename}.*?({[\\s\\S]*?})`, 's');
  const match = code.match(regex);
  return match ? match[1] : '{}';
}

function extractMarkdownBlock(code) {
  const lines = code.split('\n');
  const mdLines = lines.filter(line => line.trim().startsWith('#'));
  return mdLines.join('\n');
}

/**
 * React hook for OCR operations
 */
export function useOCR() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const extractText = async (imageSource, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const extracted = await extractTextFromImage(imageSource, options);
      setResult(extracted);
      return extracted;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractCode = async (imageSource) => {
    setLoading(true);
    setError(null);

    try {
      const extracted = await extractCodeFromImage(imageSource);
      setResult(extracted);
      return extracted;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cloneProject = async (imageFile) => {
    setLoading(true);
    setError(null);

    try {
      const project = await cloneProjectFromScreenshot(imageFile);
      setResult(project);
      return project;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    extractText,
    extractCode,
    cloneProject,
    loading,
    error,
    result
  };
}
