// ═══════════════════════════════════════════════════════════════
// Agents - OpenRouter-powered agent roles for the Agentic Mill
// Supports any OpenRouter-compatible chat model via env config
// ═══════════════════════════════════════════════════════════════

import type { ProjectFile } from "./types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_PRIMARY_MODEL = "openai/gpt-5.4";
const DEFAULT_FALLBACK_MODELS = ["openai/gpt-5.4", "openai/gpt-5.4-mini"];
const REQUEST_TIMEOUT_MS = 120_000;

// ── System Prompts ──────────────────────────────────────────

const SYSTEM_PROMPTS = {
  orchestrator: `You are ACHEEVY, the orchestrator of the Nurds Code Agentic Mill.
Your job: decompose a user's app idea into a concrete project specification.

Given a user prompt, return a JSON object with:
{
  "name": "project-name-kebab-case",
  "description": "One-line description",
  "framework": "nextjs" | "react-vite" | "vanilla" | "astro",
  "features": ["feature1", "feature2", ...],
  "fileStructure": ["src/index.ts", "src/components/App.tsx", ...],
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "outputDir": "dist" | ".next" | "build"
}

Rules:
- Pick the simplest framework that fits the requirements
- Default to react-vite for SPAs, nextjs for full-stack apps, vanilla for simple pages
- Include ALL files needed for a working, deployable project
- Include package.json, tsconfig.json (if TS), index.html, config files
- Be specific about the file structure - every file the project needs
- Respond ONLY with the JSON object, no markdown fencing`,

  architect: `You are Architect_Ang, the system designer for the Nurds Code Agentic Mill.
Your job: take a project specification and design the detailed architecture.

You will be given the project spec and must return a detailed implementation plan as JSON:
{
  "files": [
    {
      "path": "relative/path/to/file",
      "purpose": "What this file does",
      "dependencies": ["other/file.ts"],
      "order": 1
    }
  ],
  "installDeps": ["react", "react-dom", ...],
  "devDeps": ["typescript", "vite", ...],
  "notes": "Any important architectural decisions"
}

Rules:
- Order files by implementation dependency (config first, then types, then components)
- Include EVERY file needed for a complete, working project
- No placeholders, no TODOs - every file must be fully specified
- Respond ONLY with the JSON object`,

  coder: `You are Coding_Ang, the code generator for the Nurds Code Agentic Mill.
You write production-ready code. You will be given:
1. The project specification
2. The file you need to implement (path and purpose)
3. The contents of other files already written (for context)

Rules:
- Write COMPLETE, WORKING code. No placeholders, no "// TODO", no "...".
- Use modern best practices for the framework
- Include all imports
- Handle errors appropriately
- Make it production-ready
- Respond ONLY with the file content, no markdown fencing, no explanation`,

  reviewer: `You are Review_Ang, the code reviewer for the Nurds Code Agentic Mill.
You review generated code for correctness and completeness.

You will be given the full project files. Check for:
1. Missing imports or broken references between files
2. Incomplete implementations (TODOs, placeholders, "...")
3. Type errors or obvious bugs
4. Missing files that other files depend on

Return JSON:
{
  "status": "pass" | "fail",
  "issues": [
    { "file": "path", "line": "description of issue", "fix": "how to fix" }
  ],
  "missingFiles": ["path/to/missing/file"]
}

If status is "pass", issues array should be empty.
Respond ONLY with JSON.`,
} as const;

type AgentRole = keyof typeof SYSTEM_PROMPTS;

export interface AgentCallOptions {
  modelOverride?: string;
  fallbackModelsOverride?: string[];
}

type OpenRouterMessageContent = string | Array<{ type?: string; text?: string }>;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: OpenRouterMessageContent;
    };
  }>;
};

function parseModelList(csv: string | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

function resolveModelRouting(role: AgentRole, options?: AgentCallOptions) {
  const roleKey = `OPENROUTER_MODEL_${role.toUpperCase()}`;
  const roleSpecificModel = process.env[roleKey];
  const primaryModel = options?.modelOverride ?? roleSpecificModel ?? process.env.OPENROUTER_MODEL ?? DEFAULT_PRIMARY_MODEL;

  const fallbackModels = Array.from(
    new Set([
      primaryModel,
      ...(options?.fallbackModelsOverride ?? parseModelList(process.env.OPENROUTER_MODELS)),
      ...DEFAULT_FALLBACK_MODELS,
    ])
  );

  return { primaryModel, fallbackModels };
}

function extractContent(data: OpenRouterResponse): string {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (item?.type === "text" ? item.text ?? "" : ""))
      .join("")
      .trim();
  }

  return "";
}

async function callModel({
  role,
  userPrompt,
  maxTokens,
  options,
}: {
  role: AgentRole;
  userPrompt: string;
  maxTokens: number;
  options?: AgentCallOptions;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const { primaryModel, fallbackModels } = resolveModelRouting(role, options);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "Nurds Agentic Mill",
    },
    body: JSON.stringify({
      model: primaryModel,
      models: fallbackModels,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[role] },
        { role: "user", content: userPrompt },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  return extractContent(data);
}

// ── Agent Call Functions ────────────────────────────────────

export async function callOrchestrator(prompt: string, options?: AgentCallOptions): Promise<string> {
  return callModel({ role: "orchestrator", userPrompt: prompt, maxTokens: 4096, options });
}

export async function callArchitect(spec: string, options?: AgentCallOptions): Promise<string> {
  return callModel({
    role: "architect",
    userPrompt: `Project specification:\n${spec}`,
    maxTokens: 8192,
    options,
  });
}

export async function callCoder(
  spec: string,
  filePath: string,
  purpose: string,
  existingFiles: ProjectFile[],
  options?: AgentCallOptions
): Promise<string> {
  const contextStr = existingFiles.map((f) => `=== ${f.path} ===\n${f.content}`).join("\n\n");

  const prompt = `Project specification:
${spec}

File to implement: ${filePath}
Purpose: ${purpose}

${existingFiles.length > 0 ? `Already written files for context:\n${contextStr}` : "This is the first file."}

Write the complete content for ${filePath}:`;

  return callModel({ role: "coder", userPrompt: prompt, maxTokens: 8192, options });
}

export async function callReviewer(spec: string, files: ProjectFile[], options?: AgentCallOptions): Promise<string> {
  const filesStr = files.map((f) => `=== ${f.path} ===\n${f.content}`).join("\n\n");

  return callModel({
    role: "reviewer",
    userPrompt: `Project specification:\n${spec}\n\nProject files:\n${filesStr}`,
    maxTokens: 4096,
    options,
  });
}
