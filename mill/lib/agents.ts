// ═══════════════════════════════════════════════════════════════
// Agents - Claude-powered agent roles for the Agentic Mill
// Each agent is Claude with a specialized system prompt and tools
// ═══════════════════════════════════════════════════════════════

import Anthropic from "@anthropic-ai/sdk";
import type { AgentRole, ProjectFile } from "./types";
import type { Workspace } from "./workspace";

const client = new Anthropic();

// ── System Prompts ──────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
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
};

// ── Agent Call Functions ────────────────────────────────────

export async function callOrchestrator(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPTS.orchestrator,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function callArchitect(spec: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPTS.architect,
    messages: [{ role: "user", content: `Project specification:\n${spec}` }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function callCoder(
  spec: string,
  filePath: string,
  purpose: string,
  existingFiles: ProjectFile[]
): Promise<string> {
  const contextStr = existingFiles
    .map((f) => `=== ${f.path} ===\n${f.content}`)
    .join("\n\n");

  const prompt = `Project specification:
${spec}

File to implement: ${filePath}
Purpose: ${purpose}

${existingFiles.length > 0 ? `Already written files for context:\n${contextStr}` : "This is the first file."}

Write the complete content for ${filePath}:`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPTS.coder,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function callReviewer(
  spec: string,
  files: ProjectFile[]
): Promise<string> {
  const filesStr = files
    .map((f) => `=== ${f.path} ===\n${f.content}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPTS.reviewer,
    messages: [
      {
        role: "user",
        content: `Project specification:\n${spec}\n\nProject files:\n${filesStr}`,
      },
    ],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}
